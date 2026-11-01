import express from 'express';
import { signup, login, logout, getProfile } from '../controllers/authController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.get('/me', authMiddleware, getProfile);

export default router;
