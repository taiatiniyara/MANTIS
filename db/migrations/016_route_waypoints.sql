-- Migration: Add route waypoints table for custom route plotting
-- This allows routes to have multiple waypoints instead of just start/end locations

-- Create route_waypoints table
CREATE TABLE IF NOT EXISTS route_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  waypoint_order INTEGER NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_order CHECK (waypoint_order > 0)
);

-- Create index for faster route waypoint lookups
CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_order ON route_waypoints(route_id, waypoint_order);

-- Add RLS policies for route_waypoints
ALTER TABLE route_waypoints ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins can do everything
CREATE POLICY "super_admins_all_route_waypoints" ON route_waypoints
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Policy: Agency admins can manage their agency's route waypoints
CREATE POLICY "agency_admins_manage_route_waypoints" ON route_waypoints
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN routes ON routes.id = route_waypoints.route_id
      WHERE users.id = auth.uid()
      AND users.role = 'agency_admin'
      AND users.agency_id = routes.agency_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      JOIN routes ON routes.id = route_waypoints.route_id
      WHERE users.id = auth.uid()
      AND users.role = 'agency_admin'
      AND users.agency_id = routes.agency_id
    )
  );

-- Policy: Officers can view their agency's route waypoints
CREATE POLICY "officers_view_route_waypoints" ON route_waypoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      JOIN routes ON routes.id = route_waypoints.route_id
      WHERE users.id = auth.uid()
      AND users.role IN ('officer', 'team_leader')
      AND users.agency_id = routes.agency_id
    )
  );

-- Comment on table
COMMENT ON TABLE route_waypoints IS 'Waypoints that define patrol routes with GPS coordinates';
COMMENT ON COLUMN route_waypoints.waypoint_order IS 'Sequential order of waypoint in the route (1, 2, 3, etc.)';
COMMENT ON COLUMN route_waypoints.name IS 'Optional descriptive name for the waypoint';
