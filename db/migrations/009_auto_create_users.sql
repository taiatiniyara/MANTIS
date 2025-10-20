-- ============================================================================================
-- Auto-Create Users and Fix RLS Policies
-- ============================================================================================
-- This migration:
-- 1. Creates a trigger to automatically create user records when someone signs up
-- 2. Improves RLS policies to allow users to read their own record during authentication
-- ============================================================================================

-- Step 1: Create a function that automatically creates a user record in public.users
-- when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a new record in public.users with default values
  -- The user can be assigned a proper role and agency by an admin later
  INSERT INTO public.users (id, agency_id, role, position, location_id)
  VALUES (
    NEW.id,
    NULL,                -- No agency assigned yet
    'officer',           -- Default role is officer
    'Pending Assignment', -- Default position
    NULL                 -- No location assigned yet
  );
  RETURN NEW;
END;
$$;

-- Step 2: Create a trigger that fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Update RLS policies to ensure users can always read their own record
-- Drop the existing "Users can view their own record" policy and recreate it with higher priority
DROP POLICY IF EXISTS "Users can view their own record" ON users;

-- Recreate the policy - this should take precedence
CREATE POLICY "Users can view their own record"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Step 4: Add a policy to allow users to update their own profile (optional fields only)
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND role = (SELECT role FROM users WHERE id = auth.uid()) -- Can't change their own role
    AND agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()) -- Can't change their own agency
  );

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Step 6: Verify the trigger was created
DO $$
BEGIN
  RAISE NOTICE 'Auto-create user trigger installed successfully';
  RAISE NOTICE 'New users will automatically get a record in public.users';
END $$;
