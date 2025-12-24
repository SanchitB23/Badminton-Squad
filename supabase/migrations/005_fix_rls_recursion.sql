-- Fix infinite recursion in profiles RLS policies
-- The super admin policy was causing recursion by querying profiles table within the policy

-- Drop the problematic super admin policy
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;

-- Recreate a simpler super admin policy that doesn't cause recursion
-- We'll use a different approach that doesn't query the profiles table
CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (
    -- Check if the current user has super_admin role directly from auth metadata
    -- or allow if it's the user's own profile (for basic operations)
    auth.uid() = id OR
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'normal_user') = 'super_admin'
  );

-- Alternative: Create a function to check super admin status without recursion
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  -- This avoids recursion by not querying the profiles table
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), 'normal_user') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Even better approach: Drop the complex policy and keep it simple
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;

-- Create a non-recursive super admin policy
CREATE POLICY "Super admins can manage all profiles"
  ON profiles FOR ALL
  USING (is_super_admin() OR auth.uid() = id);