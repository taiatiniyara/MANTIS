-- Add description column to infringements table
-- This column stores a short summary of the infringement (auto-generated from vehicle ID, code, and date)
-- while the notes column continues to store detailed information

ALTER TABLE infringements
ADD COLUMN description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN infringements.description IS 'Short summary of the infringement (e.g., "ABC123GP - SPD-01 - Oct 27, 2024")';
