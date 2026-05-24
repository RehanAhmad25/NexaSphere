"""Create initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-05-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create initial PostgreSQL schema for NexaSphere
    
    Tables:
    - admin_sessions: Administrative session management with JWT
    - events: Core team events and knowledge sharing sessions
    - activity_events: Activity-based sub-events with metadata
    - core_team_members: Core team member profiles
    - form_submissions: User form submissions for various processes
    - Profile, Events, event_participants: Recommendation engine tables
    """
    
    # Create pgcrypto extension for UUID support
    op.execute('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    # Table 1: admin_sessions
    op.create_table(
        'admin_sessions',
        sa.Column('token_hash', sa.Text(), nullable=False),
        sa.Column('username', sa.Text(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('token_hash')
    )
    op.create_index('idx_admin_sessions_expires_at', 'admin_sessions', ['expires_at'])
    op.create_index('idx_admin_sessions_revoked_at', 'admin_sessions', ['revoked_at'])

    # Table 2: events
    op.create_table(
        'events',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('short_name', sa.Text(), nullable=True),
        sa.Column('date_text', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.Text(), nullable=False, server_default='upcoming'),
        sa.Column('icon', sa.Text(), nullable=True, server_default='📌'),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_events_status', 'events', ['status'])
    op.create_index('idx_events_created_at', 'events', ['created_at'], postgresql_using='btree')

    # Table 3: activity_events
    op.create_table(
        'activity_events',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('activity_key', sa.Text(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('date_text', sa.Text(), nullable=False),
        sa.Column('tagline', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.Text(), nullable=False, server_default='completed'),
        sa.Column('created_by_name', sa.Text(), nullable=True),
        sa.Column('created_by_email', sa.Text(), nullable=True),
        sa.Column('created_by_phone', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_activity_events_key_created', 'activity_events', ['activity_key', 'created_at'], postgresql_using='btree')
    op.create_index('idx_activity_events_email', 'activity_events', ['created_by_email'])

    # Table 4: core_team_members
    op.create_table(
        'core_team_members',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('role', sa.Text(), nullable=False),
        sa.Column('year', sa.Text(), nullable=False),
        sa.Column('branch', sa.Text(), nullable=False),
        sa.Column('section', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=False),
        sa.Column('whatsapp', sa.Text(), nullable=False),
        sa.Column('linkedin', sa.Text(), nullable=True),
        sa.Column('instagram', sa.Text(), nullable=True),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_core_team_email', 'core_team_members', ['email'])
    op.create_index('idx_core_team_role', 'core_team_members', ['role'])
    op.create_index('idx_core_team_created_at', 'core_team_members', ['created_at'], postgresql_using='btree')

    # Table 5: form_submissions
    op.create_table(
        'form_submissions',
        sa.Column('id', sa.UUID(), nullable=False, server_default=sa.func.gen_random_uuid()),
        sa.Column('form_type', sa.Text(), nullable=False),
        sa.Column('full_name', sa.Text(), nullable=True),
        sa.Column('college_email', sa.Text(), nullable=True),
        sa.Column('whatsapp', sa.Text(), nullable=True),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_form_submissions_form_type', 'form_submissions', ['form_type'])
    op.create_index('idx_form_submissions_email', 'form_submissions', ['college_email'])
    op.create_index('idx_form_submissions_created_at', 'form_submissions', ['created_at'], postgresql_using='btree')

    # Table 6: Profile (Recommendation Engine)
    op.create_table(
        'Profile',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('interests', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_profile_created_at', 'Profile', ['created_at'])

    # Table 7: Events (Duplicate for recommendation engine)
    op.create_table(
        'Events',
        sa.Column('id', sa.Text(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('tags', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('status', sa.Text(), nullable=False, server_default='upcoming'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_events_rec_status', 'Events', ['status'])

    # Table 8: event_participants (Collaborative filtering)
    op.create_table(
        'event_participants',
        sa.Column('user_id', sa.Text(), nullable=False),
        sa.Column('event_id', sa.Text(), nullable=False),
        sa.Column('participated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['Profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['Events.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'event_id')
    )
    op.create_index('idx_event_participants_user', 'event_participants', ['user_id'])
    op.create_index('idx_event_participants_event', 'event_participants', ['event_id'])


def downgrade() -> None:
    """
    Rollback: Drop all tables in reverse dependency order
    """
    op.drop_index('idx_event_participants_event', table_name='event_participants')
    op.drop_index('idx_event_participants_user', table_name='event_participants')
    op.drop_table('event_participants')
    
    op.drop_index('idx_events_rec_status', table_name='Events')
    op.drop_table('Events')
    
    op.drop_index('idx_profile_created_at', table_name='Profile')
    op.drop_table('Profile')
    
    op.drop_index('idx_form_submissions_created_at', table_name='form_submissions')
    op.drop_index('idx_form_submissions_email', table_name='form_submissions')
    op.drop_index('idx_form_submissions_form_type', table_name='form_submissions')
    op.drop_table('form_submissions')
    
    op.drop_index('idx_core_team_created_at', table_name='core_team_members')
    op.drop_index('idx_core_team_role', table_name='core_team_members')
    op.drop_index('idx_core_team_email', table_name='core_team_members')
    op.drop_table('core_team_members')
    
    op.drop_index('idx_activity_events_email', table_name='activity_events')
    op.drop_index('idx_activity_events_key_created', table_name='activity_events')
    op.drop_table('activity_events')
    
    op.drop_index('idx_events_created_at', table_name='events')
    op.drop_index('idx_events_status', table_name='events')
    op.drop_table('events')
    
    op.drop_index('idx_admin_sessions_revoked_at', table_name='admin_sessions')
    op.drop_index('idx_admin_sessions_expires_at', table_name='admin_sessions')
    op.drop_table('admin_sessions')
    
    op.execute('DROP EXTENSION IF EXISTS pgcrypto')
