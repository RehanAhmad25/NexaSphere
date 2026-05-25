import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { withDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORTFOLIOS_FILE = path.join(__dirname, '..', 'data', 'portfolios.json');

const BCRYPT_ROUNDS = 12;

let schemaReady = null;

async function hashPasskey(passkey) {
  return bcrypt.hash(String(passkey), BCRYPT_ROUNDS);
}

async function verifyHash(passkey, hash) {
  return bcrypt.compare(String(passkey), hash);
}

async function ensureSchema(client) {
  await client.query(`
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
    )
  `);
}

async function ensureReady() {
  if (schemaReady) return schemaReady;
  
  // Check if we can connect to PostgreSQL
  try {
    schemaReady = withDb(async (client) => {
      await ensureSchema(client);
      return true;
    });
    await schemaReady;
  } catch (err) {
    console.warn('PostgreSQL is not configured or not available. Falling back to local file storage for portfolios.', err.message);
    schemaReady = Promise.resolve(false);
  }
  return schemaReady;
}

// Local File Store Helpers
async function ensureLocalFile() {
  const dir = path.dirname(PORTFOLIOS_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(PORTFOLIOS_FILE);
  } catch {
    await fs.writeFile(PORTFOLIOS_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
}

async function readLocalPortfolios() {
  await ensureLocalFile();
  const raw = await fs.readFile(PORTFOLIOS_FILE, 'utf8');
  return JSON.parse(raw);
}

async function writeLocalPortfolios(data) {
  await ensureLocalFile();
  await fs.writeFile(PORTFOLIOS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function mapRow(row) {
  if (!row) return null;
  return {
    username: row.username,
    theme: row.theme,
    visibleSections: typeof row.visible_sections === 'string' ? JSON.parse(row.visible_sections) : row.visible_sections || {},
    socialLinks: typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links || {},
    customDomain: row.custom_domain || '',
    seoMetadata: typeof row.seo_metadata === 'string' ? JSON.parse(row.seo_metadata) : row.seo_metadata || {},
    skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
    badges: typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges || [],
    projects: typeof row.projects === 'string' ? JSON.parse(row.projects) : row.projects || [],
    roadmaps: typeof row.roadmaps === 'string' ? JSON.parse(row.roadmaps) : row.roadmaps || [],
    bio: row.bio || '',
    title: row.title || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const portfolioRepository = {
  async getByUsername(username) {
    const isDbAvailable = await ensureReady();
    const sanitizedUsername = String(username || '').trim().toLowerCase();

    if (isDbAvailable) {
      try {
        return await withDb(async (client) => {
          const { rows } = await client.query(
            'SELECT * FROM portfolios WHERE LOWER(username) = $1',
            [sanitizedUsername]
          );
          if (!rows.length) return null;
          return mapRow(rows[0]);
        });
      } catch (err) {
        console.error('Database query failed. Falling back to local file.', err);
      }
    }

    // Local file fallback
    const portfolios = await readLocalPortfolios();
    const portfolio = portfolios[sanitizedUsername];
    if (!portfolio) return null;
    return {
      username: portfolio.username,
      theme: portfolio.theme,
      visibleSections: portfolio.visibleSections || {},
      socialLinks: portfolio.socialLinks || {},
      customDomain: portfolio.customDomain || '',
      seoMetadata: portfolio.seoMetadata || {},
      skills: portfolio.skills || [],
      badges: portfolio.badges || [],
      projects: portfolio.projects || [],
      roadmaps: portfolio.roadmaps || [],
      bio: portfolio.bio || '',
      title: portfolio.title || '',
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
    };
  },

  async verifyPasskey(username, passkey) {
    const isDbAvailable = await ensureReady();
    const sanitizedUsername = String(username || '').trim().toLowerCase();

    if (isDbAvailable) {
      try {
        return await withDb(async (client) => {
          const { rows } = await client.query(
            'SELECT passkey_hash FROM portfolios WHERE LOWER(username) = $1',
            [sanitizedUsername]
          );
          if (!rows.length) return true; // Username does not exist, so it's a new registration (allow it)
          return await verifyHash(passkey, rows[0].passkey_hash);
        });
      } catch (err) {
        console.error('Database query failed in verifyPasskey. Falling back to local file.', err);
      }
    }

    // Local file fallback
    const portfolios = await readLocalPortfolios();
    const portfolio = portfolios[sanitizedUsername];
    if (!portfolio) return true; // New registration
    return await verifyHash(passkey, portfolio.passkeyHash);
  },

  async createOrUpdate(data) {
    const isDbAvailable = await ensureReady();
    const username = String(data.username || '').trim();
    const sanitizedUsername = username.toLowerCase();
    const passkeyHash = await hashPasskey(data.passkey);

    const theme = data.theme || 'glassmorphic';
    const visibleSections = data.visibleSections || { quests: true, roadmaps: true, projects: true, analytics: false };
    const socialLinks = data.socialLinks || {};
    const customDomain = data.customDomain || '';
    const seoMetadata = data.seoMetadata || {};
    const skills = data.skills || [];
    const badges = data.badges || [];
    const projects = data.projects || [];
    const roadmaps = data.roadmaps || [];
    const bio = data.bio || '';
    const title = data.title || '';

    if (isDbAvailable) {
      try {
        return await withDb(async (client) => {
          const { rows } = await client.query(
            `INSERT INTO portfolios (
              username, passkey_hash, theme, visible_sections, social_links,
              custom_domain, seo_metadata, skills, badges, projects, roadmaps, bio, title, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            ON CONFLICT (username) DO UPDATE SET
              passkey_hash = EXCLUDED.passkey_hash,
              theme = EXCLUDED.theme,
              visible_sections = EXCLUDED.visible_sections,
              social_links = EXCLUDED.social_links,
              custom_domain = EXCLUDED.custom_domain,
              seo_metadata = EXCLUDED.seo_metadata,
              skills = EXCLUDED.skills,
              badges = EXCLUDED.badges,
              projects = EXCLUDED.projects,
              roadmaps = EXCLUDED.roadmaps,
              bio = EXCLUDED.bio,
              title = EXCLUDED.title,
              updated_at = NOW()
            RETURNING *`,
            [
              username, passkeyHash, theme, JSON.stringify(visibleSections), JSON.stringify(socialLinks),
              customDomain, JSON.stringify(seoMetadata), JSON.stringify(skills), JSON.stringify(badges),
              JSON.stringify(projects), JSON.stringify(roadmaps), bio, title
            ]
          );
          return mapRow(rows[0]);
        });
      } catch (err) {
        console.error('Database INSERT/UPDATE failed. Falling back to local file.', err);
      }
    }

    // Local file fallback
    const portfolios = await readLocalPortfolios();
    const now = new Date().toISOString();
    const existing = portfolios[sanitizedUsername] || { createdAt: now };

    const updatedPortfolio = {
      username,
      passkeyHash,
      theme,
      visibleSections,
      socialLinks,
      customDomain,
      seoMetadata,
      skills,
      badges,
      projects,
      roadmaps,
      bio,
      title,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    portfolios[sanitizedUsername] = updatedPortfolio;
    await writeLocalPortfolios(portfolios);

    return {
      username: updatedPortfolio.username,
      theme: updatedPortfolio.theme,
      visibleSections: updatedPortfolio.visibleSections,
      socialLinks: updatedPortfolio.socialLinks,
      customDomain: updatedPortfolio.customDomain,
      seoMetadata: updatedPortfolio.seoMetadata,
      skills: updatedPortfolio.skills,
      badges: updatedPortfolio.badges,
      projects: updatedPortfolio.projects,
      roadmaps: updatedPortfolio.roadmaps,
      bio: updatedPortfolio.bio,
      title: updatedPortfolio.title,
      createdAt: updatedPortfolio.createdAt,
      updatedAt: updatedPortfolio.updatedAt,
    };
  }
};
