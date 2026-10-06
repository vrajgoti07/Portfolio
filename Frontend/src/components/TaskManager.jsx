import { useState, useEffect, useCallback } from 'react';
import Reveal from './Reveal';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import NotificationToast from './NotificationToast';
import { getTasks, updateTask, getUserEmail } from '../api';

export default function TaskManager({ user, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Edit modal state (allowed strictly for Pending tasks)
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [updating, setUpdating] = useState(false);

  const currentUserEmail = (user?.email || getUserEmail() || '').toLowerCase().trim();
  const isAuthenticated = Boolean(currentUserEmail);

  /* ── Toast Helper ────────────────────────────────────────────── */
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  /* ── Load Tasks ──────────────────────────────────────────────── */
  const loadTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getTasks();
      const taskList = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskList);
      if (isRefresh) {
        showNotification('success', 'Task information refreshed.');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.message || 'Failed to load task information.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ── Open Edit for Pending Task ──────────────────────────────── */
  const handleOpenEdit = (task) => {
    const status = task.status || (task.completed ? 'Completed' : 'Pending');
    if (status !== 'Pending' && currentUserEmail !== 'vrajgoti07@gmail.com') {
      showNotification('error', 'Editing locked! Tasks cannot be edited once they are in Onboarding or Completed status.');
      return;
    }

    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'Medium');
  };

  /* ── Save Edited Pending Task ────────────────────────────────── */
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showNotification('error', 'Task title cannot be empty.');
      return;
    }

    setUpdating(true);
    const taskId = editingTask._id || editingTask.id;
    try {
      const response = await updateTask(taskId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });

      const updated = response.task || response;
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updated : t)));
      setEditingTask(null);
      showNotification('success', 'Pending task details updated successfully.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to update task.');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Advance Status ──────────────────────────────────────────── */
  const handleAdvanceStatus = async (task, nextStatus) => {
    if (!isAuthenticated) {
      showNotification('error', 'Please sign in to update task progress.');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const taskId = task._id || task.id;
    try {
      const response = await updateTask(taskId, {
        status: nextStatus
      });

      const updated = response.task || response;
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updated : t)));
      showNotification('success', `Task moved to "${nextStatus}".`);
    } catch (err) {
      showNotification('error', err.message || 'Failed to advance status.');
    }
  };

  /* ── Group tasks by Pending, Onboarding/Ongoing, Completed ──── */
  const pendingTasks = tasks.filter((t) => {
    const s = t.status || (t.completed ? 'Completed' : 'Pending');
    return s === 'Pending';
  });

  const onboardingTasks = tasks.filter((t) => {
    const s = t.status || (t.completed ? 'Completed' : 'Pending');
    return s === 'Ongoing' || s === 'Onboarding' || s === 'In Progress';
  });

  const completedTasks = tasks.filter((t) => {
    const s = t.status || (t.completed ? 'Completed' : 'Pending');
    return s === 'Completed';
  });

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section id="task-page" style={{ padding: '2rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '840px', margin: '0 auto' }}>
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* ── Page Header ─────────────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.8rem',
                    color: 'var(--accent-secondary)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '0.4rem'
                  }}
                >
                  Task Status Information
                </span>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                  Task Details by Stage
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                  Information and live details for <strong>Pending</strong>, <strong>Onboarding</strong>, and <strong>Completed</strong> tasks.
                </p>
              </div>

              <button
                className="btn btn-ghost"
                onClick={() => loadTasks(true)}
                disabled={loading || refreshing}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                {refreshing ? 'Refreshing...' : '🔄 Refresh Details'}
              </button>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => loadTasks(false)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* ═══════════════════════════════════════════════════════════
                1. PENDING TASKS SECTION
                ═══════════════════════════════════════════════════════════ */}
            <Reveal delay={100}>
              <div style={{ borderLeft: '4px solid #F59E0B', paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#F59E0B' }}>
                    🟡 Pending Tasks ({pendingTasks.length})
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                  Tasks awaiting execution. Task details can be edited before starting work.
                </p>
              </div>

              {pendingTasks.length === 0 ? (
                <div style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: '8px', border: '1px dashed rgba(245, 158, 11, 0.25)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No tasks currently in Pending status.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {pendingTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div
                        key={taskId}
                        style={{
                          padding: '1.4rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            {task.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                              Pending • {task.priority || 'Medium'} Priority
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                          {task.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
                        </div>

                        {/* Options underneath Pending Task */}
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ✏️ Edit option active (Pending only)
                          </span>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                              onClick={() => handleOpenEdit(task)}
                            >
                              ✏️ Edit Task Details
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #00D4FF, #0284C7)' }}
                              onClick={() => handleAdvanceStatus(task, 'Ongoing')}
                            >
                              ▶️ Start Onboarding / Ongoing
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>

            {/* ═══════════════════════════════════════════════════════════
                2. ONBOARDING / ONGOING TASKS SECTION
                ═══════════════════════════════════════════════════════════ */}
            <Reveal delay={150}>
              <div style={{ borderLeft: '4px solid #00D4FF', paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#00D4FF' }}>
                    🔵 Onboarding &amp; Ongoing Tasks ({onboardingTasks.length})
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                  Tasks actively in progress. Content editing is locked once work has started.
                </p>
              </div>

              {onboardingTasks.length === 0 ? (
                <div style={{ padding: '1.25rem', background: 'rgba(0, 212, 255, 0.04)', borderRadius: '8px', border: '1px dashed rgba(0, 212, 255, 0.25)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No tasks currently in Onboarding or Ongoing progress.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {onboardingTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div
                        key={taskId}
                        style={{
                          padding: '1.4rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(0, 212, 255, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            {task.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF' }}>
                              Onboarding / Ongoing • {task.priority || 'Medium'} Priority
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                          {task.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
                        </div>

                        {/* Options underneath Onboarding Task */}
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#00D4FF' }}>
                            🔒 In Progress — Editing is locked
                          </span>

                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem', background: 'linear-gradient(135deg, #10B981, #059669)' }}
                            onClick={() => handleAdvanceStatus(task, 'Completed')}
                          >
                            ✅ Mark as Completed
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>

            {/* ═══════════════════════════════════════════════════════════
                3. COMPLETED TASKS SECTION
                ═══════════════════════════════════════════════════════════ */}
            <Reveal delay={200}>
              <div style={{ borderLeft: '4px solid #10B981', paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#10B981' }}>
                    🟢 Completed Tasks ({completedTasks.length})
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                  Finished deliverables. Tasks are locked and evaluated.
                </p>
              </div>

              {completedTasks.length === 0 ? (
                <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.04)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.25)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No tasks currently completed.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {completedTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div
                        key={taskId}
                        style={{
                          padding: '1.4rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            {task.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                              Completed
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                          {task.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description provided.</span>}
                        </div>

                        {/* Evaluation verdict if available */}
                        {task.evaluationVerdict && task.evaluationVerdict !== 'Pending Evaluation' && (
                          <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.82rem' }}>
                            <strong style={{ color: '#10B981' }}>Evaluation: {task.evaluationVerdict}</strong>
                            {task.evaluationScore && <span> • Score: {task.evaluationScore}/100</span>}
                            {task.evaluationNotes && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.2rem' }}>"{task.evaluationNotes}"</div>}
                          </div>
                        )}

                        {/* Options underneath Completed Task */}
                        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: '#10B981' }}>
                            ✓ Deliverable finalized and locked
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>
          </div>
        )}
      </div>

      {/* ── Edit Task Modal (Strictly for Pending Tasks) ──────────── */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Pending Task Details</h3>
              <button className="modal-close-btn" onClick={() => setEditingTask(null)}>×</button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Pending task details can be modified before starting work.
            </p>

            <form onSubmit={handleSaveEdit}>
              <div className="task-form-group">
                <label className="task-label">Task Title *</label>
                <input
                  type="text"
                  className="task-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="task-form-group">
                <label className="task-label">Priority Level</label>
                <select
                  className="task-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="task-form-group">
                <label className="task-label">Description / Requirements</label>
                <textarea
                  rows="4"
                  className="task-textarea"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingTask(null)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
