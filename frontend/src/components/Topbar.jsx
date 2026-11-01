import React from 'react';
import icons from './icons';

const { Search, Bell, Plus, Menu } = icons;

export default function Topbar({ title, onAddClick, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — only shows on mobile */}
        <button
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="search-bar">
          <Search />
          <input placeholder="Search..." />
        </div>
        <div className="icon-btn" style={{ position: 'relative' }}>
          <Bell />
          <span className="notif-dot" />
        </div>
        {onAddClick && (
          <button className="btn btn-primary btn-sm" onClick={onAddClick}>
            <Plus size={14} /> <span className="btn-add-label">Add New</span>
          </button>
        )}
      </div>
    </header>
  );
}
