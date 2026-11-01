// sessionController.js - handles study timer sessions & analytics
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { study_sessions } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';

// @desc    Get user study sessions (recent sessions list)
// @route   GET /api/sessions
// @access  Private
export const getSessions = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const userSessions = await db
    .select()
    .from(study_sessions)
    .where(eq(study_sessions.userId, userId))
    .orderBy(desc(study_sessions.id))
    .limit(20);

  const formatted = userSessions.map((s) => ({
    ...s,
    durationText: `${s.duration}m`,
    date: new Date(s.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return res.json({
    success: true,
    total: formatted.length,
    sessions: formatted,
    data: formatted,
  });
});

// @desc    Record a completed study session
// @route   POST /api/sessions
// @access  Private
export const createSession = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { subject, goal, duration, phase } = req.body;

  const validDuration = parseInt(duration, 10) || 25;
  const validPhase = phase === 'break' ? 'break' : 'study';
  const validSubject = subject?.trim() || 'General';

  const [newSession] = await db
    .insert(study_sessions)
    .values({
      userId,
      subject: validSubject,
      goal: goal?.trim() || '',
      duration: validDuration,
      phase: validPhase,
      completed: true,
    })
    .returning();

  return res.status(201).json({
    success: true,
    message: 'Session recorded successfully',
    session: {
      ...newSession,
      durationText: `${newSession.duration}m`,
      date: 'Just now',
    },
    data: newSession,
  });
});

// @desc    Get today's session summary stats & streak
// @route   GET /api/sessions/stats
// @access  Private
export const getSessionStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const allSessions = await db
    .select()
    .from(study_sessions)
    .where(eq(study_sessions.userId, userId));

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todaySessions = allSessions.filter(
    (s) => new Date(s.createdAt) >= startOfToday
  );

  const todayFocusSessions = todaySessions.filter((s) => s.phase === 'study');
  const todayBreakSessions = todaySessions.filter((s) => s.phase === 'break');

  const focusMinutes = todayFocusSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const breakMinutes = todayBreakSessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  // Compute active streak (unique consecutive study days)
  const uniqueDays = new Set(
    allSessions.map((s) => new Date(s.createdAt).toISOString().split('T')[0])
  );
  const streakDays = Math.max(uniqueDays.size, uniqueDays.size > 0 ? 1 : 0);

  return res.json({
    success: true,
    stats: {
      sessionCount: todayFocusSessions.length,
      focusTime: `${focusMinutes}m`,
      focusMinutes,
      breakTime: `${breakMinutes}m`,
      breakMinutes,
      streak: `${streakDays} 🔥`,
      totalSessions: allSessions.length,
    },
    data: {
      sessionCount: todayFocusSessions.length,
      focusTime: `${focusMinutes}m`,
      focusMinutes,
      breakTime: `${breakMinutes}m`,
      breakMinutes,
      streak: `${streakDays} 🔥`,
    },
  });
});
