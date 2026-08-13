const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (
    !token &&
    req.headers.authorization?.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired token');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is inactive');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Account is blocked');
  }

  req.user = user;

  next();
});

// Same as `protect`, but never blocks the request.
// If a valid, non-expired token belonging to an active, non-blocked user is
// present, sets req.user. Otherwise req.user stays undefined and the
// request proceeds as a guest. Used on routes like order creation that must
// support both guest checkout and logged-in checkout.
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (
    !token &&
    req.headers.authorization?.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.isActive && !user.isBlocked) {
      req.user = user;
    }
  } catch (error) {
    // invalid/expired token — proceed as guest, don't throw
  }

  next();
});

module.exports = {
  protect,
  optionalAuth,
};