const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/* REGISTER */

exports.register = asyncHandler(
  async (req, res) => {
    const {
      user,
      token,
    } = await authService.register(
      req.body
    );

    res
      .cookie(
        'token',
        token,
        cookieOptions
      )
      .status(201)
      .json({
        success: true,
        user:
          authService.toPublicUser(
            user
          ),
        token,
      });
  }
);

/* USER LOGIN */

exports.login = asyncHandler(
  async (req, res) => {
    const {
      user,
      token,
    } = await authService.login(
      req.body
    );

    res
      .cookie(
        'token',
        token,
        cookieOptions
      )
      .json({
        success: true,
        user:
          authService.toPublicUser(
            user
          ),
        token,
      });
  }
);

/* ADMIN / STAFF LOGIN */

exports.adminLogin = asyncHandler(
  async (req, res) => {
    const {
      user,
      token,
    } =
      await authService.adminLogin(
        req.body
      );

    res
      .cookie(
        'token',
        token,
        cookieOptions
      )
      .json({
        success: true,
        user:
          authService.toPublicUser(
            user
          ),
        token,
      });
  }
);

/* CURRENT USER */

exports.getMe = asyncHandler(
  async (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);

/* LOGOUT */

exports.logout = asyncHandler(
  async (req, res) => {
    res
      .clearCookie(
        'token',
        cookieOptions
      )
      .json({
        success: true,
        message:
          'Logged out successfully',
      });
  }
);

/* FORGOT PASSWORD */

exports.forgotPassword =
  asyncHandler(
    async (req, res) => {
      const result =
        await authService.forgotPassword(
          req.body.email
        );

      const response = {
        success: true,
        message: result.message,
      };

      // Development only
      if (
        process.env.NODE_ENV !==
        'production'
      ) {
        response.resetToken =
          result.resetToken;
      }

      res.json(response);
    }
  );

/* RESET PASSWORD */

exports.resetPassword =
  asyncHandler(
    async (req, res) => {
      await authService.resetPassword(
        req.body.token,
        req.body.password
      );

      res.json({
        success: true,
        message:
          'Password reset successfully',
      });
    }
  );

/* CHANGE PASSWORD */

exports.changePassword =
  asyncHandler(
    async (req, res) => {
      await authService.changePassword(
        req.user._id,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.json({
        success: true,
        message:
          'Password changed successfully',
      });
    }
  );