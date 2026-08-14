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

// FIX: CORS was only reading a single CLIENT_URL / ADMIN_URL env var each. If
// either was unset (or set to a stale/old Vercel URL) on Render, the origin
// array ended up empty/undefined or wrong, so the browser blocked every
// request with "No 'Access-Control-Allow-Origin' header is present". This
// now supports multiple, comma-separated origins per env var (so you can
// list every Vercel deployment URL, e.g. the project's default domain and
// any preview/alias domains), trims whitespace, drops empty entries, and
// always allows requests with no Origin header (curl, server-to-server,
// same-origin) instead of rejecting them.
const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),
];

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