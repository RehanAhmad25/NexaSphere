/* Migration: Create Initial Schema
   Description: Baseline schema for NexaSphere PostgreSQL database
   Version: 1.0.0
   Date: 2026-05-22
   Author: NexaSphere Core Team

   Tables:
   - admin_sessions: Administrative session management with JWT
   - events: Core team events and knowledge sharing sessions
   - activity_events: Activity-based sub-events with metadata
   - core_team_members: Core team member profiles
   - form_submissions: User form submissions for various processes
   - (Recommendation engine tables: Profile, Events, event_participants)
*/

exports.up = (pgm) => {
  // Create pgcrypto extension for UUID support
  pgm.sql(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Table 1: admin_sessions
  pgm.createTable('admin_sessions', {
    token_hash: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    username: {
      type: 'text',
      notNull: true,
    },
    metadata: {
      type: 'jsonb',
      notNull: true,
      default: '{}',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    last_seen_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    revoked_at: {
      type: 'timestamptz',
    },
  });

  pgm.createIndex('admin_sessions', 'expires_at', { name: 'idx_admin_sessions_expires_at' });
  pgm.createIndex('admin_sessions', 'revoked_at', { name: 'idx_admin_sessions_revoked_at' });

  // Table 2: events
  pgm.createTable('events', {
    id: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: true,
    },
    short_name: {
      type: 'text',
    },
    date_text: {
      type: 'text',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'upcoming',
    },
    icon: {
      type: 'text',
      default: '📌',
    },
    tags: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Table 3: activity_events
  pgm.createTable('activity_events', {
    id: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    activity_key: {
      type: 'text',
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: true,
    },
    date_text: {
      type: 'text',
      notNull: true,
    },
    tagline: {
      type: 'text',
    },
    description: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'completed',
    },
    created_by_name: {
      type: 'text',
    },
    created_by_email: {
      type: 'text',
    },
    created_by_phone: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex(
    'activity_events',
    ['activity_key', 'created_at'],
    {
      name: 'idx_activity_events_key_created',
      direction: { created_at: 'DESC' },
    }
  );

  // Table 4: core_team_members
  pgm.createTable('core_team_members', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'text',
      notNull: true,
    },
    role: {
      type: 'text',
      notNull: true,
    },
    year: {
      type: 'text',
      notNull: true,
    },
    branch: {
      type: 'text',
      notNull: true,
    },
    section: {
      type: 'text',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
    },
    whatsapp: {
      type: 'text',
      notNull: true,
    },
    linkedin: {
      type: 'text',
    },
    instagram: {
      type: 'text',
    },
    photo_url: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Table 5: form_submissions
  pgm.createTable('form_submissions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()'),
    },
    form_type: {
      type: 'text',
      notNull: true,
    },
    full_name: {
      type: 'text',
    },
    college_email: {
      type: 'text',
    },
    whatsapp: {
      type: 'text',
    },
    payload: {
      type: 'jsonb',
      notNull: true,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  // Table 6: Profile (Recommendation Engine)
  pgm.createTable('Profile', {
    id: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    interests: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },
  });

  // Table 7: Events (Duplicate for recommendation engine - can be consolidated later)
  pgm.createTable('Events', {
    id: {
      type: 'text',
      primaryKey: true,
      notNull: true,
    },
    name: {
      type: 'text',
      notNull: true,
    },
    tags: {
      type: 'jsonb',
      notNull: true,
      default: '[]',
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'upcoming',
    },
  });

  // Table 8: event_participants (Collaborative filtering for recommendations)
  pgm.createTable('event_participants', {
    user_id: {
      type: 'text',
      notNull: true,
    },
    event_id: {
      type: 'text',
      notNull: true,
    },
  });

  pgm.addConstraint('event_participants', 'pk_event_participants', {
    primaryKey: ['user_id', 'event_id'],
  });
};

exports.down = (pgm) => {
  // Reverse order: dependencies first, then base tables
  pgm.dropTable('event_participants', { ifExists: true, cascade: true });
  pgm.dropTable('Events', { ifExists: true, cascade: true });
  pgm.dropTable('Profile', { ifExists: true, cascade: true });
  pgm.dropTable('form_submissions', { ifExists: true, cascade: true });
  pgm.dropTable('core_team_members', { ifExists: true, cascade: true });
  pgm.dropTable('activity_events', { ifExists: true, cascade: true });
  pgm.dropTable('events', { ifExists: true, cascade: true });
  pgm.dropTable('admin_sessions', { ifExists: true, cascade: true });
  pgm.sql(`DROP EXTENSION IF EXISTS pgcrypto;`);
};
