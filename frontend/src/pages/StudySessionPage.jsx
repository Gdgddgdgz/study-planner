import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import icons from '../components/icons';
import { useSessions, useSessionStats, useCreateSession } from '../hooks/useSessions';
import { useSubjects } from '../hooks/useSubjects';

const { Play, Pause, RotateCcw, SkipForward, Target, Check, BookOpen } = icons;

const presets = [
  { label: '25m', minutes: 25, description: 'Pomodoro' },
  { label: '50m', minutes: 50, description: 'Deep Work' },
  { label: '90m', minutes: 90, description: 'Flow State' },
];

const defaultSubjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'];

export default function StudySessionPage() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('study'); // 'study' | 'break'
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');
  const [goal, setGoal] = useState('Complete study session');
  const intervalRef = useRef(null);

  // TanStack Query Hooks
  const { data: userSubjects = [] } = useSubjects();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: stats = {} } = useSessionStats();
  const createSessionMutation = useCreateSession();

  const subjectsList =
    userSubjects.length > 0 ? userSubjects.map((s) => s.name) : defaultSubjects;

  const total = presets[selectedPreset].minutes * 60;
  const progress = Math.min(Math.max(((total - seconds) / total) * 100, 0), 100);
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  // Handle session completion and record in backend
  const handleSessionCompleted = () => {
    const durationMinutes = presets[selectedPreset].minutes;
    createSessionMutation.mutate({
      subject: selectedSubject,
      goal,
      duration: durationMinutes,
      phase,
    });
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionCompleted();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, selectedPreset, selectedSubject, goal, phase]);

  const reset = () => {
    setRunning(false);
    setSeconds(presets[selectedPreset].minutes * 60);
  };

  const selectPreset = (i) => {
    setSelectedPreset(i);
    setSeconds(presets[i].minutes * 60);
    setRunning(false);
  };

  // Skip/Finish button records the session
  const handleSkipOrFinish = () => {
    setRunning(false);
    handleSessionCompleted();
    reset();
  };

  const circumference = 2 * Math.PI * 110;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <AppLayout title="Study Session">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main Timer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Phase Toggle */}
          <div style={{ display: 'flex', gap: '8px', width: 'fit-content' }}>
            {['study', 'break'].map((p) => (
              <button
                key={p}
                className={`filter-chip ${phase === p ? 'active' : ''}`}
                style={{ fontSize: '13px', padding: '8px 20px' }}
                onClick={() => {
                  setPhase(p);
                  setRunning(false);
                }}
              >
                {p === 'study' ? '🎯 Study' : '☕ Break'}
              </button>
            ))}
          </div>

          {/* Timer Circle */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
            <div style={{ position: 'relative', width: '260px', height: '260px', marginBottom: '32px' }}>
              <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="130" cy="130" r="110" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
                <circle
                  cx="130"
                  cy="130"
                  r="110"
                  fill="none"
                  stroke="url(#timerGrad)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="timer-display">{mins}:{secs}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {phase === 'study' ? '🎯 Focus Time' : '☕ Break Time'}
                </div>
              </div>
            </div>

            {/* Preset Pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => selectPreset(i)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedPreset === i ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: selectedPreset === i ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${selectedPreset === i ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button onClick={reset} title="Reset Timer" className="icon-btn" style={{ width: '44px', height: '44px' }}>
                <RotateCcw />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--accent-primary), #2563eb)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {running ? <Pause /> : <Play />}
              </button>
              <button onClick={handleSkipOrFinish} title="Complete/Save Session" className="icon-btn" style={{ width: '44px', height: '44px' }}>
                <SkipForward />
              </button>
            </div>
          </div>

          {/* Session Goal */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">Session Goal</span>
            </div>
            <input
              className="form-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What do you want to accomplish?"
              style={{ marginBottom: '12px' }}
            />
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-input form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                {subjectsList.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Session Stats */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: '16px' }}>
              Today's Progress
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Sessions', value: stats.sessionCount ?? 0 },
                { label: 'Focus Time', value: stats.focusTime || '0m' },
                { label: 'Break Time', value: stats.breakTime || '0m' },
                { label: 'Streak', value: stats.streak || '0 🔥' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: '14px' }}>
              Recent Sessions
            </div>
            {sessionsLoading ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No sessions yet. Start the timer to record your first focus session!
              </div>
            ) : (
              sessions.slice(0, 5).map((s, i) => (
                <div
                  key={s.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    borderBottom: i < sessions.length - 1 ? '1px solid var(--border-light)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(34,197,94,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22c55e',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.subject}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.date || 'Recent'}</div>
                  </div>
                  <span className="badge badge-purple">{s.durationText || `${s.duration}m`}</span>
                </div>
              ))
            )}
          </div>

          {/* Tips */}
          <div className="card" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '6px' }}>
              💡 Study Tip
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Take short breaks every 25 minutes. Your brain consolidates memory during rest periods!
            </p>
          </div>
        </div>{/* ← FIX: closes Right Panel */}
      </div>{/* ← FIX: closes the outer grid */}
    </AppLayout>
  );
}