import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import icons from '../components/icons';

const { ArrowRight, Check, BookOpen, Target, Clock, ChevronRight } = icons;

const steps = [
  {
    step: 1,
    emoji: '👋',
    title: 'Welcome to StudyFlow AI',
    subtitle: 'Your AI-powered study companion',
    description: 'StudyFlow helps you organize subjects, track tasks, run focus sessions, and get AI-generated study plans — all in one beautiful app.',
    illustration: null,
  },
  {
    step: 2,
    emoji: '📚',
    title: 'Organize Your Subjects',
    subtitle: 'Keep everything structured',
    description: 'Add all your subjects with custom colors and icons. Track your progress, study hours, and tasks for each subject separately.',
    features: ['Custom subject colors & icons', 'Track hours spent per subject', 'Assign tasks to subjects'],
  },
  {
    step: 3,
    emoji: '⏱️',
    title: 'Focus with Pomodoro',
    subtitle: 'Study smarter, not harder',
    description: 'Use our built-in focus timer with Pomodoro technique presets. Set session goals, track your streaks, and build powerful study habits.',
    features: ['25m / 50m / 90m presets', 'Custom timer durations', 'Break reminders & streaks'],
  },
  {
    step: 4,
    emoji: '🤖',
    title: 'Meet Your AI Study Coach',
    subtitle: 'Personalized plans just for you',
    description: 'Our AI analyzes your schedule, subjects, and progress to generate optimal study plans, prioritize tasks, and suggest improvement strategies.',
    features: ['Personalized study schedules', 'Task prioritization', 'Progress insights'],
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="onboarding-container">
      {/* Left sidebar */}
      <div className="onboarding-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
          <div className="logo-icon"><BookOpen size={21} strokeWidth={2.2} /></div>
          <span className="logo-text">StudyFlow AI</span>
        </div>

        <div style={{ flex: 1 }}>
          {steps.map((s, i) => (
            <div
              key={i}
              style={{ display: 'flex', gap: '14px', marginBottom: '28px', cursor: 'pointer', opacity: i <= currentStep ? 1 : 0.4, transition: 'opacity 0.3s' }}
              onClick={() => setCurrentStep(i)}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: i < currentStep ? '#22c55e' : i === currentStep ? 'var(--accent-primary)' : 'var(--bg-card)',
                border: `2px solid ${i < currentStep ? '#22c55e' : i === currentStep ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                color: i <= currentStep ? 'white' : 'var(--text-muted)',
              }}>
                {i < currentStep ? <Check size={12} /> : i + 1}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: i === currentStep ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step {currentStep + 1} of {steps.length}</div>
      </div>

      {/* Right content */}
      <div className="onboarding-content">
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          {/* Emoji illustration */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 32px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(20,184,166,0.2))',
            border: '2px solid rgba(59,130,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px',
          }}>
            {step.emoji}
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>{step.title}</h1>
          <p style={{ fontSize: '16px', color: 'var(--accent-secondary)', fontWeight: 500, marginBottom: '20px' }}>{step.subtitle}</p>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>{step.description}</p>

          {step.features && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px', textAlign: 'left', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', border: '1px solid var(--border-color)' }}>
              {step.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
                    <Check size={10} />
                  </div>
                  <span style={{ fontSize: '14px' }}>{f}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {currentStep > 0 && (
              <button className="btn btn-secondary" style={{ minWidth: '100px', justifyContent: 'center' }} onClick={() => setCurrentStep(s => s - 1)}>
                Back
              </button>
            )}
            {isLast ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ minWidth: '180px', justifyContent: 'center' }}>
                Get Started 🚀
              </Link>
            ) : (
              <button className="btn btn-primary btn-lg" style={{ minWidth: '180px', justifyContent: 'center' }} onClick={() => setCurrentStep(s => s + 1)}>
                Next <ArrowRight />
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="step-indicator" style={{ justifyContent: 'center', marginTop: '32px' }}>
            {steps.map((_, i) => (
              <div key={i} className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} onClick={() => setCurrentStep(i)} style={{ cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
