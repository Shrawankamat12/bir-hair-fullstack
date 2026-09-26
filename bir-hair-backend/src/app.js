const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const {
  helmetMiddleware,
  hppMiddleware,
  mongoSanitize
} = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const logger = require('./config/logger');

const app = express();

// --- Security & hardening ---
app.use(helmetMiddleware);

// --- CORS ---
const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),

  // Local development
  'http://localhost:5173',
  'http://localhost:3000',

  // Production frontend
  'https://birhairfactory.com',
  'https://www.birhairfactory.com',
];

console.log('CORS allowedOrigins:', allowedOrigins);
console.log('raw CLIENT_URL env:', JSON.stringify(process.env.CLIENT_URL));
console.log('raw ADMIN_URL env:', JSON.stringify(process.env.ADMIN_URL));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // and allowed frontend origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked by CORS: ${origin}`);
        callback(new Error(`Not allowed by CORS: ${origin}`));
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

// Passport
app.use(passport.initialize());

// API rate limiter
app.use('/api', apiLimiter);

// Request logging
app.use(
  morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream: logger.stream }
  )
);

// Static uploads
const path = require('path');
const uploadsPath = path.join(__dirname, 'uploads');

console.log('Serving uploads from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/', (req, res) => {
  res.send('B.I.R Hair API running');
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;