const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { userRepository } = require('../repositories');
const logger = require('./logger');


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          // 1) Already linked to this Google account from a previous login.
          let user = await userRepository.findOne({ googleId: profile.id });

         
          if (!user && email) {
            user = await userRepository.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            }
          }

          // 3) Brand new customer signing up via Google for the first time.
          if (!user) {
            if (!email) {
              return done(new Error('Your Google account has no accessible email address.'));
            }
            user = await userRepository.create({
              name: profile.displayName || email.split('@')[0],
              email,
              authProvider: 'google',
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              isVerified: true,
              emailVerified: true,
              role: 'customer',
            });
          }

          if (user.isBlocked) return done(new Error('Your account is blocked. Please contact support.'));
          if (!user.isActive) return done(new Error('Your account is inactive. Please contact support.'));
          if (user.role !== 'customer') return done(new Error('Please use the admin login for staff accounts.'));

          user.lastLogin = new Date();
          user.loginCount = (user.loginCount || 0) + 1;
          await user.save();

          return done(null, user);
        } catch (err) {
          logger.error(`Google OAuth login failed: ${err.message}`);
          return done(err);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth is not configured — GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are unset. "Continue with Google" will be unavailable until they are set.');
}

module.exports = passport;