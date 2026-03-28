const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/user.model');
const { sendError } = require('../utils/response.utils');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) {
      return sendError(res, 'User no longer exists.', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired.', 401);
    }
    next(error);
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires role: ${roles.join(' or ')}`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
