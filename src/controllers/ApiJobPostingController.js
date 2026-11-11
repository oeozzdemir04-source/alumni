const JobPosting = require('../models/JobPosting');

// REST API Controller for Job Postings under /api/jobs and /api/users/:userId/jobs
const ApiJobPostingController = {
  async list(req, res, next) {
    try {
      const jobs = await JobPosting.all();
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  },

  async listByUser(req, res, next) {
    try {
      const jobs = await JobPosting.all({ user_id: req.params.userId });
      res.json(jobs);
    } catch (err) {
      next(err);
    }
  },

  async get(req, res, next) {
    try {
      const job = await JobPosting.find(req.params.id);
      if (!job) {
        return res.status(404).json({
          error: 'Not Found',
          reason: `Job posting with ID ${req.params.id} does not exist.`,
        });
      }
      res.json(job);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { job, errors } = await JobPosting.create(req.body);
      if (errors) {
        return res.status(400).json({
          error: 'Bad Request',
          reason: 'Validation failed',
          detail: errors,
        });
      }
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  },

  // Specifically for POST /api/users/:userId/jobs
  async createForUser(req, res, next) {
    try {
      const payload = { ...req.body, user_id: req.params.userId };
      const { job, errors } = await JobPosting.create(payload);
      if (errors) {
        return res.status(400).json({
          error: 'Bad Request',
          reason: 'Validation failed',
          detail: errors,
        });
      }
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  },

  async replace(req, res, next) {
    try {
      const { job, errors, notFound } = await JobPosting.update(req.params.id, req.body);
      if (notFound) {
        return res.status(404).json({
          error: 'Not Found',
          reason: `Job posting with ID ${req.params.id} does not exist.`,
        });
      }
      if (errors) {
        return res.status(400).json({
          error: 'Bad Request',
          reason: 'Validation failed',
          detail: errors,
        });
      }
      res.json(job);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { job, errors, notFound } = await JobPosting.partialUpdate(req.params.id, req.body);
      if (notFound) {
        return res.status(404).json({
          error: 'Not Found',
          reason: `Job posting with ID ${req.params.id} does not exist.`,
        });
      }
      if (errors) {
        return res.status(400).json({
          error: 'Bad Request',
          reason: 'Validation failed',
          detail: errors,
        });
      }
      res.json(job);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await JobPosting.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          error: 'Not Found',
          reason: `Job posting with ID ${req.params.id} does not exist.`,
        });
      }
      res.json({ message: 'Job posting deleted', id: Number(req.params.id) });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ApiJobPostingController;
