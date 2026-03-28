const express = require('express');
const router = express.Router();
const {
  createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats,
} = require('../../controllers/task.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { body, query } = require('express-validator');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format').toDate(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Tags must be an array'),
];

const updateTaskValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().toDate(),
];

// Apply auth to all task routes
router.use(protect);

/**
 * @swagger
 * /tasks/stats:
 *   get:
 *     summary: Get task statistics (admin only)
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Task statistics by status and priority
 *       403:
 *         description: Admin access required
 */
router.get('/stats', restrictTo('admin'), getTaskStats);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks (filtered by role)
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [todo, in-progress, completed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: createdAt }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Paginated list of tasks
 */
router.get('/', getTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [todo, in-progress, completed] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               dueDate: { type: string, format: date-time }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Task created
 *       422:
 *         description: Validation error
 */
router.post('/', validate(taskValidation), createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id', getTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               priority: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 */
router.patch('/:id', validate(updateTaskValidation), updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask);

module.exports = router;
