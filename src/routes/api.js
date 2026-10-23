const express = require('express');
const ApiUserController = require('../controllers/ApiUserController');
const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.post('/users', ApiUserController.create);
router.get('/users', ApiUserController.list);
router.get('/users/:id', ApiUserController.get);
router.put('/users/:id', ApiUserController.replace);
router.patch('/users/:id', ApiUserController.update);
router.delete('/users/:id', ApiUserController.delete);

module.exports = router;
