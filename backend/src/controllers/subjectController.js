// subjectController.js - handles subject management & statistics
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { subjects, chapters, notes, tasks, users } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

// @desc    Get all subjects for the logged-in user with task & chapter statistics
// @route   GET /api/subjects
// @access  Private
export const getSubjects = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const userSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userId, userId))
    .orderBy(desc(subjects.id));

  // Get user tasks to calculate accurate tasks/completion per subject
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));

  // Calculate task counts per subject name
  const subjectsWithStats = userSubjects.map((sub) => {
    const matchingTasks = userTasks.filter(
      (t) => t.subject?.toLowerCase() === sub.name?.toLowerCase() || t.subjectId === sub.id
    );
    const completedTasks = matchingTasks.filter((t) => t.done).length;
    const totalTasks = matchingTasks.length;

    // Progress based on completed tasks or default progress field
    const calculatedProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : sub.progress || 0;

    return {
      ...sub,
      tasks: totalTasks,
      completed: completedTasks,
      hours: String(sub.targetHours || 10),
      progress: calculatedProgress,
      lastStudied: 'Recently',
    };
  });

  return res.json({
    success: true,
    total: subjectsWithStats.length,
    subjects: subjectsWithStats,
    data: subjectsWithStats,
  });
});

// @desc    Get a single subject with its chapters & notes count
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.id, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  const [subject] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  if (!subject) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  // Fetch chapters for this subject
  const subjectChapters = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.subjectId, subjectId), eq(chapters.userId, userId)))
    .orderBy(chapters.order);

  return res.json({
    success: true,
    subject: {
      ...subject,
      chapters: subjectChapters,
    },
    data: {
      ...subject,
      chapters: subjectChapters,
    },
  });
});

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { name, description, color, icon, targetHours, notes: subNotes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Subject name is required' });
  }

  const [newSubject] = await db
    .insert(subjects)
    .values({
      userId,
      name: name.trim(),
      description: description?.trim() || '',
      color: color?.trim() || '#3b82f6',
      icon: icon?.trim() || '📚',
      targetHours: targetHours ? parseInt(targetHours, 10) : 10,
      notes: subNotes || '',
      progress: 0,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    subject: newSubject,
    data: newSubject,
  });
});

// @desc    Update an existing subject
// @route   PUT /api/subjects/:id or PATCH /api/subjects/:id
// @access  Private
export const updateSubject = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.id, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  const [existing] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  const { name, description, color, icon, targetHours, notes: subNotes, progress } = req.body;

  const updateFields = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateFields.name = name.trim();
  if (description !== undefined) updateFields.description = description.trim();
  if (color !== undefined) updateFields.color = color.trim();
  if (icon !== undefined) updateFields.icon = icon.trim();
  if (targetHours !== undefined) updateFields.targetHours = parseInt(targetHours, 10) || 0;
  if (subNotes !== undefined) updateFields.notes = subNotes;
  if (progress !== undefined) updateFields.progress = parseInt(progress, 10) || 0;

  const [updatedSubject] = await db
    .update(subjects)
    .set(updateFields)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Subject updated successfully',
    subject: updatedSubject,
    data: updatedSubject,
  });
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const subjectId = parseInt(req.params.id, 10);

  if (isNaN(subjectId)) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  const [existing] = await db
    .select()
    .from(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Subject not found' });
  }

  await db
    .delete(subjects)
    .where(and(eq(subjects.id, subjectId), eq(subjects.userId, userId)));

  return res.json({
    success: true,
    message: 'Subject deleted successfully',
    id: subjectId,
  });
});

// @desc    Batch onboard subjects for new users and set is_on_boarded = true
// @route   POST /api/subjects/onboard
// @access  Private
export const onboardSubjects = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { subjectsList } = req.body; // array of subjects or names

  if (!Array.isArray(subjectsList) || subjectsList.length === 0) {
    return res.status(400).json({ success: false, message: 'Please select at least one subject' });
  }

  const inserts = subjectsList.map((item) => {
    if (typeof item === 'string') {
      return {
        userId,
        name: item.trim(),
        description: '',
        color: '#3b82f6',
        icon: '📚',
        targetHours: 10,
        progress: 0,
      };
    }
    return {
      userId,
      name: item.name || 'Untitled Subject',
      description: item.description || '',
      color: item.color || '#3b82f6',
      icon: item.icon || '📚',
      targetHours: item.targetHours || 10,
      progress: 0,
    };
  });

  const created = await db.insert(subjects).values(inserts).returning();

  // Mark user as onboarded
  await db
    .update(users)
    .set({ is_on_boarded: true })
    .where(eq(users.id, userId));

  return res.status(201).json({
    success: true,
    message: 'Subjects onboarded successfully',
    subjects: created,
  });
});
