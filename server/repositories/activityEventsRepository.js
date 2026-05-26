import { withDb } from './db.js';

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    date: row.date_text,
    tagline: row.tagline,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const activityEventsRepository = {
  // Returns { rows, total } — rows are the current page, total is the full
  // count for the given activityKey so callers can build pagination metadata.
  async listByActivityKey(activityKey, { page = 1, limit = 20 } = {}) {
    return withDb(async (client) => {
      const offset = (page - 1) * limit;
      const [{ rows }, countResult] = await Promise.all([
        client.query(
          'select * from activity_events where activity_key=$1 order by created_at desc limit $2 offset $3',
          [activityKey, limit, offset],
        ),
        client.query(
          'select count(*)::int as total from activity_events where activity_key=$1',
          [activityKey],
        ),
      ]);
      const total = countResult.rows[0]?.total ?? 0;
      return { rows: rows.map(mapRow), total };
    });
  },

  async create(activityKey, event) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `insert into activity_events (
           id, activity_key, name, date_text, tagline, description, status,
           created_by_name, created_by_email, created_by_phone
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         returning *`,
        [
          event.id,
          activityKey,
          event.name,
          event.date,
          event.tagline,
          event.description,
          event.status,
          event.createdBy?.name || '',
          event.createdBy?.email || '',
          event.createdBy?.phone || '',
        ]
      );
      return mapRow(rows[0]);
    });
  },

  async delete(activityKey, eventId) {
    return withDb(async (client) => {
      const { rowCount } = await client.query(
        'delete from activity_events where activity_key=$1 and id=$2',
        [activityKey, eventId]
      );
      return rowCount > 0;
    });
  },
};
