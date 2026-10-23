const User = require('../models/User');

const notFound = (res) => res.status(404).render('error', { message: 'User not found' });

// Independent controller: full CRUD for users under /users, connected to database layer
const UserController = {
  // GET /users -> listing (R): users table + "Add User" form.
  async list(req, res) {
    const users = await User.all();
    res.render('users/index', { users, errors: [], form: {} });
  },

  // POST /users -> creating (C): creates the user then redirects back to listing.
  async create(req, res) {
    const { errors } = await User.create(req.body);
    if (errors) {
      const users = await User.all();
      return res.status(422).render('users/index', { users, errors, form: req.body });
    }
    res.redirect(303, '/users');
  },

  // GET /users/:id -> detail page (R).
  async get(req, res) {
    const user = await User.find(req.params.id);
    if (!user) return notFound(res);
    res.render('users/show', { user });
  },

  // GET /users/:id/edit -> pre-filled edit form.
  async editForm(req, res) {
    const user = await User.find(req.params.id);
    if (!user) return notFound(res);
    res.render('users/edit', { user, errors: [] });
  },

  // POST /users/:id/edit -> updating (U)
  async update(req, res) {
    const { user, errors, notFound: missing } = await User.partialUpdate(req.params.id, req.body);
    if (missing) return notFound(res);
    if (errors) {
      const existing = await User.find(req.params.id);
      return res.status(422).render('users/edit', { user: { ...existing, ...req.body }, errors });
    }
    res.redirect(303, `/users/${user.id}`);
  },

  // POST /users/:id/delete -> deleting (D)
  async delete(req, res) {
    if (!(await User.delete(req.params.id))) return notFound(res);
    res.redirect(303, '/users');
  },
};

module.exports = UserController;
