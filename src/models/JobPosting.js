const db = require('../db/pool');

const FIELDS = ['title', 'company', 'city', 'description', 'user_id'];

const inMemoryJobs = [];
let nextId = 1;

function pick(data) {
  const out = {};
  for (const f of FIELDS) {
    if (data[f] === undefined) continue;
    if (f === 'user_id') {
      out[f] = data[f] !== '' && data[f] !== null ? Number(data[f]) : null;
    } else {
      out[f] = data[f] !== null ? String(data[f]).trim() : '';
    }
  }
  return out;
}

// Rules per Board 1 Item 2:
// - title: required, max 120 characters
// - company: required
// - city, description: optional
function validate(data, { partial }) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (!data.title || data.title === '') {
      errors.push('title is required');
    } else if (data.title.length > 120) {
      errors.push('title must not exceed 120 characters');
    }
  }

  if (!partial || data.company !== undefined) {
    if (!data.company || data.company === '') {
      errors.push('company is required');
    }
  }

  if (data.user_id !== undefined && data.user_id !== null) {
    if (!Number.isInteger(data.user_id)) {
      errors.push('user_id must be an integer');
    }
  }

  return errors;
}

const JobPosting = {
  async all(filters = {}) {
    try {
      if (filters.user_id) {
        const res = await db.query(
          'SELECT * FROM job_postings WHERE user_id = $1 ORDER BY id ASC',
          [Number(filters.user_id)]
        );
        return res.rows;
      }
      const res = await db.query('SELECT * FROM job_postings ORDER BY id ASC');
      return res.rows;
    } catch {
      if (filters.user_id) {
        return inMemoryJobs.filter((j) => j.user_id === Number(filters.user_id));
      }
      return inMemoryJobs;
    }
  },

  async find(id) {
    try {
      const res = await db.query('SELECT * FROM job_postings WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    } catch {
      return inMemoryJobs.find((j) => j.id === Number(id)) || null;
    }
  },

  async create(data) {
    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    const title = clean.title;
    const company = clean.company;
    const city = clean.city || null;
    const description = clean.description || null;
    const userId = clean.user_id || null;

    try {
      const res = await db.query(
        'INSERT INTO job_postings (title, company, city, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [title, company, city, description, userId]
      );
      return { job: res.rows[0] };
    } catch (err) {
      // In-memory fallback
      const job = {
        id: nextId++,
        title,
        company,
        city,
        description,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      inMemoryJobs.push(job);
      return { job };
    }
  },

  async update(id, data) {
    const job = await this.find(id);
    if (!job) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    try {
      const res = await db.query(
        'UPDATE job_postings SET title = $1, company = $2, city = $3, description = $4, user_id = $5 WHERE id = $6 RETURNING *',
        [clean.title, clean.company, clean.city || null, clean.description || null, clean.user_id || null, Number(id)]
      );
      return { job: res.rows[0] };
    } catch {
      Object.assign(job, clean);
      return { job };
    }
  },

  async partialUpdate(id, data) {
    const job = await this.find(id);
    if (!job) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: true });
    if (errors.length) return { errors };

    const keys = Object.keys(clean);
    if (keys.length === 0) return { job };

    try {
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = [...keys.map((k) => clean[k]), Number(id)];
      const res = await db.query(
        `UPDATE job_postings SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return { job: res.rows[0] };
    } catch {
      Object.assign(job, clean);
      return { job };
    }
  },

  async delete(id) {
    try {
      const res = await db.query('DELETE FROM job_postings WHERE id = $1', [Number(id)]);
      return res.rowCount > 0;
    } catch {
      const idx = inMemoryJobs.findIndex((j) => j.id === Number(id));
      if (idx === -1) return false;
      inMemoryJobs.splice(idx, 1);
      return true;
    }
  },
};

module.exports = JobPosting;
