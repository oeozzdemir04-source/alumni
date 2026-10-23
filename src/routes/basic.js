const express = require('express');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const router = express.Router();

router.get('/', (req, res) => res.render('home', {
  total: User.all().length,
  totalAnnouncements: Announcement.all().length,
}));

router.get('/about', (req, res) => res.render('about'));

router.get('/hello', (req, res) => res.send('Hello, World!'));

router.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));

router.get('/sum/:number1/:number2', (req, res) => {
  const a = Number(req.params.number1);
  const b = Number(req.params.number2);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(422).json({ detail: 'number1 and number2 must be integers' });
  }
  res.send(String(a + b));
});

module.exports = router;
