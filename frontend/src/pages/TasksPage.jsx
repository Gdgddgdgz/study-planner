import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import icons from '../components/icons';
import { useTasks, useCreateTask, useToggleTask, useDeleteTask } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';

const { Check, Calendar, Clock, Flag, Trash, Edit, Plus, ChevronRight, X } = icons;

const subjectColors = {
  'Computer Science': '#3b82f6',
  'Physics': '#14b8a6',
  'Mathematics': '#22c55e',
  'Chemistry': '#f59e0b',
};

const priorityColors = { high: 'badge-red', medium: 'badge-amber', low: 'badge-gray' };
const filters = ['All', 'Pending', 'Completed', 'High Priority'];

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSubject, setActiveSubject] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', subject: 'Computer Science', due: '', priority: 'medium' });

  // TanStack Query Hooks
  const { data: tasks = [], isLoading } = useTasks(activeFilter, activeSubject);
  const { data: userSubjects = [] } = useSubjects();
  const createTaskMutation = useCreateTask();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();

  const subjectsList = ['All', ...new Set(userSubjects.map((s) => s.name).concat(['Computer Science', 'Physics', 'Mathematics', 'Chemistry']))];

  const handleToggle = (id) => {
    toggleTaskMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteTaskMutation.mutate(id);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    createTaskMutation.mutate(newTask, {
      onSuccess: () => {
        setShowModal(false);
        setNewTask({ title: '', subject: 'Computer Science', due: '', priority: 'medium' });
      },
    });
  };

  const pending = tasks.filter((t) => !t.done).length;
  const completed = tasks.filter((t) => t.done).length;

  return (
    <>
      <AppLayout title="Tasks" onAddClick={() => setShowModal(true)}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Tasks', value: tasks.length, color: 'var(--accent-secondary)' },
            { label: 'Pending', value: pending, color: '#f59e0b' },
            { label: 'Completed', value: completed, color: '#22c55e' },
          ].map((s) => (
            <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div className="filter-row">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="filter-row">
            {subjectsList.map((s) => (
              <button
                key={s}
                className={`filter-chip ${activeSubject === s ? 'active' : ''}`}
                onClick={() => setActiveSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="card" style={{ padding: '8px 24px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-text">No tasks match your current filters. Great job staying on top of things!</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add New Task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="task-item" style={{ padding: '14px 0' }}>
                <div
                  className={`task-checkbox ${task.done ? 'done' : ''}`}
                  onClick={() => handleToggle(task.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {task.done && <Check size={10} />}
                </div>
                <div className="task-info">
                  <div className={`task-title ${task.done ? 'done' : ''}`} style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {task.title}
                  </div>
                  <div className="task-meta">
                    {task.due && <span className="task-meta-item"><Calendar /> {task.due}</span>}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: subjectColors[task.subject] || 'var(--accent-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: subjectColors[task.subject] || 'var(--accent-secondary)',
                          display: 'inline-block',
                        }}
                      />
                      {task.subject}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${priorityColors[task.priority] || 'badge-gray'}`}>
                    {task.priority}
                  </span>
                  <button
                    className="icon-btn"
                    onClick={() => handleDelete(task.id)}
                    title="Delete task"
                    style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: '#ef4444' }}
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>{/* ← FIX: closes the Task List card */}
      </AppLayout>

      {/* Add Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add New Task</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)} style={{ border: 'none' }}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  className="form-input"
                  placeholder="e.g., Complete Assignment 3"
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-input form-select"
                  value={newTask.subject}
                  onChange={(e) => setNewTask((p) => ({ ...p, subject: e.target.value }))}
                >
                  {subjectsList.filter((s) => s !== 'All').map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTask.due}
                    onChange={(e) => setNewTask((p) => ({ ...p, due: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}