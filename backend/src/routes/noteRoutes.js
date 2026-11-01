import express from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  uploadNote,
  updateNote,
  deleteNote,
} from '../controllers/noteController.js';
import upload from '../lib/upload.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Multipart S3 File Upload endpoint
router.post('/upload', upload.single('file'), uploadNote);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .patch(updateNote)
  .delete(deleteNote);

export default router;
