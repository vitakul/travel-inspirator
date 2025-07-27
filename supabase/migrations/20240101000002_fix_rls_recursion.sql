-- Fix infinite recursion in family_members RLS policies

-- Drop all policies that depend on helper functions first
drop policy if exists "Family members can view group membership" on public.family_members;
drop policy if exists "Family admins can manage membership" on public.family_members;
drop policy if exists "Users can join families they're invited to" on public.family_members;

-- Drop policies on places table that use helper functions
drop policy if exists "Family members can view family places" on public.places;
drop policy if exists "Family members can create places" on public.places;
drop policy if exists "Place creators can update their places" on public.places;
drop policy if exists "Place creators can delete their places" on public.places;

-- Drop policies on routes table that use helper functions
drop policy if exists "Family members can view family routes" on public.routes;
drop policy if exists "Family members can create routes" on public.routes;
drop policy if exists "Route creators can update their routes" on public.routes;
drop policy if exists "Route creators can delete their routes" on public.routes;

-- Drop policies on route_places table that use helper functions
drop policy if exists "Users can view route places if they can view the route" on public.route_places;
drop policy if exists "Route creators can manage route places" on public.route_places;

-- Drop policies on photos table that use helper functions
drop policy if exists "Users can view photos if they can view the place" on public.photos;
drop policy if exists "Family members can upload photos to family places" on public.photos;
drop policy if exists "Photo creators can delete their photos" on public.photos;

-- Now drop the helper functions
drop function if exists is_family_member(uuid, uuid);
drop function if exists is_family_admin(uuid, uuid);

-- Recreate family_members policies without recursion
create policy "Users can view their own memberships" on public.family_members
  for select using (user_id = auth.uid());

create policy "Family group admins can manage membership" on public.family_members
  for all using (
    exists (
      select 1 from public.family_groups 
      where id = group_id and admin_id = auth.uid()
    )
  );

create policy "Users can join families" on public.family_members
  for insert with check (user_id = auth.uid());

-- Recreate helper functions without recursion
-- These functions are simplified to avoid RLS policy recursion
create or replace function is_family_member(family_group_id uuid, check_user_id uuid)
returns boolean as $$
begin
  -- Direct query without RLS to avoid recursion
  return exists (
    select 1 from family_members 
    where group_id = family_group_id and user_id = check_user_id
  );
end;
$$ language plpgsql security definer;

create or replace function is_family_admin(family_group_id uuid, check_user_id uuid)
returns boolean as $$
begin
  -- Check admin via family_groups table to avoid recursion
  return exists (
    select 1 from family_groups 
    where id = family_group_id and admin_id = check_user_id
  );
end;
$$ language plpgsql security definer;

-- Update family_groups policies to use simpler logic
drop policy if exists "Family members can view their groups" on public.family_groups;
drop policy if exists "Family admins can update their groups" on public.family_groups;
drop policy if exists "Family admins can delete their groups" on public.family_groups;

create policy "Users can view groups they belong to" on public.family_groups
  for select using (
    id in (
      select group_id from public.family_members 
      where user_id = auth.uid()
    )
  );

create policy "Group admins can update their groups" on public.family_groups
  for update using (admin_id = auth.uid());

create policy "Group admins can delete their groups" on public.family_groups
  for delete using (admin_id = auth.uid());

-- Recreate places policies using new helper functions
create policy "Family members can view family places" on public.places
  for select using (
    is_family_member(family_id, auth.uid()) or is_public = true
  );

create policy "Family members can create places" on public.places
  for insert with check (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

create policy "Place creators can update their places" on public.places
  for update using (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

create policy "Place creators can delete their places" on public.places
  for delete using (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

-- Recreate routes policies using new helper functions
create policy "Family members can view family routes" on public.routes
  for select using (
    is_family_member(family_id, auth.uid()) or is_public = true
  );

create policy "Family members can create routes" on public.routes
  for insert with check (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

create policy "Route creators can update their routes" on public.routes
  for update using (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

create policy "Route creators can delete their routes" on public.routes
  for delete using (
    auth.uid() = created_by and is_family_member(family_id, auth.uid())
  );

-- Recreate route_places policies using new helper functions
create policy "Users can view route places if they can view the route" on public.route_places
  for select using (
    exists (
      select 1 from public.routes r 
      where r.id = route_id 
      and (is_family_member(r.family_id, auth.uid()) or r.is_public = true)
    )
  );

create policy "Route creators can manage route places" on public.route_places
  for all using (
    exists (
      select 1 from public.routes r 
      where r.id = route_id 
      and r.created_by = auth.uid()
      and is_family_member(r.family_id, auth.uid())
    )
  );

-- Recreate photos policies using new helper functions
create policy "Users can view photos if they can view the place" on public.photos
  for select using (
    exists (
      select 1 from public.places p 
      where p.id = place_id 
      and (is_family_member(p.family_id, auth.uid()) or p.is_public = true)
    )
  );

create policy "Family members can upload photos to family places" on public.photos
  for insert with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.places p 
      where p.id = place_id 
      and is_family_member(p.family_id, auth.uid())
    )
  );

create policy "Photo creators can delete their photos" on public.photos
  for delete using (auth.uid() = created_by);