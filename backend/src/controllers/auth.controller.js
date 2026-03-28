const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { sendSuccess, sendError } = require('../utils/response.utils');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered.', 409);
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    logger.info(`New user registered: ${email}`);

    return sendSuccess(
      res,
      { user, tokens: { accessToken, refreshToken } },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated.', 401);
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id });

    user.cleanRefreshTokens();
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = new Date();
    await user.save();

    return sendSuccess(res, {
      user,
      tokens: { accessToken, refreshToken },
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, 'Refresh token required.', 400);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) return sendError(res, 'User not found.', 401);

    const tokenExists = user.refreshTokens.some((t) => t.token === token);
    if (!tokenExists) return sendError(res, 'Invalid refresh token.', 401);

    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    return sendSuccess(res, {
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    }, 'Token refreshed');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 'Invalid or expired refresh token.', 401);
    }
    next(error);
  }
};

// @desc    Logout (invalidate refresh token)
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    await user.save();
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user }, 'User profile fetched');
};

module.exports = { register, login, refreshToken, logout, getMe };
