const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.get('/', UserController.list);
router.post('/', UserController.create);
router.get('/:id', UserController.get);
router.get('/:id/edit', UserController.editForm);
router.post('/:id/edit', UserController.update);
router.post('/:id/delete', UserController.delete);

module.exports = router;
