import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDashboardData);

export default router;
