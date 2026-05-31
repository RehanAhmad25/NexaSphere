create extension if not exists pgcrypto;

create table if not exists admin_sessions (
  token_hash text primary key,
  username text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

create index if not exists idx_admin_sessions_expires_at on admin_sessions (expires_at);
create index if not exists idx_admin_sessions_revoked_at on admin_sessions (revoked_at);

create table if not exists events (
  id text primary key,
  name text not null,
  short_name text,
  date_text text not null,
  description text not null,
  status text not null default 'upcoming',
  icon text default '📌',
  tags jsonb not null default '[]'::jsonb,
  capacity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references events(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique(event_id, email)
);

create or replace function register_for_event(p_event_id text, p_full_name text, p_email text)
returns json as $$
declare
  v_capacity int;
  v_registered int;
  v_registration_id uuid;
begin
  -- Lock the event row to prevent concurrent race conditions
  select capacity into v_capacity from events where id = p_event_id for update;
  
  if not found then
    raise exception 'Event not found.';
  end if;
  
  if v_capacity is null then
    -- No capacity limit
    v_capacity := 9999999;
  end if;

  select count(*) into v_registered from event_registrations where event_id = p_event_id;

  if v_registered >= v_capacity then
    raise exception 'Event capacity has been reached.';
  end if;

  insert into event_registrations (event_id, full_name, email)
  values (p_event_id, p_full_name, p_email)
  returning id into v_registration_id;

  return json_build_object('ok', true, 'registration_id', v_registration_id);
end;
$$ language plpgsql;

create table if not exists activity_events (
  id text primary key,
  activity_key text not null,
  name text not null,
  date_text text not null,
  tagline text,
  description text not null,
  status text not null default 'completed',
  created_by_name text,
  created_by_email text,
  created_by_phone text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_key_created on activity_events (activity_key, created_at desc);

create table if not exists core_team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  year text not null,
  branch text not null,
  section text not null,
  email text not null,
  whatsapp text not null,
  linkedin text,
  instagram text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  full_name text,
  college_email text,
  whatsapp text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
