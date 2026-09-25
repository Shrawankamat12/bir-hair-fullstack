const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { helmetMiddleware, hppMiddleware, mongoSanitize } = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const logger = require('./config/logger');

const app = express();

// --- security & hardening (new in Phase 1, all additive) ---
app.use(helmetMiddleware);
const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),
];


console.log('CORS allowedOrigins:', allowedOrigins);
console.log('raw CLIENT_URL env:', JSON.stringify(process.env.CLIENT_URL));
console.log('raw ADMIN_URL env:', JSON.stringify(process.env.ADMIN_URL));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(compression());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(hppMiddleware);

// Google OAuth ("Continue with Google") runs with session: false — see
// config/passport.js — so this only needs passport's strategy registry,
// no express-session/cookie-session middleware.
app.use(passport.initialize());

app.use('/api', apiLimiter);

// structured request logging (morgan output piped through winston)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: logger.stream }));

const path = require('path');
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));
app.use('/api/v1', routes);

app.get('/', (req, res) => res.send('B.I.R Hair API running'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;