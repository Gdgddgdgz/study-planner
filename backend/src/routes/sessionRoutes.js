import express from 'express';
import {
  getSessions,
  createSession,
  getSessionStats,
} from '../controllers/sessionController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .get(getSessions)
  .post(createSession);

router.get('/stats', getSessionStats);

export default router;
