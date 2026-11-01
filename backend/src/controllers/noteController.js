// noteController.js - handles notes records with AWS S3 upload and storage
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { notes, folders, subjects } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { uploadFileToS3, getS3DownloadUrl, deleteFileFromS3, isS3Configured } from '../lib/s3.js';

// @desc    Get all notes for logged-in user (optional filters: ?subjectId=... & ?folderId=...)
// @route   GET /api/notes
// @access  Private
export const getNotes = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { subjectId, folderId, chapterId } = req.query;

  let queryConditions = [eq(notes.userId, userId)];

  if (subjectId) {
    const sId = parseInt(subjectId, 10);
    if (!isNaN(sId)) queryConditions.push(eq(notes.subjectId, sId));
  }

  const targetFolderId = folderId || chapterId;
  if (targetFolderId) {
    const fId = parseInt(targetFolderId, 10);
    if (!isNaN(fId)) {
      queryConditions.push(eq(notes.folderId, fId));
    }
  }

  const userNotes = await db
    .select()
    .from(notes)
    .where(and(...queryConditions))
    .orderBy(desc(notes.id));

  // If AWS S3 is active, attach signed URLs if needed
  const notesWithUrls = await Promise.all(
    userNotes.map(async (n) => {
      let downloadUrl = n.fileUrl;
      if (n.s3Key && isS3Configured()) {
        const presigned = await getS3DownloadUrl(n.s3Key, 7200);
        if (presigned) downloadUrl = presigned;
      }
      return {
        ...n,
        downloadUrl,
      };
    })
  );

  return res.json({
    success: true,
    total: notesWithUrls.length,
    notes: notesWithUrls,
    data: notesWithUrls,
    s3Configured: isS3Configured(),
  });
});

// @desc    Upload note file directly to AWS S3 & save record
// @route   POST /api/notes/upload
// @access  Private
export const uploadNote = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { title, subjectId, folderId, chapterId, content } = req.body;

  const parsedSubjectId = parseInt(subjectId, 10);
  if (isNaN(parsedSubjectId)) {
    return res.status(400).json({ success: false, message: 'Valid subject ID is required' });
  }

  const effectiveFolderId = folderId || chapterId;
  const parsedFolderId = effectiveFolderId ? parseInt(effectiveFolderId, 10) : null;

  // Retrieve subject name for clean S3 key (userid/subject/topic/file.pdf)
  const [subjectRow] = await db
    .select({ name: subjects.name })
    .from(subjects)
    .where(and(eq(subjects.id, parsedSubjectId), eq(subjects.userId, userId)));

  const subjectName = subjectRow?.name || `subject_${parsedSubjectId}`;

  // Retrieve topic/folder name if folderId was provided
  let topicName = 'general';
  if (parsedFolderId) {
    const [folderRow] = await db
      .select({ name: folders.name })
      .from(folders)
      .where(and(eq(folders.id, parsedFolderId), eq(folders.userId, userId)));
    if (folderRow?.name) {
      topicName = folderRow.name;
    }
  }

  let fileUrl = null;
  let s3Key = null;
  let fileName = null;
  let fileType = null;
  let fileSize = null;

  if (req.file) {
    fileName = req.file.originalname;
    fileType = req.file.mimetype;
    fileSize = req.file.size;

    const s3Result = await uploadFileToS3({
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      userId,
      subject: subjectName,
      topic: topicName,
      subjectId: parsedSubjectId,
      folderId: parsedFolderId,
    });

    fileUrl = s3Result.fileUrl;
    s3Key = s3Result.s3Key;
  }

  const noteTitle = (title && title.trim()) || fileName || 'Untitled Note';

  // Prevent duplicate records: check if identical note was uploaded within last 5 seconds
  const recentDuplicate = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.subjectId, parsedSubjectId),
        fileName ? eq(notes.fileName, fileName) : eq(notes.title, noteTitle)
      )
    )
    .orderBy(desc(notes.id))
    .limit(1);

  if (recentDuplicate.length > 0) {
    const existing = recentDuplicate[0];
    const diffMs = Date.now() - new Date(existing.createdAt).getTime();
    if (diffMs < 5000) {
      return res.status(200).json({
        success: true,
        message: 'Note uploaded successfully',
        note: existing,
        data: existing,
      });
    }
  }

  const [newNote] = await db
    .insert(notes)
    .values({
      userId,
      subjectId: parsedSubjectId,
      folderId: parsedFolderId,
      chapterId: null,
      title: noteTitle,
      fileUrl,
      s3Key,
      fileName,
      fileType,
      fileSize,
      content: content || null,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Note and file uploaded to S3 successfully',
    note: newNote,
    data: newNote,
  });
});

// @desc    Get note by ID (includes presigned S3 download/view URL)
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = parseInt(req.params.id, 10);

  if (isNaN(noteId)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  let presignedUrl = note.fileUrl;
  if (note.s3Key && isS3Configured()) {
    presignedUrl = (await getS3DownloadUrl(note.s3Key)) || note.fileUrl;
  }

  return res.json({
    success: true,
    note: {
      ...note,
      downloadUrl: presignedUrl,
    },
    data: {
      ...note,
      downloadUrl: presignedUrl,
    },
  });
});

// @desc    Create a new note record manually (or with pre-uploaded URL)
// @route   POST /api/notes
// @access  Private
export const createNote = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const {
    title,
    subjectId,
    folderId,
    chapterId,
    fileUrl,
    s3Key,
    fileName,
    fileType,
    fileSize,
    content,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Note title is required' });
  }

  const parsedSubjectId = parseInt(subjectId, 10);
  if (isNaN(parsedSubjectId)) {
    return res.status(400).json({ success: false, message: 'Valid subject ID is required' });
  }

  const targetFolderId = folderId || chapterId;
  const parsedFolderId = targetFolderId ? parseInt(targetFolderId, 10) : null;

  const [newNote] = await db
    .insert(notes)
    .values({
      userId,
      subjectId: parsedSubjectId,
      folderId: parsedFolderId,
      chapterId: null,
      title: title.trim(),
      fileUrl: fileUrl?.trim() || null,
      s3Key: s3Key?.trim() || null,
      fileName: fileName?.trim() || null,
      fileType: fileType?.trim() || null,
      fileSize: fileSize ? parseInt(fileSize, 10) : null,
      content: content || null,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Note created successfully',
    note: newNote,
    data: newNote,
  });
});

// @desc    Update note metadata / content
// @route   PUT /api/notes/:id or PATCH /api/notes/:id
// @access  Private
export const updateNote = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = parseInt(req.params.id, 10);

  if (isNaN(noteId)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }

  const [existing] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  const {
    title,
    folderId,
    chapterId,
    fileUrl,
    s3Key,
    fileName,
    fileType,
    fileSize,
    content,
  } = req.body;

  const updateFields = { updatedAt: new Date() };

  if (title !== undefined) updateFields.title = title.trim();
  const targetFolder = folderId !== undefined ? folderId : chapterId;
  if (targetFolder !== undefined) {
    const fId = targetFolder ? parseInt(targetFolder, 10) : null;
    updateFields.folderId = fId;
    updateFields.chapterId = fId;
  }
  if (fileUrl !== undefined) updateFields.fileUrl = fileUrl;
  if (s3Key !== undefined) updateFields.s3Key = s3Key;
  if (fileName !== undefined) updateFields.fileName = fileName;
  if (fileType !== undefined) updateFields.fileType = fileType;
  if (fileSize !== undefined) updateFields.fileSize = fileSize ? parseInt(fileSize, 10) : null;
  if (content !== undefined) updateFields.content = content;

  const [updatedNote] = await db
    .update(notes)
    .set(updateFields)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Note updated successfully',
    note: updatedNote,
    data: updatedNote,
  });
});

// @desc    Delete note record (and remove file from AWS S3)
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const noteId = parseInt(req.params.id, 10);

  if (isNaN(noteId)) {
    return res.status(400).json({ success: false, message: 'Invalid note ID' });
  }

  const [existing] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  // Remove file from AWS S3 if an s3Key exists
  if (existing.s3Key) {
    await deleteFileFromS3(existing.s3Key);
  }

  await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));

  return res.json({
    success: true,
    message: 'Note and S3 file deleted successfully',
    id: noteId,
  });
});

// @desc    Get notes specifically for a chapter / folder
// @route   GET /api/chapters/:chapterId/notes or /api/folders/:folderId/notes
// @access  Private
export const getNotesByChapter = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = parseInt(req.params.chapterId || req.params.folderId, 10);

  if (isNaN(folderId)) {
    return res.status(400).json({ success: false, message: 'Invalid folder/chapter ID' });
  }

  const folderNotes = await db
    .select()
    .from(notes)
    .where(and(eq(notes.folderId, folderId), eq(notes.userId, userId)))
    .orderBy(desc(notes.id));

  return res.json({
    success: true,
    total: folderNotes.length,
    notes: folderNotes,
    data: folderNotes,
  });
});
