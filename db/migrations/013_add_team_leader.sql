-- ============================
-- ADD TEAM LEADER AND ROUTE LOCATIONS SUPPORT
-- ============================
-- This migration adds:
-- 1. leader_id to teams table
-- 2. full_name to users table
-- 3. start_location_id and end_location_id to routes table

-- ============================
-- USERS TABLE UPDATES
-- ============================

-- Add full_name column to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name text;

-- Populate full_name from auth.users raw_user_meta_data if available
-- Otherwise use the email username
UPDATE users u
SET full_name = COALESCE(
  au.raw_user_meta_data->>'full_name',
  SPLIT_PART(au.email, '@', 1)
)
FROM auth.users au
WHERE u.id = au.id AND u.full_name IS NULL;

-- ============================
-- TEAMS TABLE UPDATES
-- ============================

-- Add leader_id column to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS leader_id uuid REFERENCES users(id) ON DELETE SET NULL;

-- ============================
-- ROUTES TABLE UPDATES
-- ============================

-- Add start_location_id and end_location_id columns to routes table
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS start_location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS end_location_id uuid REFERENCES locations(id) ON DELETE SET NULL;

-- Migrate existing location_id to start_location_id
UPDATE routes 
SET start_location_id = location_id 
WHERE start_location_id IS NULL AND location_id IS NOT NULL;

-- ============================
-- INDEXES
-- ============================

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_routes_start_location_id ON routes(start_location_id);
CREATE INDEX IF NOT EXISTS idx_routes_end_location_id ON routes(end_location_id);

-- ============================
-- COMMENTS
-- ============================

-- Add comments for documentation
COMMENT ON COLUMN users.full_name IS 'Full name of the user';
COMMENT ON COLUMN teams.leader_id IS 'User ID of the team leader (optional)';
COMMENT ON COLUMN routes.start_location_id IS 'Starting location of the route';
COMMENT ON COLUMN routes.end_location_id IS 'Ending location of the route (optional)';

-- ============================
-- VERIFICATION QUERIES
-- ============================
-- Uncomment to verify the changes:

/*
-- Check teams with leaders
SELECT 
  t.id,
  t.name as team_name,
  t.agency_id,
  t.leader_id,
  u.full_name as leader_name,
  u.position as leader_position
FROM teams t
LEFT JOIN users u ON t.leader_id = u.id
ORDER BY t.name;

-- Check routes with locations
SELECT 
  r.id,
  r.name as route_name,
  r.agency_id,
  sl.name as start_location,
  el.name as end_location
FROM routes r
LEFT JOIN locations sl ON r.start_location_id = sl.id
LEFT JOIN locations el ON r.end_location_id = el.id
ORDER BY r.name;

-- Check all users with full names
SELECT 
  u.id,
  u.full_name,
  u.position,
  u.role,
  au.email
FROM users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.full_name;
*/
