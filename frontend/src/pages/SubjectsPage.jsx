import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import icons from '../components/icons';
import { useSubjects, useCreateSubject, useDeleteSubject } from '../hooks/useSubjects';

const { Plus, Edit, Trash, ChevronRight, X, Check, Clock, Folder } = icons;

export default function SubjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3b82f6', icon: '📚', description: '' });

  const colorOptions = ['#3b82f6', '#22c55e', '#14b8a6', '#f59e0b', '#ec4899', '#2563eb', '#ef4444', '#06b6d4'];
  const iconOptions = ['💻', '📐', '⚡', '🧪', '📖', '📊', '🔬', '🎨', '📚', '🌍'];

  // TanStack Query Hooks
  const { data: subjects = [], isLoading } = useSubjects();
  const createSubjectMutation = useCreateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;

    createSubjectMutation.mutate(newSubject, {
      onSuccess: () => {
        setShowModal(false);
        setNewSubject({ name: '', color: '#3b82f6', icon: '📚', description: '' });
      },
    });
  };

  const handleDeleteSubject = (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    deleteSubjectMutation.mutate(id);
  };

  const totalTasks = subjects.reduce((a, s) => a + (s.tasks || 0), 0);
  const totalHours = subjects.reduce((a, s) => a + parseFloat(s.hours || 0), 0).toFixed(1);
  const avgProgress =
    subjects.length > 0
      ? Math.round(subjects.reduce((a, s) => a + (s.progress || 0), 0) / subjects.length)
      : 0;

  return (
    <>
    <AppLayout title="Subjects" onAddClick={() => setShowModal(true)}>
          {/* Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Subjects', value: subjects.length },
              { label: 'Total Hours', value: totalHours + 'h' },
              { label: 'Total Tasks', value: totalTasks },
              { label: 'Avg. Progress', value: avgProgress + '%' },
            ].map((s) => (
              <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '2px' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Subjects Grid */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Loading subjects...
            </div>
          ) : (
            <div className="subjects-grid">
              {subjects.map((sub) => (
                <div key={sub.id} className="subject-card">
                  <div className="subject-color-bar" style={{ background: sub.color || 'var(--accent-primary)' }} />
                  <div style={{ paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '26px' }}>{sub.icon || '📚'}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{sub.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                            {sub.description || 'No description'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Link
                          to={`/subjects/edit/${sub.id}`}
                          className="icon-btn"
                          style={{ width: '28px', height: '28px', border: 'none', background: 'transparent' }}
                        >
                          <Edit />
                        </Link>
                        <button
                          className="icon-btn"
                          onClick={() => handleDeleteSubject(sub.id)}
                          style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#ef4444' }}
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{sub.progress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${sub.progress || 0}%`,
                            background: `linear-gradient(90deg, ${sub.color || '#3b82f6'}, ${sub.color || '#3b82f6'}aa)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{sub.completed || 0}</strong>/{sub.tasks || 0} tasks
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{sub.hours || 0}h</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Clock /> {sub.lastStudied || 'Recently'}
                      </span>
                    </div>

                    {/* Open Topic Folders & Notes Link */}
                    <Link
                      to={`/notes?subjectId=${sub.id}`}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '12px',
                        padding: '6px 12px',
                        gap: '6px',
                        borderRadius: 'var(--radius-sm)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <Folder size={14} color={sub.color || 'var(--accent-primary)'} />
                      <span>Topic Folders & Notes</span>
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add Subject Card */}
              <div
                className="subject-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: '160px',
                  border: '2px dashed var(--border-color)',
                  background: 'transparent',
                }}
                onClick={() => setShowModal(true)}
              >
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>Add Subject</div>
                </div>
              </div>
            </div>
          )}
    </AppLayout>
      {/* Add Subject Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Subject</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)} style={{ border: 'none' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input
                  className="form-input"
                  placeholder="e.g., Computer Science"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  placeholder="Brief description of topics covered"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              {/* Icon Picker */}
              <div className="form-group">
                <label className="form-label">Subject Icon</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {iconOptions.map((ic) => (
                    <div
                      key={ic}
                      onClick={() => setNewSubject((p) => ({ ...p, icon: ic }))}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: newSubject.icon === ic ? 'rgba(59,130,246,0.2)' : 'var(--bg-secondary)',
                        border: `2px solid ${newSubject.icon === ic ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      }}
                    >
                      {ic}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="form-group">
                <label className="form-label">Choose Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {colorOptions.map((c) => (
                    <div
                      key={c}
                      onClick={() => setNewSubject((p) => ({ ...p, color: c }))}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        border: `3px solid ${newSubject.color === c ? 'white' : 'transparent'}`,
                        outline: `2px solid ${newSubject.color === c ? c : 'transparent'}`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={createSubjectMutation.isPending}>
                  {createSubjectMutation.isPending ? 'Adding...' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
