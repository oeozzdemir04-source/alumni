const User = require('../models/User');

// Independent controller: user CRUD as REST API under /api/users (no inheritance from UserController).
const ApiUserController = {
  create(req, res) {
    const { user, errors } = User.create(req.body);
    if (errors) return res.status(422).json({ detail: errors });
    res.json(user);
  },

  list: (req, res) => res.json(User.all()),

  get(req, res) {
    const user = User.find(req.params.id);
    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  },

  replace(req, res) {
    const { user, errors, notFound } = User.update(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'User not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(user);
  },

  update(req, res) {
    const { user, errors, notFound } = User.partialUpdate(req.params.id, req.body);
    if (notFound) return res.status(404).json({ detail: 'User not found' });
    if (errors) return res.status(422).json({ detail: errors });
    res.json(user);
  },

  delete(req, res) {
    if (!User.delete(req.params.id)) return res.status(404).json({ detail: 'User not found' });
    res.json({ message: 'User deleted', id: Number(req.params.id) });
  },
};

module.exports = ApiUserController;
