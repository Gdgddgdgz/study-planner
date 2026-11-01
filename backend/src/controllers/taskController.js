// taskController.js - handles CRUD operations for user tasks
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

// @desc    Get all tasks for current user (with optional filter & subject query)
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { filter, subject } = req.query;

  // Fetch all tasks for the user ordered by newest first
  let userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.id));

  // In-memory filter matching frontend chip filters if provided
  if (subject && subject !== 'All') {
    userTasks = userTasks.filter((t) => t.subject?.toLowerCase() === subject.toLowerCase());
  }

  if (filter && filter !== 'All') {
    const f = filter.toLowerCase();
    if (f === 'pending') {
      userTasks = userTasks.filter((t) => !t.done);
    } else if (f === 'completed') {
      userTasks = userTasks.filter((t) => t.done);
    } else if (f === 'high priority' || f === 'high') {
      userTasks = userTasks.filter((t) => t.priority === 'high');
    }
  }

  // Format to ensure frontend compatibility (has both desc and description)
  const formattedTasks = userTasks.map((t) => ({
    ...t,
    desc: t.description || '',
  }));

  const pendingCount = formattedTasks.filter((t) => !t.done).length;
  const completedCount = formattedTasks.filter((t) => t.done).length;

  return res.json({
    success: true,
    total: formattedTasks.length,
    pending: pendingCount,
    completed: completedCount,
    tasks: formattedTasks,
    data: formattedTasks,
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  return res.json({
    success: true,
    task: { ...task, desc: task.description || '' },
    data: { ...task, desc: task.description || '' },
  });
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { title, subject, due, priority, description, desc: shortDesc } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const finalDesc = description || shortDesc || '';
  const finalSubject = subject?.trim() || 'Computer Science';
  const finalPriority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';

  const [newTask] = await db
    .insert(tasks)
    .values({
      userId,
      title: title.trim(),
      subject: finalSubject,
      due: due ? String(due).trim() : '',
      priority: finalPriority,
      done: false,
      description: finalDesc,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task: { ...newTask, desc: newTask.description || '' },
    data: { ...newTask, desc: newTask.description || '' },
  });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id or PATCH /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const { title, subject, due, priority, done, description, desc: shortDesc } = req.body;

  const updateFields = {
    updatedAt: new Date(),
  };

  if (title !== undefined) updateFields.title = title.trim();
  if (subject !== undefined) updateFields.subject = subject.trim();
  if (due !== undefined) updateFields.due = String(due).trim();
  if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
    updateFields.priority = priority;
  }
  if (done !== undefined) updateFields.done = Boolean(done);
  if (description !== undefined || shortDesc !== undefined) {
    updateFields.description = description !== undefined ? description : shortDesc;
  }

  const [updatedTask] = await db
    .update(tasks)
    .set(updateFields)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Task updated successfully',
    task: { ...updatedTask, desc: updatedTask.description || '' },
    data: { ...updatedTask, desc: updatedTask.description || '' },
  });
});

// @desc    Quick toggle done status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
export const toggleTaskDone = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const [updatedTask] = await db
    .update(tasks)
    .set({
      done: !existing.done,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  return res.json({
    success: true,
    message: 'Task status updated',
    task: { ...updatedTask, desc: updatedTask.description || '' },
    data: { ...updatedTask, desc: updatedTask.description || '' },
  });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ success: false, message: 'Invalid task ID' });
  }

  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  return res.json({
    success: true,
    message: 'Task deleted successfully',
    id: taskId,
  });
});
