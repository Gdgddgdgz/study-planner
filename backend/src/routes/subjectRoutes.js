import express from 'express';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  onboardSubjects,
} from '../controllers/subjectController.js';
import {
  getChaptersBySubject,
  createChapter,
} from '../controllers/chapterController.js';
import {
  getFoldersBySubject,
  createFolder,
} from '../controllers/folderController.js';
import authMiddleware from '../lib/authMiddleware.js';

const router = express.Router();

// Protect all subject endpoints with authentication
router.use(authMiddleware);

router.route('/')
  .get(getSubjects)
  .post(createSubject);

router.post('/onboard', onboardSubjects);

router.route('/:id')
  .get(getSubjectById)
  .put(updateSubject)
  .patch(updateSubject)
  .delete(deleteSubject);

// Topic Folders hierarchy within subjects
router.route('/:subjectId/folders')
  .get(getFoldersBySubject)
  .post(createFolder);

// Backwards compatibility for chapter hierarchy
router.route('/:subjectId/chapters')
  .get(getChaptersBySubject)
  .post(createChapter);

export default router;
