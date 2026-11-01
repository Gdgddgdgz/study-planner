import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskDone,
  deleteTask,
} from '../controllers/taskController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .patch(updateTask)
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTaskDone);

export default router;
