-- Migration: Remove location_id from infringements table
-- Officers will enter location data directly (latitude, longitude, address)

-- Step 1: Add address column if it doesn't exist
ALTER TABLE infringements 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Step 2: Add latitude and longitude if they don't exist
ALTER TABLE infringements 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Step 3: Migrate existing location_id data to address (if you want to preserve)
-- Copy location name to address field for existing records
UPDATE infringements i
SET address = l.name,
    latitude = l.latitude,
    longitude = l.longitude
FROM locations l
WHERE i.location_id = l.id
  AND i.location_id IS NOT NULL
  AND (i.address IS NULL OR i.address = '');

-- Step 4: Drop the foreign key constraint
ALTER TABLE infringements 
DROP CONSTRAINT IF EXISTS infringements_location_id_fkey;

-- Step 5: Drop the location_id column
ALTER TABLE infringements 
DROP COLUMN IF EXISTS location_id;

-- Step 6: Add comment to document the change
COMMENT ON COLUMN infringements.latitude IS 'GPS latitude coordinate entered by officer';
COMMENT ON COLUMN infringements.longitude IS 'GPS longitude coordinate entered by officer';
COMMENT ON COLUMN infringements.address IS 'Street address or location description entered by officer';
