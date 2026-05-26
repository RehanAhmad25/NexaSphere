/* Migration: Canonicalize Portfolio Usernames
   Description: Repair case-variant portfolio duplicates and enforce case-insensitive uniqueness
   Version: 1.0.2
   Date: 2026-05-26
   Author: NexaSphere Core Team
*/

export const up = async (pgm) => {
  await pgm.db.query(`
    CREATE TABLE IF NOT EXISTS portfolios (
      username VARCHAR(100) PRIMARY KEY,
      passkey_hash VARCHAR(255) NOT NULL,
      theme VARCHAR(50) DEFAULT 'glassmorphic',
      visible_sections JSONB DEFAULT '{"quests": true, "roadmaps": true, "projects": true, "analytics": false}'::jsonb,
      social_links JSONB DEFAULT '{}'::jsonb,
      custom_domain VARCHAR(255),
      seo_metadata JSONB DEFAULT '{}'::jsonb,
      skills JSONB DEFAULT '[]'::jsonb,
      badges JSONB DEFAULT '[]'::jsonb,
      projects JSONB DEFAULT '[]'::jsonb,
      roadmaps JSONB DEFAULT '[]'::jsonb,
      bio TEXT,
      title TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pgm.db.query(`
    CREATE TABLE IF NOT EXISTS portfolio_username_case_duplicates_backup (
      backed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      canonical_username VARCHAR(100) NOT NULL,
      portfolio JSONB NOT NULL
    );
  `);

  await pgm.db.query(`
    WITH duplicate_rows AS (
      SELECT p.*
      FROM portfolios p
      JOIN (
        SELECT LOWER(TRIM(username)) AS canonical_username
        FROM portfolios
        GROUP BY LOWER(TRIM(username))
        HAVING COUNT(*) > 1
      ) duplicates ON LOWER(TRIM(p.username)) = duplicates.canonical_username
    )
    INSERT INTO portfolio_username_case_duplicates_backup (canonical_username, portfolio)
    SELECT LOWER(TRIM(username)), TO_JSONB(duplicate_rows)
    FROM duplicate_rows;
  `);

  await pgm.db.query(`
    WITH ranked AS (
      SELECT
        ctid AS row_id,
        ROW_NUMBER() OVER (
          PARTITION BY LOWER(TRIM(username))
          ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, username ASC
        ) AS rank
      FROM portfolios
    )
    DELETE FROM portfolios p
    USING ranked
    WHERE p.ctid = ranked.row_id
      AND ranked.rank > 1;
  `);

  await pgm.db.query(`
    UPDATE portfolios
    SET username = LOWER(TRIM(username))
    WHERE username <> LOWER(TRIM(username));
  `);

  await pgm.db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_username_lower_unique
    ON portfolios (LOWER(username));
  `);
};

export const down = async (pgm) => {
  await pgm.db.query(`
    DROP INDEX IF EXISTS idx_portfolios_username_lower_unique;
  `);
};
