const Announcement = require('../models/Announcement');

const notFound = (res) => res.status(404).render('error', { message: 'Announcement not found' });

// Independent controller: full CRUD for announcements under /announcements, connected to database layer
const AnnouncementController = {
  // GET /announcements -> listing (R)
  async list(req, res) {
    const announcements = await Announcement.all();
    res.render('announcements/index', { announcements, errors: [], form: {} });
  },

  // POST /announcements -> creating (C)
  async create(req, res) {
    const { errors } = await Announcement.create(req.body);
    if (errors) {
      const announcements = await Announcement.all();
      return res.status(422).render('announcements/index', {
        announcements,
        errors,
        form: req.body,
      });
    }
    res.redirect(303, '/announcements');
  },

  // GET /announcements/:id -> detail page (R)
  async get(req, res) {
    const announcement = await Announcement.find(req.params.id);
    if (!announcement) return notFound(res);
    res.render('announcements/show', { announcement });
  },

  // GET /announcements/:id/edit -> pre-filled edit form
  async editForm(req, res) {
    const announcement = await Announcement.find(req.params.id);
    if (!announcement) return notFound(res);
    res.render('announcements/edit', { announcement, errors: [] });
  },

  // POST /announcements/:id/edit -> updating (U)
  async update(req, res) {
    const { announcement, errors, notFound: missing } = await Announcement.partialUpdate(req.params.id, req.body);
    if (missing) return notFound(res);
    if (errors) {
      const existing = await Announcement.find(req.params.id);
      return res.status(422).render('announcements/edit', {
        announcement: { ...existing, ...req.body },
        errors,
      });
    }
    res.redirect(303, `/announcements/${announcement.id}`);
  },

  // POST /announcements/:id/delete -> deleting (D)
  async delete(req, res) {
    if (!(await Announcement.delete(req.params.id))) return notFound(res);
    res.redirect(303, '/announcements');
  },
};

module.exports = AnnouncementController;
