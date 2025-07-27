-- Fix infinite recursion in family_groups policies

-- Drop the problematic policy that references family_members
drop policy if exists "Users can view groups they belong to" on public.family_groups;

-- Create a simplified policy that only allows users to see groups they admin
-- Family members will access groups through the family_members table instead
create policy "Users can view groups they admin" on public.family_groups
  for select using (admin_id = auth.uid());

-- Allow viewing groups where user is a member via a direct join (non-recursive)
create policy "Users can view groups they are members of" on public.family_groups
  for select using (
    exists (
      select 1 from family_members fm
      where fm.group_id = id and fm.user_id = auth.uid()
    )
  );