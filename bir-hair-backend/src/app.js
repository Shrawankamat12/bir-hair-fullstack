const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { helmetMiddleware, hppMiddleware, mongoSanitize } = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const logger = require('./config/logger');

const app = express();

// --- security & hardening (new in Phase 1, all additive) ---
app.use(helmetMiddleware);
app.use(cors({ origin: [process.env.CLIENT_URL, process.env.ADMIN_URL], credentials: true }));
app.use(compression());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(hppMiddleware);

app.use('/api', apiLimiter);

// structured request logging (morgan output piped through winston)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

app.use('/uploads', express.static('src/uploads'));

app.use('/api/v1', routes);

app.get('/', (req, res) => res.send('B.I.R Hair API running'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
