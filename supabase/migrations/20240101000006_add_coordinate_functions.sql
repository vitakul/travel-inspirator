-- Add functions to extract coordinates from PostGIS geometry

-- Function to get places with extracted coordinates
create or replace function get_places_with_coordinates()
returns table (
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
  latitude double precision,
  longitude double precision
) as $$
begin
  return query
  select 
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
    st_y(p.location) as latitude,
    st_x(p.location) as longitude
  from places p
  order by p.created_at desc;
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function get_places_with_coordinates() to authenticated;