import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import icons from '../components/icons';
import { useSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects';

const { ArrowRight, Trash, Check } = icons;

const colorOptions = ['#3b82f6', '#22c55e', '#14b8a6', '#f59e0b', '#ec4899', '#2563eb', '#ef4444', '#06b6d4', '#f97316'];
const iconOptions = ['💻', '📐', '⚡', '🧪', '📖', '📊', '🔬', '🎨', '🏛️', '🌍'];

export default function EditSubjectPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: subjectData, isLoading } = useSubject(id);
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '💻',
    targetHours: '10',
    notes: '',
  });

  useEffect(() => {
    if (subjectData) {
      setForm({
        name: subjectData.name || '',
        description: subjectData.description || '',
        color: subjectData.color || '#3b82f6',
        icon: subjectData.icon || '💻',
        targetHours: String(subjectData.targetHours || 10),
        notes: subjectData.notes || '',
      });
    }
  }, [subjectData]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert('Subject name is required');

    updateSubjectMutation.mutate(
      { id, ...form },
      {
        onSuccess: () => {
          navigate('/subjects');
        },
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    deleteSubjectMutation.mutate(id, {
      onSuccess: () => {
        navigate('/subjects');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Topbar title="Edit Subject" />
          <div className="page-content" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading subject details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Edit Subject" />
        <div className="page-content" style={{ maxWidth: '640px' }}>
          {/* Preview Card */}
          <div
            className="card mb-24"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderLeft: `4px solid ${form.color}`,
              background: 'rgba(59,130,246,0.05)',
            }}
          >
            <div style={{ fontSize: '40px' }}>{form.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>{form.name || 'Subject Name'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {form.description || 'Description'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Topics covered in this subject"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Target Hours</label>
              <input
                type="number"
                className="form-input"
                value={form.targetHours}
                onChange={(e) => setForm((p) => ({ ...p, targetHours: e.target.value }))}
                placeholder="e.g., 10"
                style={{ width: '120px' }}
              />
            </div>

            {/* Color Picker */}
            <div className="form-group">
              <label className="form-label">Subject Color</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {colorOptions.map((c) => (
                  <div
                    key={c}
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c,
                      cursor: 'pointer',
                      border: `3px solid ${form.color === c ? 'white' : 'transparent'}`,
                      outline: `2px solid ${form.color === c ? c : 'transparent'}`,
                      outlineOffset: '2px',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Subject Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {iconOptions.map((ic) => (
                  <div
                    key={ic}
                    onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: form.icon === ic ? 'rgba(59,130,246,0.2)' : 'var(--bg-secondary)',
                      border: `2px solid ${form.icon === ic ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {ic}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Study Tips</label>
              <textarea
                className="form-input"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Any notes about this subject..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-danger"
                style={{ gap: '6px' }}
                onClick={handleDelete}
                disabled={deleteSubjectMutation.isPending}
              >
                <Trash /> {deleteSubjectMutation.isPending ? 'Deleting...' : 'Delete Subject'}
              </button>
              <div style={{ flex: 1 }} />
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/subjects')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={updateSubjectMutation.isPending}>
                <Check size={14} /> {updateSubjectMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
