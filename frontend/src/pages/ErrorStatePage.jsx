import React from 'react';
import { Link } from 'react-router-dom';
import icons from '../components/icons';

const { AlertTriangle, RefreshCw, Home } = icons;

export default function ErrorStatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div style={{ textAlign: 'center', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Error icon */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 28px',
          background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444'
        }}>
          <AlertTriangle />
        </div>

        <div style={{ fontSize: '80px', fontWeight: 800, background: 'linear-gradient(135deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: '4px' }}>
          Oops!
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Something went wrong</h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
          We encountered an unexpected error. This might be a temporary issue. Please try refreshing the page or going back to the dashboard.
        </p>

        {/* Error details card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)',
          padding: '14px 18px', marginBottom: '28px', textAlign: 'left'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#ef4444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Error Details</div>
          <code style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            TypeError: Cannot read properties of undefined (reading 'data')<br />
            at fetchUserData (api.js:42)<br />
            at DashboardPage (DashboardPage.jsx:18)
          </code>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCw /> Try Again
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            <Home /> Go to Dashboard
          </Link>
        </div>

        <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          If the issue persists, <a href="#" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>contact support</a>
        </p>
      </div>
    </div>
  );
}
