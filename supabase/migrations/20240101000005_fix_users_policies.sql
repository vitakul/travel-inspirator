-- Fix users table policies and foreign key issues

-- Add missing policies for users table to allow profile access
create policy "Users can view profiles of family members" on public.users
  for select using (
    -- Users can see their own profile
    id = auth.uid() or
    -- Users can see profiles of people in their family groups
    exists (
      select 1 from family_members fm1
      join family_members fm2 on fm1.group_id = fm2.group_id
      where fm1.user_id = auth.uid() and fm2.user_id = id
    )
  );

-- Ensure user records are created automatically when auth user is created
-- This fixes the foreign key constraint issue
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create user record
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();