-- Convert routes to use polygon coverage areas instead of waypoints
-- This better represents patrol coverage zones

-- First, let's add a coverage_area column to routes table
ALTER TABLE routes ADD COLUMN IF NOT EXISTS coverage_area JSONB;

-- Add a comment explaining the structure
COMMENT ON COLUMN routes.coverage_area IS 'Polygon coordinates defining the patrol coverage area. Array of {lat, lng} objects forming a closed polygon.';

-- We can keep the route_waypoints table for now but it won't be used
-- Or drop it if you prefer:
-- DROP TABLE IF EXISTS route_waypoints CASCADE;
