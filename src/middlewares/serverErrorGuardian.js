// 5xx Guardian Middleware
// Catches all unhandled server errors, appends details to logs/error.logs,
// and returns a structured 500 response with a reason.

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
const errorLogsFile = path.join(logsDir, 'error.logs');

function logError(err, req) {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${req.method} ${req.originalUrl}\nStatus: 500\nMessage: ${err.message}\nStack: ${err.stack || 'No stack trace'}\n----------------------------------------\n`;
    fs.appendFileSync(errorLogsFile, entry, 'utf8');
  } catch (fsErr) {
    console.error('Failed writing to logs/error.logs:', fsErr.message);
  }
}

// eslint-disable-next-line no-unused-vars
function serverErrorGuardian(err, req, res, next) {
  console.error(`[5xx Guardian] Error on ${req.method} ${req.originalUrl}:`, err.message);

  logError(err, req);

  const reason = err.message || 'An unexpected internal server error occurred.';

  if (req.path.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(500).json({
      error: 'Internal Server Error',
      reason,
      status: 500,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(500).render('error', {
    title: '500 Server Error',
    message: 'Internal Server Error',
    reason,
  });
}

module.exports = serverErrorGuardian;
