const Announcement = require('../models/Announcement');

// Independent controller: announcement CRUD as REST API under /api/announcements (no inheritance from AnnouncementController).
const ApiAnnouncementController = {
  create(req, res) {
    const { announcement, errors } = Announcement.create(req.body);
    if (errors) return res.status(422).json({ detail: errors });
    res.status(201).json(announcement);
  },

  list: (req, res) => res.json(Announcement.all()),

  get(req, res) {
    const announcement = Announcement.find(req.params.id);
    if (!announcement) return res.status(404).json({ detail: 'Announcement not found' });
    res.json(announcement);
  },

  replace(req, res) {
    const { announcement, errors, notFound } = Announcement.update(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'Announcement not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(announcement);
  },

  update(req, res) {
    const { announcement, errors, notFound } = Announcement.partialUpdate(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'Announcement not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(announcement);
  },

  delete(req, res) {
    if (!Announcement.delete(req.params.id)) return res.status(404).json({ detail: 'Announcement not found' });
    res.json({ message: 'Announcement deleted', id: Number(req.params.id) });
  },
};

module.exports = ApiAnnouncementController;
