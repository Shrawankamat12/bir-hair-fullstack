const helmet = require('helmet');
const hpp = require('hpp');

// Strips any key starting with "$" or containing "." from req.body/query/params —
// blocks MongoDB operator injection like { "email": { "$gt": "" } }.
// Written by hand instead of pulling in express-mongo-sanitize so it plays
// nicely with Express 4's req.query getter and doesn't need extra config.
function mongoSanitize() {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }
      if (obj[key] && typeof obj[key] === 'object') clean(obj[key]);
    }
    return obj;
  };

  return (req, res, next) => {
    if (req.body) clean(req.body);
    if (req.params) clean(req.params);
    if (req.query) clean(req.query); // mutates in place, doesn't reassign req.query
    next();
  };
}

// Escapes obvious HTML/script injection in string fields of body/query so
// stored values (names, comments, review text, etc.) can't carry a <script> tag.
// NOTE: intentionally NOT mounted globally in app.js — admin content fields
// (blog.content, banner copy, etc.) can legitimately contain HTML, and escaping
// those globally would corrupt existing content. Apply this per-route to
// guest-facing plain-text inputs only (contact, wholesale, reviews, auth).
function xssClean() {
  const escapeStr = (str) =>
    str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '');

  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') obj[key] = escapeStr(obj[key]);
      else if (obj[key] && typeof obj[key] === 'object') clean(obj[key]);
    }
    return obj;
  };

  return (req, res, next) => {
    if (req.body) clean(req.body);
    if (req.params) clean(req.params);
    if (req.query) clean(req.query);
    next();
  };
}

module.exports = {
  helmetMiddleware: helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // product images served to other origins
  }),
  hppMiddleware: hpp(),
  mongoSanitize,
  xssClean,
};
