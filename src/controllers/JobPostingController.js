const JobPosting = require('../models/JobPosting');

const notFound = (res, id) =>
  res.status(404).render('404', {
    title: 'Job Not Found',
    message: 'Job Posting Not Found',
    reason: `Job posting #${id} could not be found.`,
    redirectUrl: '/jobs',
  });

const JobPostingController = {
  // GET /jobs -> list + add form
  async list(req, res, next) {
    try {
      const jobs = await JobPosting.all();
      res.render('jobs/index', { jobs, errors: [], form: {} });
    } catch (err) {
      next(err);
    }
  },

  // POST /jobs -> create
  async create(req, res, next) {
    try {
      const { errors } = await JobPosting.create(req.body);
      if (errors) {
        const jobs = await JobPosting.all();
        return res.status(400).render('jobs/index', { jobs, errors, form: req.body });
      }
      res.redirect(303, '/jobs');
    } catch (err) {
      next(err);
    }
  },

  // GET /jobs/:id -> detail
  async get(req, res, next) {
    try {
      const job = await JobPosting.find(req.params.id);
      if (!job) return notFound(res, req.params.id);
      res.render('jobs/show', { job });
    } catch (err) {
      next(err);
    }
  },

  // GET /jobs/:id/edit -> edit form
  async editForm(req, res, next) {
    try {
      const job = await JobPosting.find(req.params.id);
      if (!job) return notFound(res, req.params.id);
      res.render('jobs/edit', { job, errors: [] });
    } catch (err) {
      next(err);
    }
  },

  // POST /jobs/:id/edit -> update
  async update(req, res, next) {
    try {
      const { job, errors, notFound: missing } = await JobPosting.partialUpdate(req.params.id, req.body);
      if (missing) return notFound(res, req.params.id);
      if (errors) {
        const existing = await JobPosting.find(req.params.id);
        return res.status(400).render('jobs/edit', {
          job: { ...existing, ...req.body },
          errors,
        });
      }
      res.redirect(303, `/jobs/${job.id}`);
    } catch (err) {
      next(err);
    }
  },

  // POST /jobs/:id/delete -> delete
  async delete(req, res, next) {
    try {
      if (!(await JobPosting.delete(req.params.id))) {
        return notFound(res, req.params.id);
      }
      res.redirect(303, '/jobs');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = JobPostingController;
