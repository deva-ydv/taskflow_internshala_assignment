const Task = require('../models/task.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response.utils');

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    return sendSuccess(res, { task }, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (admin: all, user: own)
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') filter.owner = req.user._id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    return sendPaginated(
      res,
      tasks,
      {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email');
    if (!task) return sendError(res, 'Task not found', 404);

    // Non-admins can only view their own tasks
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to view this task', 403);
    }

    return sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PATCH /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to update this task', 403);
    }

    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('owner', 'name email');

    return sendSuccess(res, { task }, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 'Task not found', 404);

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized to delete this task', 403);
    }

    await task.deleteOne();
    return sendSuccess(res, {}, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get task stats (admin only)
// @route   GET /api/v1/tasks/stats
// @access  Private/Admin
const getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, { byStatus: stats, byPriority: priorityStats }, 'Stats fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats };
