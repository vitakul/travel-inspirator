-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Create custom types
create type place_category as enum (
  'monuments',
  'natural_attractions', 
  'other_attractions',
  'restaurants',
  'accommodation'
);

create type family_member_role as enum (
  'admin',
  'member'
);

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Family groups table
create table public.family_groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  admin_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Family members junction table
create table public.family_members (
  group_id uuid references public.family_groups(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role family_member_role default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (group_id, user_id)
);

-- Places table
create table public.places (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location geography(point, 4326) not null,
  category place_category not null,
  rating integer check (rating >= 1 and rating <= 5),
  practical_info jsonb default '{}'::jsonb,
  description text,
  created_by uuid references public.users(id) on delete cascade not null,
  family_id uuid references public.family_groups(id) on delete cascade not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Routes table
create table public.routes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  path geometry(linestring, 4326),
  created_by uuid references public.users(id) on delete cascade not null,
  family_id uuid references public.family_groups(id) on delete cascade not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Route places junction table
create table public.route_places (
  route_id uuid references public.routes(id) on delete cascade,
  place_id uuid references public.places(id) on delete cascade,
  order_index integer not null,
  primary key (route_id, place_id)
);

-- Photos table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  place_id uuid references public.places(id) on delete cascade not null,
  url text not null,
  filename text not null,
  created_by uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index places_location_idx on public.places using gist (location);
create index routes_path_idx on public.routes using gist (path);
create index family_members_group_id_idx on public.family_members (group_id);
create index family_members_user_id_idx on public.family_members (user_id);
create index places_family_id_idx on public.places (family_id);
create index places_created_by_idx on public.places (created_by);
create index routes_family_id_idx on public.routes (family_id);
create index routes_created_by_idx on public.routes (created_by);
create index photos_place_id_idx on public.photos (place_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger update_users_updated_at before update on public.users for each row execute function update_updated_at_column();
create trigger update_family_groups_updated_at before update on public.family_groups for each row execute function update_updated_at_column();
create trigger update_places_updated_at before update on public.places for each row execute function update_updated_at_column();
create trigger update_routes_updated_at before update on public.routes for each row execute function update_updated_at_column();