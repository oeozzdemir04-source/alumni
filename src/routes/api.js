const express = require('express');
const ApiUserController = require('../controllers/ApiUserController');
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
const ApiJobPostingController = require('../controllers/ApiJobPostingController');
const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Users API
router.post('/users', ApiUserController.create);
router.get('/users', ApiUserController.list);
router.get('/users/:id', ApiUserController.get);
router.put('/users/:id', ApiUserController.replace);
router.patch('/users/:id', ApiUserController.update);
router.delete('/users/:id', ApiUserController.delete);

// Announcements API
router.post('/announcements', ApiAnnouncementController.create);
router.get('/announcements', ApiAnnouncementController.list);
router.get('/announcements/:id', ApiAnnouncementController.get);
router.put('/announcements/:id', ApiAnnouncementController.replace);
router.patch('/announcements/:id', ApiAnnouncementController.update);
router.delete('/announcements/:id', ApiAnnouncementController.delete);

// Job Postings API (Week 06)
router.get('/jobs', ApiJobPostingController.list);
router.post('/jobs', ApiJobPostingController.create);
router.get('/jobs/:id', ApiJobPostingController.get);
router.put('/jobs/:id', ApiJobPostingController.replace);
router.patch('/jobs/:id', ApiJobPostingController.update);
router.delete('/jobs/:id', ApiJobPostingController.delete);

// Nested user jobs endpoint: POST /api/users/:userId/jobs, GET /api/users/:userId/jobs
router.get('/users/:userId/jobs', ApiJobPostingController.listByUser);
router.post('/users/:userId/jobs', ApiJobPostingController.createForUser);

// Route to verify 5xx Guardian & error logging in logs/error.logs
router.get('/test-error', (req, res, next) => {
  next(new Error('Simulated internal server error for 5xx Guardian testing'));
});

module.exports = router;
