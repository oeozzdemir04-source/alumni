const express = require('express');
const ApiUserController = require('../controllers/ApiUserController');
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');
const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Users API
router.post('/users', ApiUserController.create);
router.get('/users', ApiUserController.list);
router.get('/users/:id', ApiUserController.get);
router.put('/users/:id', ApiUserController.replace);
router.patch('/users/:id', ApiUserController.update);
router.delete('/users/:id', ApiUserController.delete);

// Announcements API (Homework)
router.post('/announcements', ApiAnnouncementController.create);
router.get('/announcements', ApiAnnouncementController.list);
router.get('/announcements/:id', ApiAnnouncementController.get);
router.put('/announcements/:id', ApiAnnouncementController.replace);
router.patch('/announcements/:id', ApiAnnouncementController.update);
router.delete('/announcements/:id', ApiAnnouncementController.delete);

module.exports = router;
