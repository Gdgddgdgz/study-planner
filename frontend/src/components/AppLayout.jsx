import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AppLayout — wraps every protected page with the Sidebar + Topbar.
 * Handles mobile sidebar open/close state centrally.
 *
 * Usage:
 *   <AppLayout title="Dashboard" onAddClick={...}>
 *     {page content}
 *   </AppLayout>
 */
export default function AppLayout({ title, onAddClick, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar
          title={title}
          onAddClick={onAddClick}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
