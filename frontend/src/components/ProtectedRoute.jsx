import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, token, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #0f172a)',
        color: 'var(--text-primary, #f8fafc)',
        gap: '16px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(59,130,246,0.2)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 500 }}>
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
