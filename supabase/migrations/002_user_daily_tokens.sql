-- Per-user daily token tracking for Creative AI Lab (1000 tokens/day)
-- Run in Supabase SQL Editor after schema.sql

create table if not exists public.user_daily_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  tokens_used bigint not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists idx_user_daily_tokens_user_date on public.user_daily_tokens(user_id, date);

alter table public.user_daily_tokens enable row level security;

create policy "user_daily_tokens_select_own" on public.user_daily_tokens
  for select using (auth.uid() = user_id);

create policy "user_daily_tokens_insert_own" on public.user_daily_tokens
  for insert with check (auth.uid() = user_id);

create policy "user_daily_tokens_update_own" on public.user_daily_tokens
  for update using (auth.uid() = user_id);

alter publication supabase_realtime add table public.user_daily_tokens;
