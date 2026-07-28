const winston = require('winston');

const isProd = process.env.NODE_ENV === 'production';

// Structured logger used everywhere instead of console.log.
// Dev: colorized, human readable. Prod: JSON (easy to ship to a log service later).
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: isProd
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${extra}`;
        })
      ),
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

// morgan writes HTTP access lines through this stream so they end up
// in the same place as everything else instead of raw console output.
logger.stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

module.exports = logger;
