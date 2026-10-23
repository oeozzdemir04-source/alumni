// In-memory User model (no database connection yet; the database arrives in week 5).
const FIELDS = ['name', 'email', 'graduation_year', 'department'];

// Shared in-memory data store, used by both /users and /api/users.
const users = [];
let nextId = 1;

function pick(data) {
  const out = {};
  for (const f of FIELDS) {
    if (data[f] === undefined) continue;
    out[f] = f === 'graduation_year' ? Number(data[f]) : String(data[f]).trim();
  }
  return out;
}

// UserCreate: all fields required. UserUpdate: any subset of the fields.
function validate(data, { partial }) {
  const errors = [];
  for (const f of FIELDS) {
    const missing = data[f] === undefined || data[f] === '';
    if (missing && !partial) errors.push(`${f} is required`);
    if (missing) continue;
    if (f === 'graduation_year' && !Number.isInteger(data[f])) errors.push('graduation_year must be an integer');
  }
  return errors;
}

const User = {
  all: () => users,

  find: (id) => users.find((u) => u.id === Number(id)) || null,

  create(data) {
    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };
    const user = { id: nextId++, ...clean };
    users.push(user);
    return { user };
  },

  // PUT: replace all fields.
  update: (id, data) => apply(id, data, false),

  // PATCH: change only the fields that were sent.
  partialUpdate: (id, data) => apply(id, data, true),

  delete(id) {
    const index = users.findIndex((u) => u.id === Number(id));
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};

function apply(id, data, partial) {
  const user = User.find(id);
  if (!user) return { notFound: true };
  const clean = pick(data);
  const errors = validate(clean, { partial });
  if (errors.length) return { errors };
  Object.assign(user, clean);
  return { user };
}

module.exports = User;
