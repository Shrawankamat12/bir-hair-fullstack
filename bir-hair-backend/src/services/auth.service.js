const crypto = require('crypto');

const AppError = require('../utils/AppError');
const {
  userRepository,
} = require('../repositories');

const generateToken = require('../utils/generateToken');
const { sendMail } = require('./email.service');

const {
  ADMIN_ROLES,
} = require('../constants/roles');

class AuthService {

  /* -------------------------------------------------------------- */
  /* REGISTER                                                        */
  /* -------------------------------------------------------------- */

  async register({
    name,
    email,
    phone,
    password,
  }) {
    const normalizedEmail =
      email.toLowerCase().trim();

    const exists =
      await userRepository.findOne({
        email: normalizedEmail,
      });

    if (exists) {
      throw new AppError(
        'Email already registered',
        400
      );
    }

    const user =
      await userRepository.create({
        name,
        email: normalizedEmail,
        phone,
        password,
        authProvider: 'local',
        role: 'customer',
      });

    const token =
      generateToken(user._id);

    return {
      user,
      token,
    };
  }

  /* -------------------------------------------------------------- */
  /* CUSTOMER LOGIN                                                  */
  /* -------------------------------------------------------------- */

  async login({
    email,
    password,
  }) {
    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await userRepository.model
        .findOne({
          email: normalizedEmail,
        })
        .select('+password');

    if (!user) {
      throw new AppError(
        'Invalid email or password',
        401
      );
    }

    if (user.role !== 'customer') {
      throw new AppError(
        'Please use admin login',
        403
      );
    }

    if (user.isBlocked) {
      throw new AppError(
        'Your account is blocked',
        403
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Your account is inactive',
        403
      );
    }

    const match =
      await user.comparePassword(
        password
      );

    if (!match) {
      user.failedLoginAttempts =
        (user.failedLoginAttempts || 0) + 1;

      await user.save();

      throw new AppError(
        'Invalid email or password',
        401
      );
    }

    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    user.loginCount =
      (user.loginCount || 0) + 1;

    await user.save();

    const token =
      generateToken(user._id);

    return {
      user,
      token,
    };
  }

  /* -------------------------------------------------------------- */
  /* ADMIN / STAFF LOGIN                                             */
  /* -------------------------------------------------------------- */

  async adminLogin({
    email,
    password,
  }) {
    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await userRepository.model
        .findOne({
          email: normalizedEmail,
        })
        .select('+password');

    if (!user) {
      throw new AppError(
        'Invalid admin credentials',
        401
      );
    }

    if (
      !ADMIN_ROLES.includes(
        user.role
      )
    ) {
      throw new AppError(
        'Invalid admin credentials',
        401
      );
    }

    if (user.isBlocked) {
      throw new AppError(
        'Admin account is blocked',
        403
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Admin account is inactive',
        403
      );
    }

    const match =
      await user.comparePassword(
        password
      );

    if (!match) {
      throw new AppError(
        'Invalid admin credentials',
        401
      );
    }

    user.lastLogin = new Date();
    user.loginCount =
      (user.loginCount || 0) + 1;

    await user.save();

    const token =
      generateToken(user._id);

    return {
      user,
      token,
    };
  }

  /* -------------------------------------------------------------- */
  /* FORGOT PASSWORD                                                 */
  /* -------------------------------------------------------------- */

  async forgotPassword(email) {
    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await userRepository.model.findOne({
        email: normalizedEmail,
      });

    /*
     Don't reveal whether
     email exists.
    */

    if (!user) {
      return {
        message:
          'If this email is registered, a password reset link has been generated.',
      };
    }

    /*
     Generate raw token
    */

    const rawToken =
      crypto.randomBytes(32).toString('hex');

    /*
     Store hashed token
    */

    const hashedToken =
      crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    user.resetPasswordToken =
      hashedToken;

    user.resetPasswordExpires =
      Date.now() +
      15 * 60 * 1000;

    await user.save();

    /*
     Send reset link through email
    */

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: 'Reset your B.I.R Hair password',
      html: `
        <p>Hi ${user.name || 'there'},</p>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    const response = {
      message:
        'If this email is registered, a password reset link has been generated.',
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = rawToken;
    }

    return response;
  }

  /* -------------------------------------------------------------- */
  /* RESET PASSWORD                                                  */
  /* -------------------------------------------------------------- */

  async resetPassword(
    token,
    newPassword
  ) {
    const hashedToken =
      crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user =
      await userRepository.model
        .findOne({
          resetPasswordToken:
            hashedToken,

          resetPasswordExpires: {
            $gt: Date.now(),
          },
        })
        .select('+password');

    if (!user) {
      throw new AppError(
        'Reset token is invalid or expired',
        400
      );
    }

    user.password =
      newPassword;

    user.passwordChangedAt =
      new Date();

    user.resetPasswordToken =
      undefined;

    user.resetPasswordExpires =
      undefined;

    user.refreshToken =
      undefined;

    await user.save();

    return user;
  }

  /* -------------------------------------------------------------- */
  /* CHANGE PASSWORD                                                 */
  /* -------------------------------------------------------------- */

  async changePassword(
    userId,
    currentPassword,
    newPassword
  ) {
    const user =
      await userRepository.model
        .findById(userId)
        .select('+password');

    if (!user) {
      throw new AppError(
        'User not found',
        404
      );
    }

    const match =
      await user.comparePassword(
        currentPassword
      );

    if (!match) {
      throw new AppError(
        'Current password is incorrect',
        401
      );
    }

    user.password =
      newPassword;

    user.passwordChangedAt =
      new Date();

    await user.save();

    return user;
  }

  /* -------------------------------------------------------------- */
  /* PUBLIC USER                                                     */
  /* -------------------------------------------------------------- */

  toPublicUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,

      authProvider:
        user.authProvider,

      isVerified:
        user.isVerified,

      emailVerified:
        user.emailVerified,
    };
  }
}

module.exports = new AuthService();