const nodemailer = require('nodemailer');
const { settingRepository } = require('../repositories');
const logger = require('../config/logger');


let cachedTransporter = null;
let cachedConfigKey = null;

async function readMailConfig() {
  const settings = await settingRepository.model.findOne().lean();

  const host = settings?.smtpHost || process.env.SMTP_HOST;
  const port = Number(settings?.smtpPort || process.env.SMTP_PORT || 587);
  const user = settings?.smtpUser || process.env.SMTP_USER;
  // Secret — intentionally has no equivalent Setting field, so it can never
  // round-trip through the admin Settings API. Only ever read from env.
  const pass = process.env.SMTP_PASSWORD;
  const from = settings?.smtpFrom || process.env.SMTP_FROM || user;
  const businessEmail = settings?.storeEmail || process.env.BUSINESS_EMAIL || user;

  return { host, port, user, pass, from, businessEmail };
}

async function getTransporter(config) {
  if (!config.host || !config.user || !config.pass) return null;

  const configKey = `${config.host}:${config.port}:${config.user}`;
  if (cachedTransporter && cachedConfigKey === configKey) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
  cachedConfigKey = configKey;
  return cachedTransporter;
}


async function sendBusinessNotification({ subject, html, replyTo }) {
  try {
    const config = await readMailConfig();
    const transporter = await getTransporter(config);

    if (!transporter) {
      logger.warn(
        'Email not sent — SMTP is not fully configured (need host, user and SMTP_PASSWORD via env, or Settings -> General in the admin panel).'
      );
      return false;
    }

    if (!config.businessEmail) {
      logger.warn(
        'Email not sent — no recipient configured (set Store Email in Settings -> General, or BUSINESS_EMAIL in env).'
      );
      return false;
    }

    await transporter.sendMail({
      from: config.from ? `"B.I.R Hair" <${config.from}>` : config.user,
      to: config.businessEmail,
      replyTo,
      subject,
      html,
    });

    return true;
  } catch (err) {
    logger.error(`Failed to send notification email: ${err.message}`);
    return false;
  }
}

module.exports = { sendBusinessNotification };