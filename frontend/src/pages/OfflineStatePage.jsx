import React from 'react';
import { Link } from 'react-router-dom';
import icons from '../components/icons';

const { WifiOff, RefreshCw, Home } = icons;

export default function OfflineStatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,116,139,0.08), transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div style={{ textAlign: 'center', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Offline icon */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 28px',
          background: 'rgba(100,116,139,0.1)', border: '2px solid rgba(100,116,139,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
        }}>
          <WifiOff />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>You're offline</h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
          It looks like you've lost your internet connection. Don't worry — your data is safely saved locally.
        </p>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '10px 20px', width: 'fit-content', margin: '0 auto 28px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} className="pulse" />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No internet connection detected</span>
        </div>

        {/* What you can still do */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>✅ What you can still do offline:</div>
          {[
            'View your existing tasks and subjects',
            'Review your study history',
            'Read locally cached content',
          ].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
              <span style={{ color: '#22c55e', fontSize: '14px' }}>•</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item}</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: '#f59e0b' }}>
            ⚠️ AI Planner and sync features require an internet connection.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCw /> Retry Connection
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            <Home /> Continue Offline
          </Link>
        </div>
      </div>
    </div>
  );
}
