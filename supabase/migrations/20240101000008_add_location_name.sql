-- Add location_name column to places table for storing human-readable location names
ALTER TABLE places ADD COLUMN location_name TEXT;

-- Add comment to describe the purpose
COMMENT ON COLUMN places.location_name IS 'Human-readable location name from geocoding API for country flag detection';

-- Drop the existing function to change its signature
DROP FUNCTION IF EXISTS get_places_with_coordinates();

-- Create the function with the new signature that includes location_name
CREATE OR REPLACE FUNCTION get_places_with_coordinates()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category place_category,
  rating integer,
  practical_info jsonb,
  is_public boolean,
  family_id uuid,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  location_name text,
  latitude double precision,
  longitude double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.rating,
    p.practical_info,
    p.is_public,
    p.family_id,
    p.created_by,
    p.created_at,
    p.updated_at,
    p.location_name,
    ST_Y(p.location::geometry) AS latitude,
    ST_X(p.location::geometry) AS longitude
  FROM places p
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_places_with_coordinates() TO authenticated;