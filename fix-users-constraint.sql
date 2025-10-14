-- =====================================================
-- Fix Users Table Constraint
-- =====================================================
-- This script fixes the constraint that prevents central_admin
-- from having a NULL agency_id
--
-- PROBLEM: The current constraint requires ALL non-citizen users 
-- to have an agency, but central_admin should be allowed to have 
-- NULL agency_id since they manage the entire system.
--
-- SOLUTION: Update the constraint to allow central_admin with NULL agency_id

-- Step 1: Drop the old constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_officer_must_have_agency;

-- Step 2: Add the corrected constraint
-- New logic: 
-- - Citizens must have NULL agency_id
-- - Central admins can have NULL agency_id (they oversee all agencies)
-- - Officers and agency_admins must have an agency_id
ALTER TABLE users
ADD CONSTRAINT users_officer_must_have_agency CHECK (
    role IN ('citizen', 'central_admin') OR agency_id IS NOT NULL
);

COMMENT ON CONSTRAINT users_officer_must_have_agency ON users IS 
'Officers and agency admins must have an agency. Central admins and citizens can have NULL agency_id.';

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_officer_must_have_agency';

-- Step 3: If you have any existing central_admins with agencies, 
-- you can optionally update them to have NULL agency_id
-- (Uncomment if needed)
/*
UPDATE users 
SET agency_id = NULL 
WHERE role = 'central_admin' 
AND agency_id IS NOT NULL;
*/

-- Step 4: Verify the fix works
-- This should succeed now:
/*
INSERT INTO users (
    id,
    display_name,
    role,
    agency_id,
    active
) VALUES (
    gen_random_uuid(),
    'Test Central Admin',
    'central_admin',
    NULL,
    true
);

-- Clean up test
DELETE FROM users WHERE display_name = 'Test Central Admin';
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Constraint fixed successfully!';
    RAISE NOTICE '  Central admins can now have NULL agency_id';
    RAISE NOTICE '  Officers and agency_admins still require agency_id';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Re-run create-first-admin-function.sql';
END $$;
