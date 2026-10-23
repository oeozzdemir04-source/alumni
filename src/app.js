const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');

const basicRoutes = require('./routes/basic');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs', (req, res) => res.redirect('/api/swagger'));
app.use('/api', apiRoutes);
app.use('/users', webRoutes);
app.use('/', basicRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ detail: 'Not Found' });
  res.status(404).render('error', { message: 'Page not found' });
});

module.exports = app;
