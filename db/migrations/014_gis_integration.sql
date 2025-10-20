-- ============================
-- GIS AND GOOGLE MAPS INTEGRATION
-- ============================
-- This migration adds geographic capabilities to MANTIS
-- Requires PostGIS extension for advanced spatial features

-- ============================
-- ENABLE POSTGIS EXTENSION
-- ============================

-- Enable PostGIS extension for spatial data types and functions
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================
-- ADD COORDINATES TO LOCATIONS
-- ============================

-- Add latitude and longitude columns to locations
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS latitude decimal(10, 8),
ADD COLUMN IF NOT EXISTS longitude decimal(11, 8),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS place_id text, -- Google Place ID
ADD COLUMN IF NOT EXISTS geometry geometry(Point, 4326); -- PostGIS geometry type

-- Update geometry from lat/long (when both are present)
UPDATE locations 
SET geometry = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geometry IS NULL;

-- Create spatial index on locations
CREATE INDEX IF NOT EXISTS idx_locations_geometry ON locations USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(latitude, longitude);

-- Add check constraints for valid coordinates
ALTER TABLE locations
ADD CONSTRAINT check_latitude CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_longitude CHECK (longitude >= -180 AND longitude <= 180);

-- ============================
-- ADD COORDINATES TO INFRINGEMENTS
-- ============================

-- Add location coordinates to infringements (where violation occurred)
ALTER TABLE infringements 
ADD COLUMN IF NOT EXISTS latitude decimal(10, 8),
ADD COLUMN IF NOT EXISTS longitude decimal(11, 8),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS geometry geometry(Point, 4326);

-- Update geometry from lat/long
UPDATE infringements 
SET geometry = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND geometry IS NULL;

-- Create spatial index on infringements
CREATE INDEX IF NOT EXISTS idx_infringements_geometry ON infringements USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_infringements_coordinates ON infringements(latitude, longitude);

-- Add check constraints
ALTER TABLE infringements
ADD CONSTRAINT check_infringement_latitude CHECK (latitude >= -90 AND latitude <= 90),
ADD CONSTRAINT check_infringement_longitude CHECK (longitude >= -180 AND longitude <= 180);

-- ============================
-- ADD ROUTE PATHS
-- ============================

-- Add geographic path to routes (LineString representing the route)
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS route_path geometry(LineString, 4326),
ADD COLUMN IF NOT EXISTS route_distance decimal(10, 2), -- Distance in kilometers
ADD COLUMN IF NOT EXISTS estimated_duration integer; -- Duration in minutes

-- Create spatial index on route paths
CREATE INDEX IF NOT EXISTS idx_routes_path ON routes USING GIST(route_path);

-- ============================
-- CREATE GEOFENCE TABLE
-- ============================

-- Table for defining geographic boundaries/zones
CREATE TABLE IF NOT EXISTS geofences (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) ON DELETE CASCADE,
  name text not null,
  description text,
  boundary geometry(Polygon, 4326) not null, -- Polygon boundary
  type text check (type in ('patrol_zone', 'restricted_zone', 'high_priority_zone', 'custom')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create spatial index on geofences
CREATE INDEX IF NOT EXISTS idx_geofences_boundary ON geofences USING GIST(boundary);
CREATE INDEX IF NOT EXISTS idx_geofences_agency_id ON geofences(agency_id);

-- Add RLS policy for geofences
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view geofences from their agency"
  ON geofences FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE agency_id = geofences.agency_id
    )
  );

-- ============================
-- CREATE GPS TRACKING TABLE
-- ============================

-- Table for storing officer GPS tracking history
CREATE TABLE IF NOT EXISTS gps_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) ON DELETE CASCADE,
  team_id uuid references teams(id) ON DELETE SET NULL,
  route_id uuid references routes(id) ON DELETE SET NULL,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  accuracy decimal(10, 2), -- GPS accuracy in meters
  altitude decimal(10, 2), -- Altitude in meters
  speed decimal(10, 2), -- Speed in km/h
  heading decimal(5, 2), -- Direction in degrees (0-360)
  geometry geometry(Point, 4326),
  tracked_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Create indexes for GPS tracking
CREATE INDEX IF NOT EXISTS idx_gps_tracking_user_id ON gps_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_geometry ON gps_tracking USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_tracked_at ON gps_tracking(tracked_at);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_user_date ON gps_tracking(user_id, tracked_at);

-- Add RLS policy for GPS tracking
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GPS tracking"
  ON gps_tracking FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own GPS tracking"
  ON gps_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================
-- SPATIAL ANALYSIS FUNCTIONS
-- ============================

-- Function to get infringements within a radius (in meters)
CREATE OR REPLACE FUNCTION get_infringements_within_radius(
  center_lat decimal,
  center_lon decimal,
  radius_meters integer
)
RETURNS TABLE (
  id uuid,
  latitude decimal,
  longitude decimal,
  distance_meters decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.latitude,
    i.longitude,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
      i.geometry::geography
    ) as distance_meters
  FROM infringements i
  WHERE i.geometry IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(center_lon, center_lat), 4326)::geography,
      i.geometry::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a point is within a geofence
CREATE OR REPLACE FUNCTION is_within_geofence(
  check_lat decimal,
  check_lon decimal,
  geofence_id uuid
)
RETURNS boolean AS $$
DECLARE
  result boolean;
BEGIN
  SELECT ST_Contains(
    g.boundary,
    ST_SetSRID(ST_MakePoint(check_lon, check_lat), 4326)
  ) INTO result
  FROM geofences g
  WHERE g.id = geofence_id;
  
  RETURN COALESCE(result, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 decimal,
  lon1 decimal,
  lat2 decimal,
  lon2 decimal
)
RETURNS decimal AS $$
BEGIN
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
  ) / 1000; -- Convert meters to kilometers
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get infringement hotspots (clustering)
CREATE OR REPLACE FUNCTION get_infringement_hotspots(
  agency_filter uuid DEFAULT NULL,
  cluster_radius_meters integer DEFAULT 1000,
  min_cluster_size integer DEFAULT 5
)
RETURNS TABLE (
  cluster_id integer,
  center_lat decimal,
  center_lon decimal,
  infringement_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH clustered AS (
    SELECT 
      ST_ClusterDBSCAN(geometry, eps := cluster_radius_meters, minpoints := min_cluster_size) OVER() as cluster_id,
      latitude,
      longitude,
      id
    FROM infringements
    WHERE geometry IS NOT NULL
      AND (agency_filter IS NULL OR agency_id = agency_filter)
  )
  SELECT 
    c.cluster_id::integer,
    AVG(c.latitude) as center_lat,
    AVG(c.longitude) as center_lon,
    COUNT(*) as infringement_count
  FROM clustered c
  WHERE c.cluster_id IS NOT NULL
  GROUP BY c.cluster_id
  ORDER BY infringement_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- TRIGGERS
-- ============================

-- Trigger to automatically update geometry when lat/long changes on locations
CREATE OR REPLACE FUNCTION update_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_geometry
  BEFORE INSERT OR UPDATE OF latitude, longitude ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_location_geometry();

-- Trigger to automatically update geometry when lat/long changes on infringements
CREATE OR REPLACE FUNCTION update_infringement_geometry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_infringement_geometry
  BEFORE INSERT OR UPDATE OF latitude, longitude ON infringements
  FOR EACH ROW
  EXECUTE FUNCTION update_infringement_geometry();

-- Trigger to automatically update geometry when lat/long changes on GPS tracking
CREATE OR REPLACE FUNCTION update_gps_geometry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gps_geometry
  BEFORE INSERT OR UPDATE OF latitude, longitude ON gps_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_gps_geometry();

-- ============================
-- COMMENTS
-- ============================

COMMENT ON COLUMN locations.latitude IS 'Latitude coordinate (WGS84)';
COMMENT ON COLUMN locations.longitude IS 'Longitude coordinate (WGS84)';
COMMENT ON COLUMN locations.geometry IS 'PostGIS point geometry for spatial queries';
COMMENT ON COLUMN locations.place_id IS 'Google Maps Place ID for location';

COMMENT ON COLUMN infringements.latitude IS 'Latitude where infringement occurred';
COMMENT ON COLUMN infringements.longitude IS 'Longitude where infringement occurred';
COMMENT ON COLUMN infringements.geometry IS 'PostGIS point geometry for spatial analysis';

COMMENT ON TABLE geofences IS 'Geographic boundaries for patrol zones and restricted areas';
COMMENT ON TABLE gps_tracking IS 'Real-time GPS tracking history for officers';

-- ============================
-- VERIFICATION QUERIES
-- ============================

/*
-- Check locations with coordinates
SELECT 
  l.id,
  l.name,
  l.latitude,
  l.longitude,
  l.address,
  ST_AsText(l.geometry) as geometry_wkt
FROM locations l
WHERE l.geometry IS NOT NULL
LIMIT 10;

-- Check infringements with coordinates
SELECT 
  i.id,
  i.latitude,
  i.longitude,
  i.address,
  ST_AsText(i.geometry) as geometry_wkt
FROM infringements i
WHERE i.geometry IS NOT NULL
LIMIT 10;

-- Test distance calculation
SELECT calculate_distance(
  -18.1416, 178.4419, -- Suva, Fiji
  -17.7934, 177.4467  -- Nadi, Fiji
) as distance_km;

-- Get infringement hotspots
SELECT * FROM get_infringement_hotspots(NULL, 1000, 3);

-- Check GPS tracking
SELECT 
  gt.id,
  u.full_name,
  gt.latitude,
  gt.longitude,
  gt.speed,
  gt.tracked_at
FROM gps_tracking gt
JOIN users u ON gt.user_id = u.id
ORDER BY gt.tracked_at DESC
LIMIT 10;
*/
