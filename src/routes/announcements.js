const express = require('express');
const AnnouncementController = require('../controllers/AnnouncementController');
const router = express.Router();

router.get('/', AnnouncementController.list);
router.post('/', AnnouncementController.create);
router.get('/:id', AnnouncementController.get);
router.get('/:id/edit', AnnouncementController.editForm);
router.post('/:id/edit', AnnouncementController.update);
router.post('/:id/delete', AnnouncementController.delete);

module.exports = router;

