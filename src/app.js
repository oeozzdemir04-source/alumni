const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');

// Middlewares (Week 06)
const logger = require('./middlewares/logger');
const notFoundGuardian = require('./middlewares/notFoundGuardian');
const serverErrorGuardian = require('./middlewares/serverErrorGuardian');

// Routers
const basicRoutes = require('./routes/basic');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const announcementRoutes = require('./routes/announcements');
const jobRoutes = require('./routes/jobs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1) Logger Middleware (logs every request: time, method, route, status, duration)
app.use(logger);

// 2) Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Swagger Documentation
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs', (req, res) => res.redirect('/api/swagger'));

// 4) Application Routes
app.use('/api', apiRoutes);
app.use('/users', webRoutes);
app.use('/announcements', announcementRoutes);
app.use('/jobs', jobRoutes);
app.use('/', basicRoutes);

// 5) 404 Guardian Middleware (handles all unmapped routes with reasons / redirect)
app.use(notFoundGuardian);

// 6) 5xx Guardian Middleware (catches server errors, logs to logs/error.logs, returns 500)
app.use(serverErrorGuardian);

module.exports = app;
