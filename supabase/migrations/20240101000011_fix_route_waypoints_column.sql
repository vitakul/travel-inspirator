-- Fix get_route_waypoints function - remove non-existent rp.id column

CREATE OR REPLACE FUNCTION get_route_waypoints(route_id_param text)
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
    p.id as waypoint_id, -- Use place_id as waypoint_id since there's no separate ID
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
  WHERE rp.route_id = route_id_param::uuid
  ORDER BY rp.order_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;