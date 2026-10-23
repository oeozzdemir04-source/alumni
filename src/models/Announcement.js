// In-memory Announcement model (no database connection yet; the database arrives in week 5).
const FIELDS = ['title', 'content', 'author', 'category'];

// Shared in-memory data store, used by both /announcements and /api/announcements.
const announcements = [];
let nextId = 1;

function pick(data) {
  const out = {};
  for (const f of FIELDS) {
    if (data[f] === undefined) continue;
    out[f] = String(data[f]).trim();
  }
  return out;
}

// AnnouncementCreate: title, content, author required. AnnouncementUpdate: any subset of the fields.
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
  all: () => announcements,

  find: (id) => announcements.find((a) => a.id === Number(id)) || null,

  create(data) {
    const clean = pick(data);
    const errors = validate(clean, { partial: false });
    if (errors.length) return { errors };
    const announcement = {
      id: nextId++,
      ...clean,
      category: clean.category || 'General',
      created_at: new Date().toISOString().split('T')[0],
    };
    announcements.push(announcement);
    return { announcement };
  },

  // PUT: replace all fields.
  update: (id, data) => apply(id, data, false),

  // PATCH: change only the fields that were sent.
  partialUpdate: (id, data) => apply(id, data, true),

  delete(id) {
    const index = announcements.findIndex((a) => a.id === Number(id));
    if (index === -1) return false;
    announcements.splice(index, 1);
    return true;
  },
};

function apply(id, data, partial) {
  const announcement = Announcement.find(id);
  if (!announcement) return { notFound: true };
  const clean = pick(data);
  const errors = validate(clean, { partial });
  if (errors.length) return { errors };
  Object.assign(announcement, clean);
  return { announcement };
}

module.exports = Announcement;

