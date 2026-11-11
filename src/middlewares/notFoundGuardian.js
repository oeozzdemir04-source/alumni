// 404 Guardian Middleware
// Returns 404 errors with a clear descriptive reason.
// For API requests: returns JSON detailing the missing route.
// For Web requests: renders the generic 404 page with redirect options.

function notFoundGuardian(req, res) {
  const reason = `The requested resource '${req.method} ${req.originalUrl}' was not found on this server.`;

  if (req.path.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(404).json({
      error: 'Not Found',
      reason,
      status: 404,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(404).render('404', {
    title: '404 Not Found',
    message: 'Page Not Found',
    reason,
    redirectUrl: '/users',
  });
}

module.exports = notFoundGuardian;
