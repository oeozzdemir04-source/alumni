const express = require('express');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const JobPosting = require('../models/JobPosting');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await User.all();
    const announcements = await Announcement.all();
    const jobs = await JobPosting.all();
    res.render('home', {
      total: users.length,
      totalAnnouncements: announcements.length,
      totalJobs: jobs.length,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/about', (req, res) => res.render('about'));

router.get('/hello', (req, res) => res.send('Hello, World!'));

router.get('/hello/:name', (req, res) => {
  const name = req.params.name;
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  res.send(`Hello, ${formattedName}!`);
});

router.get('/sum/:number1/:number2', (req, res) => {
  const a = Number(req.params.number1);
  const b = Number(req.params.number2);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(422).json({ detail: 'number1 and number2 must be integers' });
  }
  res.send(String(a + b));
});

// Generic 404 route for manual visits / test redirects
router.get('/404', (req, res) => {
  res.status(404).render('404', {
    title: '404 Not Found',
    message: 'Page Not Found',
    reason: 'The requested route does not exist.',
    redirectUrl: '/users',
  });
});

module.exports = router;
