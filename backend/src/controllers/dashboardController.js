// dashboardController.js - aggregates dashboard overview data
import asyncHandler from '../lib/asyncHandler.js';
import { db } from '../db/index.js';
import { users, tasks, subjects, study_sessions } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

// @desc    Get aggregated dashboard stats, upcoming tasks, subject progress & weekly activity
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // 1. Fetch user info
  const [currentUser] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      is_on_boarded: users.is_on_boarded,
    })
    .from(users)
    .where(eq(users.id, userId));

  // 2. Fetch tasks
  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.id));

  // 3. Fetch subjects
  const userSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userId, userId))
    .orderBy(desc(subjects.id));

  // 4. Fetch study sessions
  const userSessions = await db
    .select()
    .from(study_sessions)
    .where(eq(study_sessions.userId, userId));

  // Compute stats
  const totalFocusMinutes = userSessions
    .filter((s) => s.phase === 'study')
    .reduce((acc, s) => acc + (s.duration || 0), 0);
  const totalHours = (totalFocusMinutes / 60).toFixed(1);

  const completedTasksCount = userTasks.filter((t) => t.done).length;
  const pendingTasks = userTasks.filter((t) => !t.done);

  // Compute streak
  const uniqueSessionDates = new Set(
    userSessions.map((s) => new Date(s.createdAt).toISOString().split('T')[0])
  );
  const streakText = uniqueSessionDates.size > 0 ? `${uniqueSessionDates.size}d` : '0d';

  // Format upcoming tasks (top 4 pending or all)
  const upcomingTasks = (pendingTasks.length > 0 ? pendingTasks : userTasks)
    .slice(0, 4)
    .map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject || 'General',
      due: t.due || 'Upcoming',
      priority: t.priority || 'medium',
      done: t.done,
    }));

  // Format subject progress
  const subjectProgress = userSubjects.slice(0, 4).map((sub) => {
    const matchingTasks = userTasks.filter(
      (t) => t.subject?.toLowerCase() === sub.name?.toLowerCase() || t.subjectId === sub.id
    );
    const subCompleted = matchingTasks.filter((t) => t.done).length;
    const progress =
      matchingTasks.length > 0
        ? Math.round((subCompleted / matchingTasks.length) * 100)
        : sub.progress || 0;

    return {
      id: sub.id,
      name: sub.name,
      progress,
      color: sub.color || '#3b82f6',
      hours: `${sub.targetHours || 5}h`,
    };
  });

  // Calculate 7-day weekly activity (Mon - Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 for Mon, 6 for Sun

  const weeklyActivity = daysOfWeek.map((day, idx) => {
    // Check sessions created on that day index in the last 7 days
    const daySessions = userSessions.filter((s) => {
      const d = (new Date(s.createdAt).getDay() + 6) % 7;
      return d === idx;
    });
    const minutesOnDay = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const percentage = Math.min(Math.max(Math.round((minutesOnDay / 120) * 100), 20), 100);

    return {
      day,
      height: minutesOnDay > 0 ? percentage : 25,
      minutes: minutesOnDay,
      isToday: idx === todayIndex,
    };
  });

  return res.json({
    success: true,
    user: currentUser,
    greeting: `Good day, ${currentUser?.username || 'Student'}! 👋`,
    stats: [
      { label: 'Study Hours', value: totalHours, color: 'purple', change: '+0h today', up: true },
      { label: 'Tasks Done', value: completedTasksCount, color: 'green', change: `${completedTasksCount} total`, up: true },
      { label: 'Subjects', value: userSubjects.length, color: 'teal', change: 'Active', up: null },
      { label: 'Streak', value: streakText, color: 'amber', change: 'Personal best!', up: true },
    ],
    dueTodayCount: pendingTasks.length,
    upcomingTasks,
    subjectProgress,
    weeklyActivity,
  });
});
