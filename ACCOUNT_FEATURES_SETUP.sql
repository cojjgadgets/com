-- =====================================================
-- COJJ GADGETS - ACCOUNT FEATURES SETUP
-- =====================================================
-- This script sets up the database for customer accounts and order management
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. UPDATE ORDERS TABLE FOR STATUS TRACKING
-- =====================================================

-- Add status column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- =====================================================
-- 2. UPDATE RLS POLICIES FOR ORDERS
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

-- Create comprehensive RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE ADMIN ROLE AND POLICIES
-- =====================================================

-- Create admin role (you'll need to assign this to your admin user)
-- Note: You'll need to manually assign this role to your admin user in Supabase Dashboard

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role
  -- You can modify this to check for specific user IDs or email patterns
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email IN ('admin@cojjgadgets.com', 'your-admin-email@example.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for orders (full access) - drop existing first
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all orders" ON orders
    FOR DELETE USING (is_admin());

-- =====================================================
-- 4. UPDATE USER_PROFILES RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create comprehensive RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies for user_profiles - drop existing first
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (is_admin());

-- =====================================================
-- 5. CREATE ORDER_ITEMS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert order items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admin policies for order_items
CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert order items" ON order_items
    FOR INSERT WITH CHECK (is_admin());

-- =====================================================
-- 6. CREATE AUDIT LOG TABLE (Optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS order_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'created', 'status_updated', 'deleted'
    old_status TEXT,
    new_status TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for audit log
ALTER TABLE order_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their orders" ON order_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_audit_log.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all audit logs" ON order_audit_log
    FOR SELECT USING (is_admin());

-- =====================================================
-- 7. CREATE TRIGGER FOR ORDER STATUS CHANGES
-- =====================================================

-- Function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_audit_log (order_id, user_id, action, old_status, new_status, details)
        VALUES (
            NEW.id,
            auth.uid(),
            'status_updated',
            OLD.status,
            NEW.status,
            jsonb_build_object(
                'updated_at', NOW(),
                'order_number', NEW.order_number
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- 8. CREATE FUNCTION TO GET ORDER STATISTICS
-- =====================================================

CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS TABLE (
    total_orders BIGINT,
    pending_orders BIGINT,
    confirmed_orders BIGINT,
    processing_orders BIGINT,
    shipped_orders BIGINT,
    delivered_orders BIGINT,
    cancelled_orders BIGINT,
    total_revenue DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
    FROM orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;
GRANT SELECT ON order_audit_log TO authenticated;

-- Grant permissions to service role (for admin functions)
GRANT ALL ON orders TO service_role;
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON order_items TO service_role;
GRANT ALL ON order_audit_log TO service_role;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Test queries to verify setup (run these to check if everything works)

-- Check if orders table has status column
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('orders', 'user_profiles', 'order_items');

-- Check if functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('is_admin', 'log_order_status_change', 'get_order_stats');

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Next steps:
-- 1. Update the admin email in the is_admin() function above
-- 2. Test the account page functionality
-- 3. Test the admin order management page
-- 4. Verify RLS policies are working correctly

SELECT 'Account features setup completed successfully!' as status;
