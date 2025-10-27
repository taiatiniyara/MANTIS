-- Add location_address column to infringements table
-- Migration: 022_add_location_address_to_infringements.sql
-- Description: Adds a text column to store geocoded human-readable addresses for infringement locations

-- Add the location_address column
ALTER TABLE infringements 
ADD COLUMN IF NOT EXISTS location_address TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN infringements.location_address IS 'Human-readable geocoded address (e.g., "Victoria Parade, Suva, Fiji")';

-- Optional: Add index for searching by address
CREATE INDEX IF NOT EXISTS idx_infringements_location_address 
ON infringements USING gin (to_tsvector('english', location_address));

-- Optional: Backfill existing records with reverse geocoding
-- Note: This would require a stored procedure or application-level processing
-- For now, existing records will have NULL location_address

COMMENT ON TABLE infringements IS 'Traffic infringement records with location data including coordinates and optional geocoded addresses';
