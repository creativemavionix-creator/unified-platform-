-- ============================================================
-- Mavionix Unified Platform — Complete Supabase Schema
-- Run once in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.plan_tier as enum ('free', 'pro', 'enterprise');
create type public.billing_period as enum ('monthly', 'yearly');
create type public.invoice_status as enum ('paid', 'pending', 'failed');
create type public.subscription_status as enum ('active', 'trialing', 'past_due', 'canceled', 'paused');
create type public.member_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.member_status as enum ('active', 'invited', 'deactivated');
create type public.project_suite as enum ('dev', 'creative', 'business', 'automation');
create type public.project_status as enum ('active', 'completed', 'draft', 'archived');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.task_priority as enum ('low', 'medium', 'high');
create type public.notification_type as enum ('info', 'warning', 'success', 'error');
create type public.notification_suite as enum ('dev', 'creative', 'business', 'automation', 'system');
create type public.activity_type as enum ('dev', 'creative', 'business', 'automation');
create type public.agent_category as enum ('development', 'creative', 'business', 'automation');
create type public.dev_project_type as enum ('website', 'mobile_app', 'saas', 'api', 'backend_service', 'database', 'deployment');
create type public.creative_asset_type as enum ('image', 'video', 'logo', 'brand_identity', 'presentation', 'ui_ux', 'animation', 'voice', 'asset_library');
create type public.business_record_type as enum ('crm_contact', 'hrms_employee', 'deal', 'support_ticket', 'invoice', 'purchase_order', 'inventory_item', 'legal_agreement');
create type public.workflow_trigger_type as enum ('webhook', 'cron', 'form_submit', 'event', 'manual');
create type public.api_key_scope as enum ('read', 'read_write', 'admin');

-- ============================================================
-- 1. ORGANIZATIONS
-- ============================================================

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,  -- references auth.users(id)
  name text not null,
  legal_name text,
  industry text,
  size text,  -- '1-10', '11-50', '51-200', '201+'
  domain text,
  logo_url text,
  logo_initials text default 'ORG',
  email text,
  phone text,
  website text,
  address text,
  country text,
  timezone text default 'UTC',
  currency text default 'USD',
  language text default 'en',
  fiscal_year_start text default 'January',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_owner on public.organizations(owner_id);

-- ============================================================
-- 2. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key,  -- matches auth.users(id)
  org_id uuid references public.organizations(id) on delete set null,
  full_name text,
  display_name text,
  email text,
  phone text,
  title text,
  department text,
  bio text,
  timezone text default 'UTC',
  avatar_url text,
  avatar_initials text,
  linkedin text,
  github text,
  theme text default 'dark',
  accent text default 'signal',
  email_alerts boolean default true,
  in_app_alerts boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_org on public.profiles(org_id);

-- Now add the FK from organizations.owner_id → profiles.id
alter table public.organizations
  add constraint fk_organizations_owner
  foreign key (owner_id) references public.profiles(id) on delete restrict;

-- ============================================================
-- 3. ROLES
-- ============================================================

create table public.roles (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,  -- 'admin', 'developer', 'business', 'viewer', or custom
  description text,
  permissions_projects text default 'none',   -- 'full','edit','view','none'
  permissions_billing text default 'none',
  permissions_settings text default 'none',
  permissions_team text default 'none',
  is_system boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_roles_org on public.roles(org_id);

-- ============================================================
-- 4. TEAM MEMBERS
-- ============================================================

create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  role_id uuid references public.roles(id) on delete set null,
  name text not null,
  email text not null,
  role public.member_role not null default 'viewer',
  department text,
  avatar_url text,
  avatar_initials text,
  status public.member_status not null default 'invited',
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, email)
);

create index idx_team_members_org on public.team_members(org_id);
create index idx_team_members_profile on public.team_members(profile_id);

-- ============================================================
-- 5. PROJECTS
-- ============================================================

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  suite public.project_suite not null,
  type text,  -- e.g. 'Website Build', 'Logo Design', 'CRM Pipeline', 'Workflow'
  status public.project_status not null default 'draft',
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_org on public.projects(org_id);
create index idx_projects_suite on public.projects(suite);

-- ============================================================
-- 6. TASKS
-- ============================================================

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  suite public.project_suite not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  assignee_name text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_org on public.tasks(org_id);
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_assignee on public.tasks(assignee_id);
create index idx_tasks_status on public.tasks(status);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  type public.notification_type not null default 'info',
  suite public.notification_suite not null default 'system',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_org on public.notifications(org_id);
create index idx_notifications_read on public.notifications(read);

-- ============================================================
-- 8. ACTIVITY LOG
-- ============================================================

create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text,
  title text not null,
  description text,
  type public.activity_type not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_activity_log_org on public.activity_log(org_id);
create index idx_activity_log_user on public.activity_log(user_id);
create index idx_activity_log_created on public.activity_log(created_at desc);

-- ============================================================
-- 9. DEV PROJECTS (Website / App / SaaS Builder Items)
-- ============================================================

create table public.dev_projects (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  type public.dev_project_type not null default 'website',
  description text,
  framework text,          -- e.g. 'Next.js', 'React Native', 'Express'
  language text,           -- e.g. 'TypeScript', 'Python'
  repository_url text,
  deploy_url text,
  deploy_status text,      -- 'deployed','building','failed','idle'
  theme text,              -- builder theme choice
  elements jsonb default '[]',  -- page elements / builder state
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_dev_projects_org on public.dev_projects(org_id);
create index idx_dev_projects_type on public.dev_projects(type);

-- ============================================================
-- 10. CREATIVE ASSETS (Image / Video / Logo / Presentation)
-- ============================================================

create table public.creative_assets (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  type public.creative_asset_type not null default 'image',
  description text,
  prompt text,             -- AI generation prompt used
  preset text,            -- style preset (cinematic, flat, etc.)
  file_url text,
  thumbnail_url text,
  file_size bigint,
  mime_type text,
  width int,
  height int,
  duration_seconds numeric,  -- for video/audio/animation
  metadata jsonb default '{}',
  tags text[] default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_creative_assets_org on public.creative_assets(org_id);
create index idx_creative_assets_type on public.creative_assets(type);
create index idx_creative_assets_tags on public.creative_assets using gin(tags);

-- ============================================================
-- 11. BUSINESS RECORDS
--     CRM contacts, HRMS employees, deals, support tickets
-- ============================================================

create table public.business_records (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  record_type public.business_record_type not null,

  -- Common fields
  name text not null,
  email text,
  company text,
  description text,

  -- CRM specific
  stage text,             -- 'Lead','Qualified','Proposal','Negotiation','Won','Lost'
  deal_value numeric(12,2),

  -- HRMS specific
  role_title text,
  department text,
  leave_status text,

  -- Support ticket specific
  subject text,
  priority text,          -- 'critical','high','medium','low'
  ticket_status text,     -- 'open','pending','resolved','closed'

  -- Inventory specific
  sku text,
  quantity int,
  stock_status text,      -- 'in_stock','low_stock','out_of_stock'

  -- Purchase order specific
  vendor text,
  cost numeric(12,2),
  po_status text,         -- 'approved','pending','rejected'

  -- Legal specific
  agreement_type text,    -- 'nda','tos','contract'
  signing_date date,
  legal_status text,      -- 'signed','draft','expired'

  -- Generic metadata
  metadata jsonb default '{}',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_business_records_org on public.business_records(org_id);
create index idx_business_records_type on public.business_records(record_type);
create index idx_business_records_stage on public.business_records(stage);

-- ============================================================
-- 12. AUTOMATION WORKFLOWS
-- ============================================================

create table public.automation_workflows (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default false,
  trigger_type public.workflow_trigger_type not null default 'manual',
  trigger_config jsonb default '{}',  -- endpoint, interval, auth, zone etc.
  run_count int not null default 0,
  success_rate numeric(5,2) default 0,
  last_run_at timestamptz,
  next_run_at timestamptz,
  cron_expression text,
  dag_definition jsonb default '{}',  -- node canvas / visual flow state
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_automation_workflows_org on public.automation_workflows(org_id);
create index idx_automation_workflows_active on public.automation_workflows(is_active);

-- ============================================================
-- 13. AGENTS (Marketplace)
-- ============================================================

create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category public.agent_category not null,
  icon text,
  description text,
  rating numeric(2,1) default 0,
  price text default '0',           -- '0' = free, '19' = $19/mo, etc.
  featured boolean default false,
  tags text[] default '{}',
  publisher text,
  is_published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_agents_category on public.agents(category);
create index idx_agents_featured on public.agents(featured);
create index idx_agents_tags on public.agents using gin(tags);

-- Agent installations per org
create table public.agent_installations (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  installed_by uuid references public.profiles(id) on delete set null,
  status text default 'active',  -- 'active','paused','uninstalled'
  config jsonb default '{}',
  installed_at timestamptz not null default now(),
  unique(org_id, agent_id)
);

create index idx_agent_installations_org on public.agent_installations(org_id);

-- ============================================================
-- 14. SUBSCRIPTIONS
-- ============================================================

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan_tier public.plan_tier not null default 'free',
  status public.subscription_status not null default 'active',
  price numeric(10,2) not null default 0,
  billing_period public.billing_period not null default 'monthly',
  seats_total int not null default 1,
  seats_used int not null default 1,
  tokens_limit bigint not null default 50000,
  tokens_used bigint not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id)
);

create index idx_subscriptions_org on public.subscriptions(org_id);

-- ============================================================
-- 15. BILLING INVOICES
-- ============================================================

create table public.billing_invoices (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  invoice_number text,
  amount numeric(10,2) not null,
  currency text default 'USD',
  status public.invoice_status not null default 'pending',
  billing_date date not null,
  paid_at timestamptz,
  stripe_invoice_id text,
  pdf_url text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_billing_invoices_org on public.billing_invoices(org_id);
create index idx_billing_invoices_status on public.billing_invoices(status);

-- Payment methods
create table public.payment_methods (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  type text not null,       -- 'visa', 'mastercard', 'amex', etc.
  last4 text not null,
  expiry text not null,     -- 'MM/YYYY'
  is_default boolean default true,
  stripe_payment_method_id text,
  created_at timestamptz not null default now()
);

create index idx_payment_methods_org on public.payment_methods(org_id);

-- ============================================================
-- 16. API KEYS
-- ============================================================

create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  key_prefix text not null,         -- first 8 chars for display
  key_hash text not null,           -- bcrypt/sha256 hash of full key
  scope public.api_key_scope not null default 'read',
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked boolean default false,
  created_at timestamptz not null default now()
);

create index idx_api_keys_org on public.api_keys(org_id);

-- ============================================================
-- 17. SESSIONS
-- ============================================================

create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  device text,
  ip_address inet,
  user_agent text,
  last_active_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked boolean default false,
  created_at timestamptz not null default now()
);

create index idx_sessions_user on public.sessions(user_id);
create index idx_sessions_active on public.sessions(last_active_at desc);

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Apply updated_at triggers to all mutable tables
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'organizations','profiles','roles','team_members','projects',
      'tasks','dev_projects','creative_assets','business_records',
      'automation_workflows','agents','agent_installations','subscriptions'
    ])
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.handle_updated_at();', tbl
    );
  end loop;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.team_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.dev_projects enable row level security;
alter table public.creative_assets enable row level security;
alter table public.business_records enable row level security;
alter table public.automation_workflows enable row level security;
alter table public.agents enable row level security;
alter table public.agent_installations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.payment_methods enable row level security;
alter table public.api_keys enable row level security;
alter table public.sessions enable row level security;

-- Helper: get current user's org_id
create or replace function public.get_user_org_id()
returns uuid as $$
  select org_id from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ----------------------------------------------------------
-- PROFILES: users can read/write their own profile
-- ----------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- Users can also view profiles in same org
create policy "profiles_select_same_org" on public.profiles
  for select using (org_id = public.get_user_org_id());

-- ----------------------------------------------------------
-- ORGANIZATIONS: members can view, owners can update
-- ----------------------------------------------------------
create policy "orgs_select_member" on public.organizations
  for select using (id = public.get_user_org_id());

create policy "orgs_update_owner" on public.organizations
  for update using (owner_id = auth.uid());

create policy "orgs_insert_owner" on public.organizations
  for insert with check (owner_id = auth.uid());

-- ----------------------------------------------------------
-- ORG-SCOPED TABLES: read/write for members of same org
-- ----------------------------------------------------------

-- Macro: create standard org-scoped policies
do $$
declare
  tbl text;
begin
  for tbl in
    select unnest(array[
      'roles','team_members','projects','tasks','notifications',
      'activity_log','dev_projects','creative_assets','business_records',
      'automation_workflows','agent_installations','subscriptions',
      'billing_invoices','payment_methods','api_keys'
    ])
  loop
    -- SELECT: same org
    execute format(
      'create policy "%1$s_select_org" on public.%1$I
       for select using (org_id = public.get_user_org_id());', tbl
    );
    -- INSERT: same org
    execute format(
      'create policy "%1$s_insert_org" on public.%1$I
       for insert with check (org_id = public.get_user_org_id());', tbl
    );
    -- UPDATE: same org
    execute format(
      'create policy "%1$s_update_org" on public.%1$I
       for update using (org_id = public.get_user_org_id());', tbl
    );
    -- DELETE: same org
    execute format(
      'create policy "%1$s_delete_org" on public.%1$I
       for delete using (org_id = public.get_user_org_id());', tbl
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------
-- AGENTS: publicly readable (marketplace), writable by admins
-- ----------------------------------------------------------
create policy "agents_select_public" on public.agents
  for select using (is_published = true);

create policy "agents_insert_admin" on public.agents
  for insert with check (true);  -- restrict via application logic / service role

create policy "agents_update_admin" on public.agents
  for update using (true);

-- ----------------------------------------------------------
-- SESSIONS: users can only see/manage their own sessions
-- ----------------------------------------------------------
create policy "sessions_select_own" on public.sessions
  for select using (user_id = auth.uid());

create policy "sessions_insert_own" on public.sessions
  for insert with check (user_id = auth.uid());

create policy "sessions_update_own" on public.sessions
  for update using (user_id = auth.uid());

create policy "sessions_delete_own" on public.sessions
  for delete using (user_id = auth.uid());

-- ============================================================
-- SUPABASE REALTIME (postgres_changes)
-- Enable realtime on specific tables
-- ============================================================

-- Supabase uses the supabase_realtime publication.
-- We add the required tables to it.

drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  public.notifications,
  public.activity_log,
  public.tasks,
  public.projects,
  public.team_members,
  public.roles;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP (auth trigger)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DONE
-- ============================================================
