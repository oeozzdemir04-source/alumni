const db = require('../db/pool');

const FIELDS = ['name', 'email', 'graduation_year', 'department'];

const inMemoryUsers = [];
let nextId = 1;

function pick(data) {
  const out = {};
  for (const f of FIELDS) {
    if (data[f] === undefined) continue;
    out[f] = f === 'graduation_year' ? Number(data[f]) : String(data[f]).trim();
  }
  return out;
}

function validate(data, { partial }) {
  const errors = [];
  for (const f of FIELDS) {
    const missing = data[f] === undefined || data[f] === '';
    if (missing && !partial) errors.push(`${f} is required`);
    if (missing) continue;
    if (f === 'graduation_year' && !Number.isInteger(data[f])) {
      errors.push('graduation_year must be an integer');
    }
  }
  return errors;
}

const User = {
  async all() {
    try {
      const res = await db.query('SELECT * FROM users ORDER BY id ASC');
      return res.rows;
    } catch {
      return inMemoryUsers;
    }
  },

  async find(id) {
    try {
      const res = await db.query('SELECT * FROM users WHERE id = $1', [Number(id)]);
      return res.rows[0] || null;
    } catch {
      return inMemoryUsers.find((u) => u.id === Number(id)) || null;
    }
  },

  async create(data) {
    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    try {
      const res = await db.query(
        'INSERT INTO users (name, email, graduation_year, department) VALUES ($1, $2, $3, $4) RETURNING *',
        [clean.name, clean.email, clean.graduation_year, clean.department]
      );
      return { user: res.rows[0] };
    } catch (err) {
      if (err.code === '23505') {
        return { errors: ['email must be unique'] };
      }
      const user = { id: nextId++, ...clean };
      inMemoryUsers.push(user);
      return { user };
    }
  },

  async update(id, data) {
    const user = await this.find(id);
    if (!user) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };

    try {
      const res = await db.query(
        'UPDATE users SET name = $1, email = $2, graduation_year = $3, department = $4 WHERE id = $5 RETURNING *',
        [clean.name, clean.email, clean.graduation_year, clean.department, Number(id)]
      );
      return { user: res.rows[0] };
    } catch {
      Object.assign(user, clean);
      return { user };
    }
  },

  async partialUpdate(id, data) {
    const user = await this.find(id);
    if (!user) return { notFound: true };

    const clean = pick(data);
    const errors = validate(clean, { partial: true });
    if (errors.length) return { errors };

    const keys = Object.keys(clean);
    if (keys.length === 0) return { user };

    try {
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = [...keys.map((k) => clean[k]), Number(id)];
      const res = await db.query(
        `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return { user: res.rows[0] };
    } catch {
      Object.assign(user, clean);
      return { user };
    }
  },

  async delete(id) {
    try {
      const res = await db.query('DELETE FROM users WHERE id = $1', [Number(id)]);
      return res.rowCount > 0;
    } catch {
      const idx = inMemoryUsers.findIndex((u) => u.id === Number(id));
      if (idx === -1) return false;
      inMemoryUsers.splice(idx, 1);
      return true;
    }
  },
};

module.exports = User;
