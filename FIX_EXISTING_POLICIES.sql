-- =====================================================
-- COJJ GADGETS - FIX EXISTING POLICIES
-- =====================================================
-- Run this to fix the "policy already exists" error

-- Drop existing admin policies that might be causing conflicts
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Recreate the is_admin function (in case it needs updating)
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

-- Recreate admin policies for orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete all orders" ON orders
    FOR DELETE USING (is_admin());

-- Recreate admin policies for user_profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (is_admin());

SELECT 'Policies fixed successfully! Now run the main setup script.' as status;
