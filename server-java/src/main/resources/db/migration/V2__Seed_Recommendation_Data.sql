-- Flyway Migration: V2__Seed_Recommendation_Data
-- Description: Initial seed data for collaborative filtering recommendation system
-- Version: 1.0.1
-- Date: 2026-05-22
-- Author: NexaSphere Core Team
--
-- This migration adds test data for the recommendation engine:
-- - 5 user profiles with interests
-- - 10 events with tags
-- - Event participation history for collaborative filtering

-- Seed Users (Profiles)
INSERT INTO "Profile" (id, interests) VALUES
  ('101', '["Web", "Design", "React", "Frontend"]'::jsonb),
  ('user_2', '["AI", "Machine Learning", "Python"]'::jsonb),
  ('user_3', '["Cybersecurity", "Networking"]'::jsonb),
  ('user_4', '["Design", "Figma", "UI/UX"]'::jsonb),
  ('user_5', '["Web", "Backend", "NodeJS", "Databases"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed Events
INSERT INTO "Events" (id, name, tags, status) VALUES
  ('evt_1', 'React Frontend Masterclass', '["Web", "React", "Frontend", "JavaScript"]'::jsonb, 'upcoming'),
  ('evt_2', 'Advanced Figma Prototyping', '["Design", "Figma", "UI/UX"]'::jsonb, 'upcoming'),
  ('evt_3', 'AI for Beginners', '["AI", "Machine Learning", "Python"]'::jsonb, 'upcoming'),
  ('evt_4', 'Fullstack Web Bootcamp', '["Web", "React", "NodeJS", "Backend"]'::jsonb, 'upcoming'),
  ('evt_5', 'Ethical Hacking Workshop', '["Cybersecurity", "Networking", "Security"]'::jsonb, 'upcoming'),
  ('evt_6', 'Web Design Fundamentals', '["Web", "Design", "CSS", "Frontend"]'::jsonb, 'upcoming'),
  ('evt_7', 'Deep Learning Symposium', '["AI", "Machine Learning", "Data Science"]'::jsonb, 'upcoming'),
  ('evt_8', 'Cloud Architecture 101', '["Backend", "Cloud", "AWS"]'::jsonb, 'upcoming'),
  ('evt_9', 'UX Research Methods', '["Design", "UI/UX", "Research"]'::jsonb, 'upcoming'),
  ('evt_10', 'Hackathon: Future Web', '["Web", "Hackathon", "Frontend", "Backend"]'::jsonb, 'upcoming')
ON CONFLICT DO NOTHING;

-- Seed Event Participations
-- Similar users to 101 are user_4 (Design) and user_5 (Web)
INSERT INTO event_participants (user_id, event_id) VALUES
  ('user_4', 'evt_2'),
  ('user_4', 'evt_6'),
  ('user_5', 'evt_4'),
  ('user_5', 'evt_10'),
  ('user_2', 'evt_3'),
  ('user_2', 'evt_7'),
  ('user_3', 'evt_5')
ON CONFLICT DO NOTHING;
