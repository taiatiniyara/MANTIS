-- Add missing RLS policies for super admins to manage routes
-- Super admins should be able to insert, update, and delete routes

-- Super admins can insert routes
CREATE POLICY IF NOT EXISTS "Super admins can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_super_admin());

-- Super admins can update routes
CREATE POLICY IF NOT EXISTS "Super admins can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (auth.is_super_admin());

-- Super admins can delete routes
CREATE POLICY IF NOT EXISTS "Super admins can delete routes"
  ON routes FOR DELETE
  TO authenticated
  USING (auth.is_super_admin());
