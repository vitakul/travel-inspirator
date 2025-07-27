-- Create enums for route functionality
CREATE TYPE route_difficulty AS ENUM ('easy', 'moderate', 'hard');
CREATE TYPE route_transport AS ENUM ('walking', 'driving', 'cycling', 'public_transport', 'mixed');

-- Add new columns to routes table
ALTER TABLE routes ADD COLUMN estimated_duration INTEGER; -- in minutes
ALTER TABLE routes ADD COLUMN difficulty_level route_difficulty DEFAULT 'easy';
ALTER TABLE routes ADD COLUMN transport_mode route_transport DEFAULT 'walking';
ALTER TABLE routes ADD COLUMN total_distance DECIMAL(10,2); -- in kilometers

-- Add new columns to route_places table for enhanced waypoint functionality
ALTER TABLE route_places ADD COLUMN transport_to_next route_transport;
ALTER TABLE route_places ADD COLUMN notes TEXT;
ALTER TABLE route_places ADD COLUMN estimated_time INTEGER; -- minutes to reach this waypoint from previous

-- Add comments for documentation
COMMENT ON COLUMN routes.estimated_duration IS 'Estimated total duration in minutes';
COMMENT ON COLUMN routes.difficulty_level IS 'Difficulty level of the route';
COMMENT ON COLUMN routes.transport_mode IS 'Primary transport mode for the route';
COMMENT ON COLUMN routes.total_distance IS 'Total distance in kilometers';
COMMENT ON COLUMN route_places.transport_to_next IS 'Transport mode to reach next waypoint';
COMMENT ON COLUMN route_places.notes IS 'User notes for this waypoint';
COMMENT ON COLUMN route_places.estimated_time IS 'Estimated time in minutes to reach this waypoint from previous';

-- Create function to get routes with enhanced data
CREATE OR REPLACE FUNCTION get_routes_with_details()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  created_by uuid,
  family_id uuid,
  is_public boolean,
  estimated_duration integer,
  difficulty_level route_difficulty,
  transport_mode route_transport,
  total_distance decimal,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  waypoint_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.description,
    r.created_by,
    r.family_id,
    r.is_public,
    r.estimated_duration,
    r.difficulty_level,
    r.transport_mode,
    r.total_distance,
    r.created_at,
    r.updated_at,
    COUNT(rp.place_id) as waypoint_count
  FROM routes r
  LEFT JOIN route_places rp ON r.id = rp.route_id
  GROUP BY r.id, r.name, r.description, r.created_by, r.family_id, r.is_public, 
           r.estimated_duration, r.difficulty_level, r.transport_mode, r.total_distance,
           r.created_at, r.updated_at
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get route waypoints with place details
CREATE OR REPLACE FUNCTION get_route_waypoints(route_id uuid)
RETURNS TABLE (
  waypoint_id uuid,
  place_id uuid,
  place_name text,
  place_description text,
  place_category place_category,
  place_rating integer,
  place_location_name text,
  latitude double precision,
  longitude double precision,
  order_index integer,
  transport_to_next route_transport,
  notes text,
  estimated_time integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.id as waypoint_id,
    p.id as place_id,
    p.name as place_name,
    p.description as place_description,
    p.category as place_category,
    p.rating as place_rating,
    p.location_name as place_location_name,
    ST_Y(p.location::geometry) as latitude,
    ST_X(p.location::geometry) as longitude,
    rp.order_index,
    rp.transport_to_next,
    rp.notes,
    rp.estimated_time
  FROM route_places rp
  JOIN places p ON rp.place_id = p.id
  WHERE rp.route_id = get_route_waypoints.route_id
  ORDER BY rp.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_routes_with_details() TO authenticated;
GRANT EXECUTE ON FUNCTION get_route_waypoints(uuid) TO authenticated;