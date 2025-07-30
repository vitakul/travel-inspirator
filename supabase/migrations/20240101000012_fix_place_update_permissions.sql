-- Fix place update permissions for route editing
-- Allow family members to update places that are used in their family's routes

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Place creators can update their places" ON places;

-- Create a more permissive policy for route editing
CREATE POLICY "Family members can update family places or route places" ON places
FOR UPDATE
USING (
  -- Original creator can always update
  (auth.uid() = created_by AND is_family_member(family_id, auth.uid()))
  OR
  -- Family members can update places used in their family's routes
  (
    is_family_member(family_id, auth.uid()) AND
    EXISTS (
      SELECT 1 FROM route_places rp
      JOIN routes r ON rp.route_id = r.id
      WHERE rp.place_id = places.id
      AND r.family_id = places.family_id
      AND is_family_member(r.family_id, auth.uid())
    )
  )
);