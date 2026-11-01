import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import icons from '../components/icons';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../context/AuthContext';

const { TrendingUp, Target, Timer, BookOpen, CheckSquare, Plus, ChevronRight, Check, Calendar, Clock, Flag, Zap } = icons;

const priorityColors = { high: 'badge-red', medium: 'badge-amber', low: 'badge-gray' };

const iconMap = {
  'Study Hours': Timer,
  'Tasks Done': CheckSquare,
  'Subjects': BookOpen,
  'Streak': Zap,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  const greeting = data?.greeting || `Welcome, ${user?.username || 'Student'}! 👋`;
  const statsList = data?.stats || [
    { label: 'Study Hours', value: '0.0', color: 'purple', change: '+0h today', up: true },
    { label: 'Tasks Done', value: '0', color: 'green', change: '0 total', up: true },
    { label: 'Subjects', value: '0', color: 'teal', change: 'Active', up: null },
    { label: 'Streak', value: '0d', color: 'amber', change: 'Start today!', up: true },
  ];
  const upcomingTasks = data?.upcomingTasks || [];
  const subjectProgress = data?.subjectProgress || [];
  const weeklyActivity = data?.weeklyActivity || [
    { day: 'Mon', height: 25, isToday: false },
    { day: 'Tue', height: 25, isToday: false },
    { day: 'Wed', height: 25, isToday: false },
    { day: 'Thu', height: 25, isToday: true },
    { day: 'Fri', height: 25, isToday: false },
    { day: 'Sat', height: 25, isToday: false },
    { day: 'Sun', height: 25, isToday: false },
  ];
  const dueTodayCount = data?.dueTodayCount ?? 0;

  return (
    <AppLayout title="Dashboard">
          {/* Welcome banner */}
          <div
            className="card mb-24"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(20,184,166,0.1))',
              borderColor: 'rgba(59,130,246,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {greeting}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                You have <strong style={{ color: 'var(--accent-secondary)' }}>{dueTodayCount} pending tasks</strong>.
                {dueTodayCount === 0 ? " You're all caught up!" : " Let's make today productive!"}
              </p>
            </div>
            <Link to="/study-session" className="btn btn-primary">
              Start Session <Zap />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="stat-grid">
            {statsList.map(({ label, value, color, change, up }) => {
              const Icon = iconMap[label] || Target;
              return (
                <div key={label} className={`stat-card ${color}`}>
                  <div className={`stat-icon ${color}`}>
                    <Icon />
                  </div>
                  <div className="stat-value">{isLoading ? '...' : value}</div>
                  <div className="stat-label">{label}</div>
                  {change && (
                    <div className={`stat-change ${up ? 'up' : ''}`}>
                      {up && '↑'} {change}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Upcoming Tasks */}
            <div className="card">
              <div className="section-header">
                <span className="section-title">Upcoming Tasks</span>
                <Link
                  to="/tasks"
                  style={{
                    fontSize: '13px',
                    color: 'var(--accent-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View all <ChevronRight />
                </Link>
              </div>

              {isLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading tasks...
                </div>
              ) : upcomingTasks.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>No upcoming tasks.</p>
                  <Link to="/tasks" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                    <Plus size={12} /> Add your first task
                  </Link>
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className={`task-checkbox ${task.done ? 'done' : ''}`}>
                      {task.done && <Check size={10} />}
                    </div>
                    <div className="task-info">
                      <div className={`task-title ${task.done ? 'done' : ''}`}>{task.title}</div>
                      <div className="task-meta">
                        {task.due && <span className="task-meta-item"><Calendar /> {task.due}</span>}
                        <span className="task-meta-item" style={{ color: 'var(--accent-secondary)', fontSize: '11px' }}>
                          {task.subject}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${priorityColors[task.priority] || 'badge-gray'}`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Subject Progress */}
            <div className="card">
              <div className="section-header">
                <span className="section-title">Subject Progress</span>
                <Link
                  to="/subjects"
                  style={{
                    fontSize: '13px',
                    color: 'var(--accent-secondary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Manage <ChevronRight />
                </Link>
              </div>

              {isLoading ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading subjects...
                </div>
              ) : subjectProgress.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '13px', marginBottom: '8px' }}>No subjects added yet.</p>
                  <Link to="/subjects" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                    <Plus size={12} /> Add Subject
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {subjectProgress.map((sub) => (
                    <div key={sub.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sub.color || '#3b82f6' }} />
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{sub.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.hours}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{sub.progress}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${sub.progress}%`,
                            background: `linear-gradient(90deg, ${sub.color || '#3b82f6'}, ${sub.color || '#3b82f6'}cc)`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Overview */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-header">
                <span className="section-title">Weekly Study Activity</span>
                <div className="tabs">
                  <button className="tab-btn active">This Week</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '100px' }}>
                {weeklyActivity.map((item) => (
                  <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${item.height}%`,
                        background: item.isToday
                          ? 'linear-gradient(135deg, var(--accent-primary), #2563eb)'
                          : 'var(--bg-secondary)',
                        borderRadius: '6px 6px 0 0',
                        border: item.isToday
                          ? '1px solid var(--accent-primary)'
                          : '1px solid var(--border-color)',
                        transition: 'all 0.3s',
                      }}
                      title={`${item.minutes || 0} minutes studied`}
                    />
                    <span
                      style={{
                        fontSize: '10px',
                        color: item.isToday ? 'var(--accent-secondary)' : 'var(--text-muted)',
                        fontWeight: item.isToday ? 600 : 400,
                      }}
                    >
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </AppLayout>
  );
}
