// Logger Middleware
// Writes each incoming request to the terminal in the format:
// time method route status duration (e.g. "10:20:30 POST /users 201 18ms")

function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;

    const method = req.method;
    const route = req.originalUrl || req.url;
    const status = res.statusCode;
    const duration = `${Date.now() - start}ms`;

    console.log(`${time} ${method} ${route} ${status} ${duration}`);
  });

  next();
}

module.exports = logger;
