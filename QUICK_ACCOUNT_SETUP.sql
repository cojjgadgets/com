-- =====================================================
-- COJJ GADGETS - QUICK ACCOUNT SETUP
-- =====================================================
-- Run this in your Supabase SQL Editor for the account features

-- =====================================================
-- 1. ADD STATUS COLUMN TO ORDERS TABLE
-- =====================================================

-- Add status column with default value
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- =====================================================
-- 2. UPDATE RLS POLICIES FOR ORDERS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

-- Create new RLS policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE ADMIN ACCESS FUNCTION
-- =====================================================

-- Function to check if user is admin (update email as needed)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@cojjgadgets.com'  -- CHANGE THIS TO YOUR ADMIN EMAIL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for full access (drop existing first)
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
-- 4. VERIFY SETUP
-- =====================================================

-- Check if status column was added
SELECT 'Status column added successfully!' as result
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'status'
);

-- Check RLS policies
SELECT 'RLS policies updated successfully!' as result
WHERE EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'orders' AND policyname = 'Users can view their own orders'
);

SELECT 'Account setup completed! Update the admin email in the is_admin() function.' as status;
