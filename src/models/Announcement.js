const db = require('../db/pool');

const FIELDS = ['title', 'content', 'author', 'category'];

const inMemoryAnnouncements = [];
let nextId = 1;

function pick(data) {
  const out = {};
  for (const f of FIELDS) {
    if (data[f] === undefined) continue;
    out[f] = String(data[f]).trim();
  }
  return out;
}

function validate(data, { partial }) {
  const errors = [];
  for (const f of FIELDS) {
    const missing = data[f] === undefined || data[f] === '';
    if (f !== 'category' && missing && !partial) {
      errors.push(`${f} is required`);
    }
  }
  return errors;
}

const Announcement = {
  async all() {
    try {
      const res = await db.query('SELECT * FROM announcements ORDER BY id ASC');
      return res.rows;
    } catch {
      return inMemoryAnnouncements;
    }
  },

  async find(id) {
    try {
      const res = await db.query('SELECT * FROM announcements WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    } catch {
      return inMemoryAnnouncements.find((a) => a.id === Number(id)) || null;
    }
  },

  async create(data) {
    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    const category = clean.category || 'General';

    try {
      const res = await db.query(
        'INSERT INTO announcements (title, content, author, category) VALUES ($1, $2, $3, $4) RETURNING *',
        [clean.title, clean.content, clean.author, category]
      );
      return { announcement: res.rows[0] };
    } catch {
      const announcement = {
        id: nextId++,
        ...clean,
        category,
        created_at: new Date().toISOString().split('T')[0],
      };
      inMemoryAnnouncements.push(announcement);
      return { announcement };
    }
  },

  async update(id, data) {
    const announcement = await this.find(id);
    if (!announcement) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    try {
      const res = await db.query(
        'UPDATE announcements SET title = $1, content = $2, author = $3, category = $4 WHERE id = $5 RETURNING *',
        [clean.title, clean.content, clean.author, clean.category || 'General', Number(id)]
      );
      return { announcement: res.rows[0] };
    } catch {
      Object.assign(announcement, clean);
      return { announcement };
    }
  },

  async partialUpdate(id, data) {
    const announcement = await this.find(id);
    if (!announcement) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: true });
    if (errors.length) return { errors };

    const keys = Object.keys(clean);
    if (keys.length === 0) return { announcement };

    try {
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = [...keys.map((k) => clean[k]), Number(id)];
      const res = await db.query(
        `UPDATE announcements SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return { announcement: res.rows[0] };
    } catch {
      Object.assign(announcement, clean);
      return { announcement };
    }
  },

  async delete(id) {
    try {
      const res = await db.query('DELETE FROM announcements WHERE id = $1', [Number(id)]);
      return res.rowCount > 0;
    } catch {
      const idx = inMemoryAnnouncements.findIndex((a) => a.id === Number(id));
      if (idx === -1) return false;
      inMemoryAnnouncements.splice(idx, 1);
      return true;
    }
  },
};

module.exports = Announcement;
