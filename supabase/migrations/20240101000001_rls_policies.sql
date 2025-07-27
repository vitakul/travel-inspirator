-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.family_groups enable row level security;
alter table public.family_members enable row level security;
alter table public.places enable row level security;
alter table public.routes enable row level security;
alter table public.route_places enable row level security;
alter table public.photos enable row level security;

-- Helper function to check if user is family member
create or replace function is_family_member(family_group_id uuid, user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.family_members 
    where group_id = family_group_id and user_id = user_id
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user is family admin
create or replace function is_family_admin(family_group_id uuid, user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.family_members 
    where group_id = family_group_id 
    and user_id = user_id 
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Users policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- Family groups policies
create policy "Family members can view their groups" on public.family_groups
  for select using (
    exists (
      select 1 from public.family_members 
      where group_id = id and user_id = auth.uid()
    )
  );

create policy "Users can create family groups" on public.family_groups
  for insert with check (auth.uid() = admin_id);

create policy "Family admins can update their groups" on public.family_groups
  for update using (
    exists (
      select 1 from public.family_members 
      where group_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Family admins can delete their groups" on public.family_groups
  for delete using (
    exists (
      select 1 from public.family_members 
      where group_id = id and user_id = auth.uid() and role = 'admin'
    )
  );

-- Family members policies
create policy "Family members can view group membership" on public.family_members
  for select using (
    user_id = auth.uid() or 
    exists (
      select 1 from public.family_members fm 
      where fm.group_id = group_id and fm.user_id = auth.uid()
    )
  );

create policy "Family admins can manage membership" on public.family_members
  for all using (
    exists (
      select 1 from public.family_members fm 
      where fm.group_id = group_id and fm.user_id = auth.uid() and fm.role = 'admin'
    )
  );

create policy "Users can join families they're invited to" on public.family_members
  for insert with check (user_id = auth.uid());

-- Places policies
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

-- Routes policies
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

-- Route places policies
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

-- Photos policies
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