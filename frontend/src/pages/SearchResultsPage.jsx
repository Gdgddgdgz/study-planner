import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import icons from '../components/icons';

const { Check, Calendar } = icons;

const results = [
  { id: 1, title: 'Complete Data Structures Assignment', subject: 'Computer Science', subjectColor: '#3b82f6', due: 'Aug 14', priority: 'high', done: false },
  { id: 2, title: 'Practice Integration Problems', subject: 'Mathematics', subjectColor: '#22c55e', due: 'Aug 16', priority: 'low', done: true },
  { id: 3, title: 'Data Science Project Proposal', subject: 'Computer Science', subjectColor: '#3b82f6', due: 'Aug 20', priority: 'medium', done: false },
];

const priorityColors = { high: 'badge-red', medium: 'badge-amber', low: 'badge-gray' };

export default function SearchResultsPage() {
  const [query, setQuery] = useState('data');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Search" />
        <div className="page-content">
          {/* Search Bar — big */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-lg)', padding: '12px 20px', marginBottom: '24px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: 'var(--text-primary)', fontSize: '16px', fontFamily: 'inherit' }}
              placeholder="Search tasks, subjects..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
          </div>

          {/* Results Summary */}
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Found <strong style={{ color: 'var(--text-primary)' }}>{results.length} results</strong> for "{query}"
          </div>

          {/* Filter Chips */}
          <div className="filter-row mb-16">
            {['All', 'Tasks', 'Subjects', 'Notes'].map(f => (
              <button key={f} className={`filter-chip ${f === 'All' ? 'active' : ''}`}>{f}</button>
            ))}
          </div>

          {/* Results */}
          <div className="card" style={{ padding: '8px 24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 0 4px' }}>Tasks ({results.length})</div>
            {results.map(r => (
              <div key={r.id} className="task-item">
                <div className={`task-checkbox ${r.done ? 'done' : ''}`}>
                  {r.done && <Check size={10} />}
                </div>
                <div className="task-info">
                  <div className={`task-title ${r.done ? 'done' : ''}`}>
                    {r.title.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === query.toLowerCase()
                        ? <mark key={i} style={{ background: 'rgba(59,130,246,0.3)', color: 'var(--accent-secondary)', borderRadius: '2px' }}>{part}</mark>
                        : part
                    )}
                  </div>
                  <div className="task-meta">
                    <span className="task-meta-item"><Calendar /> {r.due}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: r.subjectColor, fontWeight: 500 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.subjectColor, display: 'inline-block' }} />
                      {r.subject}
                    </span>
                  </div>
                </div>
                <span className={`badge ${priorityColors[r.priority]}`}>{r.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
