import express from 'express';
import {
  updateChapter,
  deleteChapter,
} from '../controllers/chapterController.js';
import { getNotesByChapter } from '../controllers/noteController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.route('/:id')
  .put(updateChapter)
  .patch(updateChapter)
  .delete(deleteChapter);

router.get('/:chapterId/notes', getNotesByChapter);

export default router;
