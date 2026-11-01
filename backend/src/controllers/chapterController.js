// chapterController.js - handles chapter hierarchy for subjects
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { chapters, notes } from '../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';

// @desc    Get all chapters for a given subject (with attached notes count)
// @route   GET /api/subjects/:subjectId/chapters
// @access  Private
export const getChaptersBySubject = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.subjectId, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  const subjectChapters = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.subjectId, subjectId), eq(chapters.userId, userId)))
    .orderBy(asc(chapters.order), asc(chapters.id));

  // Get all notes for this subject to associate with chapters
  const subjectNotes = await db
    .select()
    .from(notes)
    .where(and(eq(notes.subjectId, subjectId), eq(notes.userId, userId)));

  const chaptersWithNotes = subjectChapters.map((ch) => ({
    ...ch,
    notes: subjectNotes.filter((n) => n.chapterId === ch.id),
    notesCount: subjectNotes.filter((n) => n.chapterId === ch.id).length,
  }));

  return res.json({
    success: true,
    total: chaptersWithNotes.length,
    chapters: chaptersWithNotes,
    data: chaptersWithNotes,
  });
});

// @desc    Create a chapter within a subject
// @route   POST /api/subjects/:subjectId/chapters
// @access  Private
export const createChapter = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.subjectId, 10);
  const { title, description, order } = req.body;

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Chapter title is required' });
  }

  const [newChapter] = await db
    .insert(chapters)
    .values({
      userId,
      subjectId,
      title: title.trim(),
      description: description?.trim() || '',
      order: order ? parseInt(order, 10) : 0,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Chapter created successfully',
    chapter: newChapter,
    data: newChapter,
  });
});

// @desc    Update a chapter
// @route   PUT /api/chapters/:id or PATCH /api/chapters/:id
// @access  Private
export const updateChapter = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const chapterId = parseInt(req.params.id, 10);

  if (isNaN(chapterId)) {
    return res.status(400).json({ success: false, message: 'Invalid chapter ID' });
  }

  const [existing] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Chapter not found' });
  }

  const { title, description, order } = req.body;
  const updateFields = { updatedAt: new Date() };

  if (title !== undefined) updateFields.title = title.trim();
  if (description !== undefined) updateFields.description = description.trim();
  if (order !== undefined) updateFields.order = parseInt(order, 10) || 0;

  const [updatedChapter] = await db
    .update(chapters)
    .set(updateFields)
    .where(and(eq(chapters.id, chapterId), eq(chapters.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Chapter updated successfully',
    chapter: updatedChapter,
    data: updatedChapter,
  });
});

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private
export const deleteChapter = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const chapterId = parseInt(req.params.id, 10);

  if (isNaN(chapterId)) {
    return res.status(400).json({ success: false, message: 'Invalid chapter ID' });
  }

  const [existing] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Chapter not found' });
  }

  await db
    .delete(chapters)
    .where(and(eq(chapters.id, chapterId), eq(chapters.userId, userId)));

  return res.json({
    success: true,
    message: 'Chapter deleted successfully',
    id: chapterId,
  });
});
