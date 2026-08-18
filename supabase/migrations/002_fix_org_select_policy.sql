-- Fix: Allow org owner to SELECT their own organization
-- Without this, there's a deadlock: get_user_org_id() returns NULL until
-- profiles.org_id is set, but you can't read the org to get its ID.

-- Allow owner to always read their own org
create policy "orgs_select_owner" on public.organizations
  for select using (owner_id = auth.uid());
