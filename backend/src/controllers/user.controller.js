const User = require('../models/user.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response.utils');

// @desc    Get all users (admin)
// @route   GET /api/v1/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, users, {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      totalItems: total,
      itemsPerPage: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (admin)
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin)
// @route   PATCH /api/v1/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return sendError(res, 'User not found', 404);

    return sendSuccess(res, { user }, 'User role updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user (admin)
// @route   PATCH /api/v1/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user }, 'User deactivated');
  } catch (error) {
    next(error);
  }
};

// @desc    Update own profile
// @route   PATCH /api/v1/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name'];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUser, updateUserRole, deactivateUser, updateProfile };
