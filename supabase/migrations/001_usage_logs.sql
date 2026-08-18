-- Usage Logs table for token tracking (supplements Step 1 schema)
-- Run after schema.sql in the Supabase SQL Editor

create table if not exists public.usage_logs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  date date not null,
  tokens_used bigint not null default 0,
  created_at timestamptz not null default now(),
  unique(org_id, date)
);

create index if not exists idx_usage_logs_org_date on public.usage_logs(org_id, date);

-- RLS
alter table public.usage_logs enable row level security;

create policy "usage_logs_select_org" on public.usage_logs
  for select using (org_id = public.get_user_org_id());

create policy "usage_logs_insert_org" on public.usage_logs
  for insert with check (org_id = public.get_user_org_id());

create policy "usage_logs_update_org" on public.usage_logs
  for update using (org_id = public.get_user_org_id());

-- Add to realtime publication
alter publication supabase_realtime add table public.usage_logs;
