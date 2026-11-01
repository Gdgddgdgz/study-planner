import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import icons from '../components/icons';

const { Award, Plus, Check } = icons;

const completedTasks = [
  { id: 1, title: 'Read Chapter 4 — Wave Mechanics', subject: 'Physics', completedAt: 'Today, 2:30 PM', hours: '1.5h' },
  { id: 2, title: 'Practice Integration Problems', subject: 'Mathematics', completedAt: 'Today, 10:00 AM', hours: '45m' },
  { id: 3, title: 'Submit Lab Report', subject: 'Chemistry', completedAt: 'Yesterday, 4:00 PM', hours: '2h' },
  { id: 4, title: 'Prepare Presentation Slides', subject: 'Physics', completedAt: 'Aug 12, 3:00 PM', hours: '1h' },
  { id: 5, title: 'Linear Algebra Review', subject: 'Mathematics', completedAt: 'Aug 11, 11:00 AM', hours: '2.5h' },
];

export default function AllTasksCompletedPage() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Tasks" />
        <div className="page-content">
          {/* Celebration Banner */}
          <div className="card mb-24" style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(20,184,166,0.1))',
            borderColor: 'rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', gap: '20px', padding: '28px 32px'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
              <Award />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>🎉 Amazing! All tasks completed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You've completed all your tasks for today. Take a well-deserved break or add new goals!</p>
            </div>
            <Link to="/tasks" className="btn btn-primary" onClick={() => {}}>
              <Plus size={14} /> Add New Task
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Completed Today', value: '5', color: '#22c55e' },
              { label: 'Total This Week', value: '18', color: 'var(--accent-secondary)' },
              { label: 'Study Hours', value: '7.5h', color: '#14b8a6' },
              { label: 'Current Streak', value: '7🔥', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Completed Tasks List */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Completed Tasks</span>
              <span className="badge badge-green">{completedTasks.length} tasks</span>
            </div>
            {completedTasks.map((task, i) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < completedTasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div className="task-checkbox done">
                  <Check size={10} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="task-title done">{task.title}</div>
                  <div className="task-meta">
                    <span className="task-meta-item" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{task.completedAt}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{task.subject}</span>
                  </div>
                </div>
                <span className="badge badge-gray">{task.hours}</span>
              </div>
            ))}
          </div>

          {/* Motivational Quote */}
          <div className="card mt-16" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)', textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💫</div>
            <blockquote style={{ fontSize: '16px', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '8px' }}>
              "The secret of getting ahead is getting started."
            </blockquote>
            <cite style={{ fontSize: '13px', color: 'var(--text-muted)' }}>— Mark Twain</cite>
          </div>
        </div>
      </div>
    </div>
  );
}
