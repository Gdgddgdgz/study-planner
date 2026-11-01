import express from 'express';
import {
  getAllFolders,
  updateFolder,
  deleteFolder,
} from '../controllers/folderController.js';
import { getNotesByChapter } from '../controllers/noteController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllFolders);

router.route('/:id')
  .put(updateFolder)
  .patch(updateFolder)
  .delete(deleteFolder);

router.get('/:folderId/notes', getNotesByChapter);

export default router;
