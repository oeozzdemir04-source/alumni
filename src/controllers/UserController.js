const User = require('../models/User');

const notFound = (res) => res.status(404).render('error', { message: 'User not found' });

// Independent controller: full CRUD for users under /users, managed through the view layer
// (no inheritance from ApiUserController).
const UserController = {
  // GET /users -> listing (R): users table + "Add User" form.
  list: (req, res) => res.render('users/index', { users: User.all(), errors: [], form: {} }),

  // POST /users -> creating (C): creates the user then redirects back to the listing.
  create(req, res) {
    const { errors } = User.create(req.body);
    if (errors) return res.status(422).render('users/index', { users: User.all(), errors, form: req.body });
    res.redirect(303, '/users');
  },

  // GET /users/:id -> detail page (R).
  get(req, res) {
    const user = User.find(req.params.id);
    if (!user) return notFound(res);
    res.render('users/show', { user });
  },

  // GET /users/:id/edit -> pre-filled edit form.
  editForm(req, res) {
    const user = User.find(req.params.id);
    if (!user) return notFound(res);
    res.render('users/edit', { user, errors: [] });
  },

  // POST /users/:id/edit -> updating (U): HTML forms can't send PUT/PATCH,
  // so the edit form submits here instead; redirects back to the detail page.
  update(req, res) {
    const { user, errors, notFound: missing } = User.partialUpdate(req.params.id, req.body);
    if (missing) return notFound(res);
    if (errors) {
      return res.status(422).render('users/edit', { user: { ...User.find(req.params.id), ...req.body }, errors });
    }
    res.redirect(303, `/users/${user.id}`);
  },

  // POST /users/:id/delete -> deleting (D): HTML forms can't send DELETE,
  // so the delete button submits here instead; redirects back to the listing.
  delete(req, res) {
    if (!User.delete(req.params.id)) return notFound(res);
    res.redirect(303, '/users');
  },
};

module.exports = UserController;
