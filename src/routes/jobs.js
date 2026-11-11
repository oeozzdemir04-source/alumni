const express = require('express');
const JobPostingController = require('../controllers/JobPostingController');
const router = express.Router();

router.get('/', JobPostingController.list);
router.post('/', JobPostingController.create);
router.get('/:id', JobPostingController.get);
router.get('/:id/edit', JobPostingController.editForm);
router.post('/:id/edit', JobPostingController.update);
router.post('/:id/delete', JobPostingController.delete);

module.exports = router;
