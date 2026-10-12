const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const routes = require('./routes');
const {
  notFound,
  errorHandler,
} = require('./middleware/error.middleware');
const {
  helmetMiddleware,
  hppMiddleware,
  mongoSanitize,
} = require('./middleware/security.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const logger = require('./config/logger');
const path = require('path');

const app = express();

app.set('trust proxy', 1);

// Security
app.use(helmetMiddleware);

// CORS
const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),

  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',

  'https://birhairfactory.com',
  'https://www.birhairfactory.com',
];

const vercelPreviewPattern =
  /^https:\/\/birhairfactory-[a-z0-9]+-shrawankamat12s-projects\.vercel\.app$/i;

console.log('CORS allowed origins:', allowedOrigins);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('ADMIN_URL:', process.env.ADMIN_URL);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (
      allowedOrigins.includes(normalizedOrigin) ||
      vercelPreviewPattern.test(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    logger.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize());
app.use(hppMiddleware);

// Passport
app.use(passport.initialize());

// Request logging
app.use(
  morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream: logger.stream }
  )
);

// Static uploads
const uploadsPath = path.join(__dirname, 'uploads');

console.log('Serving uploads from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath));

// Rate limiter
app.use('/api', apiLimiter);

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/', (req, res) => {
  res.status(200).send('B.I.R Hair API running');
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;