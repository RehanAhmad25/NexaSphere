/* Migration: Seed Recommendation Engine Data
   Description: Initial seed data for collaborative filtering recommendation system
   Version: 1.0.1
   Date: 2026-05-22
   Author: NexaSphere Core Team
   
   This migration adds test data for the recommendation engine:
   - 5 user profiles with interests
   - 10 events with tags
   - Event participation history for collaborative filtering
*/

export const up = async (pgm) => {
  // Seed Users (Profiles)
  await pgm.db.query(`
    INSERT INTO "Profile" (id, interests) VALUES
    ('101', '["Web", "Design", "React", "Frontend"]'),
    ('user_2', '["AI", "Machine Learning", "Python"]'),
    ('user_3', '["Cybersecurity", "Networking"]'),
    ('user_4', '["Design", "Figma", "UI/UX"]'),
    ('user_5', '["Web", "Backend", "NodeJS", "Databases"]')
    ON CONFLICT DO NOTHING;
  `);

  // Seed Events
  await pgm.db.query(`
    INSERT INTO "Events" (id, name, tags, status) VALUES
    ('evt_1', 'React Frontend Masterclass', '["Web", "React", "Frontend", "JavaScript"]', 'upcoming'),
    ('evt_2', 'Advanced Figma Prototyping', '["Design", "Figma", "UI/UX"]', 'upcoming'),
    ('evt_3', 'AI for Beginners', '["AI", "Machine Learning", "Python"]', 'upcoming'),
    ('evt_4', 'Fullstack Web Bootcamp', '["Web", "React", "NodeJS", "Backend"]', 'upcoming'),
    ('evt_5', 'Ethical Hacking Workshop', '["Cybersecurity", "Networking", "Security"]', 'upcoming'),
    ('evt_6', 'Web Design Fundamentals', '["Web", "Design", "CSS", "Frontend"]', 'upcoming'),
    ('evt_7', 'Deep Learning Symposium', '["AI", "Machine Learning", "Data Science"]', 'upcoming'),
    ('evt_8', 'Cloud Architecture 101', '["Backend", "Cloud", "AWS"]', 'upcoming'),
    ('evt_9', 'UX Research Methods', '["Design", "UI/UX", "Research"]', 'upcoming'),
    ('evt_10', 'Hackathon: Future Web', '["Web", "Hackathon", "Frontend", "Backend"]', 'upcoming')
    ON CONFLICT DO NOTHING;
  `);

  // Seed Event Participations
  // Similar users to 101 are user_4 (Design) and user_5 (Web)
  await pgm.db.query(`
    INSERT INTO event_participants (user_id, event_id) VALUES
    ('user_4', 'evt_2'),
    ('user_4', 'evt_6'),
    ('user_5', 'evt_4'),
    ('user_5', 'evt_10'),
    ('user_2', 'evt_3'),
    ('user_2', 'evt_7'),
    ('user_3', 'evt_5')
    ON CONFLICT DO NOTHING;
  `);
};

export const down = async (pgm) => {
  // Clear seeded data
  await pgm.db.query(`DELETE FROM event_participants WHERE user_id LIKE 'user_%' OR user_id = '101';`);
  await pgm.db.query(`DELETE FROM "Profile" WHERE id LIKE 'user_%' OR id = '101';`);
  await pgm.db.query(`DELETE FROM "Events" WHERE id LIKE 'evt_%';`);
};
