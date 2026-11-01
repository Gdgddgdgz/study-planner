import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icons from '../components/icons';
import { useAuth } from '../context/AuthContext';

const { User, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } = icons;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.password || form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(form.username.trim(), form.email.trim(), form.password);
      if (result.success) {
        navigate('/onboarding');
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-glow" />
      <div style={{ position: 'absolute', bottom: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08), transparent 70%)' }} />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><BookOpen size={21} strokeWidth={2.2} /></div>
          <span className="logo-text" style={{ fontSize: '20px' }}>StudyFlow AI</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Start your AI-powered study journey today</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md, 8px)',
            color: '#ef4444',
            padding: '10px 14px',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
                background: step >= s ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: step >= s ? 'white' : 'var(--text-muted)',
                border: `1px solid ${step >= s ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              }}>
                {s}
              </div>
              {s < 2 && <div style={{ flex: 1, height: '1px', background: step > s ? 'var(--accent-primary)' : 'var(--border-color)', maxWidth: '60px' }} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><User /></span>
                <input
                  className="form-input"
                  placeholder="Ahmed Khan"
                  style={{ paddingLeft: '40px' }}
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Mail /></span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ahmed@example.com"
                  style={{ paddingLeft: '40px' }}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '4px', justifyContent: 'center' }}>
              Continue <ArrowRight />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Lock /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <span onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff /> : <Eye />}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Lock /></span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  style={{ paddingLeft: '40px' }}
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? 'Creating Account...' : <>Create Account <ArrowRight /></>}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
