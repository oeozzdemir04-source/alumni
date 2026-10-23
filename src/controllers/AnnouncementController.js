const Announcement = require('../models/Announcement');

const notFound = (res) => res.status(404).render('error', { message: 'Announcement not found' });

// Independent controller: full CRUD for announcements under /announcements, managed through the view layer
// (no inheritance from ApiAnnouncementController).
const AnnouncementController = {
  // GET /announcements -> listing (R): announcements table + "Add Announcement" form.
  list: (req, res) => res.render('announcements/index', { announcements: Announcement.all(), errors: [], form: {} }),

  // POST /announcements -> creating (C): creates the announcement then redirects back to listing.
  create(req, res) {
    const { errors } = Announcement.create(req.body);
    if (errors) {
      return res.status(422).render('announcements/index', {
        announcements: Announcement.all(),
        errors,
        form: req.body,
      });
    }
    res.redirect(303, '/announcements');
  },

  // GET /announcements/:id -> detail page (R).
  get(req, res) {
    const announcement = Announcement.find(req.params.id);
    if (!announcement) return notFound(res);
    res.render('announcements/show', { announcement });
  },

  // GET /announcements/:id/edit -> pre-filled edit form.
  editForm(req, res) {
    const announcement = Announcement.find(req.params.id);
    if (!announcement) return notFound(res);
    res.render('announcements/edit', { announcement, errors: [] });
  },

  // POST /announcements/:id/edit -> updating (U): HTML forms submit here; redirects back to detail page.
  update(req, res) {
    const { announcement, errors, notFound: missing } = Announcement.partialUpdate(req.params.id, req.body);
    if (missing) return notFound(res);
    if (errors) {
      return res.status(422).render('announcements/edit', {
        announcement: { ...Announcement.find(req.params.id), ...req.body },
        errors,
      });
    }
    res.redirect(303, `/announcements/${announcement.id}`);
  },

  // POST /announcements/:id/delete -> deleting (D): HTML forms submit here; redirects back to listing.
  delete(req, res) {
    if (!Announcement.delete(req.params.id)) return notFound(res);
    res.redirect(303, '/announcements');
  },
};

module.exports = AnnouncementController;

