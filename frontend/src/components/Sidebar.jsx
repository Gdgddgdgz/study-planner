import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import icons from './icons';
import { useAuth } from '../context/AuthContext';

const { LayoutDashboard, CheckSquare, Book, Folder, Timer, BrainCircuit, Settings, BookOpen, LogOut, X } = icons;

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks', badge: '5' },
  { icon: Book, label: 'Subjects', path: '/subjects' },
  { icon: Folder, label: 'Notes', path: '/notes' },
  { icon: Timer, label: 'Study Session', path: '/study-session' },  
  // { icon: BrainCircuit, label: 'AI Planner', path: '/ai-planner' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><BookOpen size={21} strokeWidth={2.2} /></div>
          <span className="logo-text">StudyFlow</span>
          {/* Close button on mobile */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main Menu</span>
          {navItems.map(({ icon: Icon, label, path, badge }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <Icon />
              <span>{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </Link>
          ))}
          <span className="nav-section-label">Account</span>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {LogOut ? <LogOut /> : <Settings />}
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar-row">
            <div className="avatar">{getInitials(user?.username)}</div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.username || 'Student User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'Logged in'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
