-- Flyway Migration: V1__Create_Initial_Schema
-- Description: Baseline schema for NexaSphere PostgreSQL database
-- Version: 1.0.0
-- Date: 2026-05-22
-- Author: NexaSphere Core Team
--
-- Tables:
-- - admin_sessions: Administrative session management with JWT
-- - events: Core team events and knowledge sharing sessions
-- - activity_events: Activity-based sub-events with metadata
-- - core_team_members: Core team member profiles
-- - form_submissions: User form submissions for various processes
-- - Profile, Events, event_participants: Recommendation engine tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table 1: admin_sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  username text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT chk_admin_sessions_timestamps CHECK (created_at <= last_seen_at AND last_seen_at <= expires_at)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions (expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_revoked_at ON admin_sessions (revoked_at);

-- Table 2: events
CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text,
  date_text text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'upcoming',
  icon text DEFAULT '📌',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_events_status CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  CONSTRAINT chk_events_updated_at CHECK (updated_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);

-- Table 3: activity_events
CREATE TABLE IF NOT EXISTS activity_events (
  id text PRIMARY KEY,
  activity_key text NOT NULL,
  name text NOT NULL,
  date_text text NOT NULL,
  tagline text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_by_name text,
  created_by_email text,
  created_by_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_activity_events_status CHECK (status IN ('completed', 'upcoming', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_activity_events_key_created ON activity_events (activity_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_email ON activity_events (created_by_email);

-- Table 4: core_team_members
CREATE TABLE IF NOT EXISTS core_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  year text NOT NULL,
  branch text NOT NULL,
  section text NOT NULL,
  email text NOT NULL UNIQUE,
  whatsapp text NOT NULL,
  linkedin text,
  instagram text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_core_team_year CHECK (year IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'))
);

CREATE INDEX IF NOT EXISTS idx_core_team_email ON core_team_members (email);
CREATE INDEX IF NOT EXISTS idx_core_team_role ON core_team_members (role);
CREATE INDEX IF NOT EXISTS idx_core_team_created_at ON core_team_members (created_at DESC);

-- Table 5: form_submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  full_name text,
  college_email text,
  whatsapp text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_form_submissions_type CHECK (form_type IN ('membership', 'core_team', 'recruitment', 'contact'))
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON form_submissions (form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions (college_email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions (created_at DESC);

-- Table 6: Profile (Recommendation Engine)
CREATE TABLE IF NOT EXISTS "Profile" (
  id text PRIMARY KEY,
  interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_created_at ON "Profile" (created_at);

-- Table 7: Events (Duplicate for recommendation engine - can be consolidated later)
CREATE TABLE IF NOT EXISTS "Events" (
  id text PRIMARY KEY,
  name text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_events_rec_status CHECK (status IN ('upcoming', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_events_rec_status ON "Events" (status);

-- Table 8: event_participants (Collaborative filtering for recommendations)
CREATE TABLE IF NOT EXISTS event_participants (
  user_id text NOT NULL,
  event_id text NOT NULL,
  participated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, event_id),
  CONSTRAINT fk_event_participants_profile FOREIGN KEY (user_id) REFERENCES "Profile" (id) ON DELETE CASCADE,
  CONSTRAINT fk_event_participants_events FOREIGN KEY (event_id) REFERENCES "Events" (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants (event_id);

-- Audit trail for migrations
COMMENT ON TABLE admin_sessions IS 'Session tokens for admin authentication with expiration tracking';
COMMENT ON TABLE events IS 'Primary events table for KSS and community events';
COMMENT ON TABLE activity_events IS 'Sub-events for activities (coding, workshops, etc.)';
COMMENT ON TABLE core_team_members IS 'NexaSphere core team member directory';
COMMENT ON TABLE form_submissions IS 'User form submissions for recruitment and membership';
COMMENT ON TABLE "Profile" IS 'User profiles for recommendation engine';
COMMENT ON TABLE "Events" IS 'Events for recommendation engine (can consolidate with events table)';
COMMENT ON TABLE event_participants IS 'Event participation history for collaborative filtering';
