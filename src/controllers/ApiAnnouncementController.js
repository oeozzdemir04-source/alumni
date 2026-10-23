const Announcement = require('../models/Announcement');

// Independent controller: announcement CRUD as REST API under /api/announcements, connected to database layer
const ApiAnnouncementController = {
  async create(req, res) {
    const { announcement, errors } = await Announcement.create(req.body);
    if (errors) return res.status(422).json({ detail: errors });
    res.status(201).json(announcement);
  },

  async list(req, res) {
    const announcements = await Announcement.all();
    res.json(announcements);
  },

  async get(req, res) {
    const announcement = await Announcement.find(req.params.id);
    if (!announcement) return res.status(404).json({ detail: 'Announcement not found' });
    res.json(announcement);
  },

  async replace(req, res) {
    const { announcement, errors, notFound } = await Announcement.update(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'Announcement not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(announcement);
  },

  async update(req, res) {
    const { announcement, errors, notFound } = await Announcement.partialUpdate(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'Announcement not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(announcement);
  },

  async delete(req, res) {
    if (!(await Announcement.delete(req.params.id))) return res.status(404).json({ detail: 'Announcement not found' });
    res.json({ message: 'Announcement deleted', id: Number(req.params.id) });
  },
};

module.exports = ApiAnnouncementController;
