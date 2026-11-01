import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import icons from '../components/icons';
import { useAuth } from '../context/AuthContext';

const { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen } = icons;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setForm({
      email: 'ahmed@studyflow.ai',
      password: 'password123',
    });
    setError('');
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

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to continue your learning journey</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail />
              </span>
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={handleFillDemo}
                style={{ fontSize: '12px', color: 'var(--accent-secondary, #38bdf8)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Use Demo Account
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
              <span
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? <EyeOff /> : <Eye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '8px', justifyContent: 'center' }}
          >
            {loading ? 'Signing In...' : <>Sign In <ArrowRight /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-secondary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
