// folderController.js - handles topic folders hierarchy for subjects
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { folders, notes, subjects } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { deleteFileFromS3 } from '../lib/s3.js';

// @desc    Get all topic folders for a given subject (with notes and note count)
// @route   GET /api/subjects/:subjectId/folders
// @access  Private
export const getFoldersBySubject = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.subjectId, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  // Verify subject belongs to user
  const [subject] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  const subjectFolders = await db
    .select()
    .from(folders)
    .where(and(eq(folders.subjectId, subjectId), eq(folders.userId, userId)))
    .orderBy(asc(folders.id));

  // Get notes for this subject
  const subjectNotes = await db
    .select()
    .from(notes)
    .where(and(eq(notes.subjectId, subjectId), eq(notes.userId, userId)))
    .orderBy(desc(notes.id));

  const foldersWithNotes = subjectFolders.map((f) => {
    const folderNotes = subjectNotes.filter((n) => n.folderId === f.id || n.chapterId === f.id);
    return {
      ...f,
      notesCount: folderNotes.length,
      notes: folderNotes,
    };
  });

  return res.json({
    success: true,
    total: foldersWithNotes.length,
    folders: foldersWithNotes,
    data: foldersWithNotes,
  });
});

// @desc    Get all topic folders for current user (across subjects)
// @route   GET /api/folders
// @access  Private
export const getAllFolders = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const userFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, userId))
    .orderBy(desc(folders.id));

  return res.json({
    success: true,
    total: userFolders.length,
    folders: userFolders,
    data: userFolders,
  });
});

// @desc    Create a topic folder within a subject
// @route   POST /api/subjects/:subjectId/folders
// @access  Private
export const createFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.subjectId, 10);
  const { name, description, color } = req.body;

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Folder name is required' });
  }

  // Ensure subject exists and belongs to user
  const [subject] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  const [newFolder] = await db
    .insert(folders)
    .values({
      userId,
      subjectId,
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3b82f6',
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Topic folder created successfully',
    folder: newFolder,
    data: newFolder,
  });
});

// @desc    Update a topic folder
// @route   PUT /api/folders/:id or PATCH /api/folders/:id
// @access  Private
export const updateFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = parseInt(req.params.id, 10);

  if (isNaN(folderId)) {
    return res.status(400).json({ success: false, message: 'Invalid folder ID' });
  }

  const [existing] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Folder not found' });
  }

  const { name, description, color } = req.body;
  const updateFields = { updatedAt: new Date() };

  if (name !== undefined) updateFields.name = name.trim();
  if (description !== undefined) updateFields.description = description.trim();
  if (color !== undefined) updateFields.color = color;

  const [updatedFolder] = await db
    .update(folders)
    .set(updateFields)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Topic folder updated successfully',
    folder: updatedFolder,
    data: updatedFolder,
  });
});

// @desc    Delete a topic folder (and clean up associated S3 files)
// @route   DELETE /api/folders/:id
// @access  Private
export const deleteFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = parseInt(req.params.id, 10);

  if (isNaN(folderId)) {
    return res.status(400).json({ success: false, message: 'Invalid folder ID' });
  }

  const [existing] = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Folder not found' });
  }

  // Find all notes in this folder to delete files from S3
  const folderNotes = await db
    .select()
    .from(notes)
    .where(and(eq(notes.folderId, folderId), eq(notes.userId, userId)));

  for (const note of folderNotes) {
    if (note.s3Key) {
      await deleteFileFromS3(note.s3Key);
    }
  }

  await db
    .delete(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)));

  return res.json({
    success: true,
    message: 'Topic folder and its notes deleted successfully',
    id: folderId,
  });
});
