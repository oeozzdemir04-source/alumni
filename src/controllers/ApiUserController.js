const User = require('../models/User');

// Independent controller: user CRUD as REST API under /api/users, connected to database layer
const ApiUserController = {
  async create(req, res) {
    const { user, errors } = await User.create(req.body);
    if (errors) return res.status(422).json({ detail: errors });
    res.status(201).json(user);
  },

  async list(req, res) {
    const users = await User.all();
    res.json(users);
  },

  async get(req, res) {
    const user = await User.find(req.params.id);
    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  },

  async replace(req, res) {
    const { user, errors, notFound } = await User.update(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'User not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(user);
  },

  async update(req, res) {
    const { user, errors, notFound } = await User.partialUpdate(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'User not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(user);
  },

  async delete(req, res) {
    if (!(await User.delete(req.params.id))) return res.status(404).json({ detail: 'User not found' });
    res.json({ message: 'User deleted', id: Number(req.params.id) });
  },
};

module.exports = ApiUserController;
