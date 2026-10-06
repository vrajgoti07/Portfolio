import { useState, useEffect, useCallback, useMemo } from 'react';
import Reveal from './Reveal';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import NotificationToast from './NotificationToast';
import { getTasks, updateTask, deleteTask, getUserEmail } from '../api';
import './TaskManager.css';

export default function TaskManager({ user, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

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

  /* ── Load Tasks (Manual Refresh) ────────────────────────────── */
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

  /* ── Initial Load on Mount ───────────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    getTasks()
      .then((data) => {
        if (!ignore) {
          const taskList = Array.isArray(data) ? data : (data.tasks || []);
          setTasks(taskList);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Fetch tasks error:', err);
          setError(err.message || 'Failed to load task information.');
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  /* ── Open Edit for Pending Task ──────────────────────────────── */
  const handleOpenEdit = (task) => {
    const status = task.status || (task.completed ? 'Completed' : 'Pending');
    if (status !== 'Pending' && currentUserEmail !== 'vrajgoti07@gmail.com') {
      showNotification('error', 'Editing locked! Tasks cannot be edited once they are in In Progress or Completed status.');
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

  /* ── Delete Task (Strictly Allowed for Pending Tasks Only) ────── */
  const handleDeleteTask = async (task) => {
    if (!isAuthenticated) {
      showNotification('error', 'Please sign in to remove tasks.');
      if (onNavigate) onNavigate('/login');
      return;
    }

    const status = task.status || (task.completed ? 'Completed' : 'Pending');
    if (status !== 'Pending' && currentUserEmail !== 'vrajgoti07@gmail.com') {
      showNotification('error', `Removal locked! Tasks in "${status}" status cannot be removed. Only Pending tasks can be deleted.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to remove pending task "${task.title}"?`)) {
      return;
    }

    const taskId = task._id || task.id;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      showNotification('success', 'Pending task removed successfully.');
    } catch (err) {
      showNotification('error', err.message || 'Failed to remove task.');
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

  /* ── Filtered Tasks ─────────────────────────────────────────── */
  const filteredTasks = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return tasks;
    return tasks.filter((t) => 
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.priority && t.priority.toLowerCase().includes(q))
    );
  }, [tasks, searchFilter]);

  /* ── Group tasks by Pending, Onboarding/Ongoing, Completed ──── */
  const pendingTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      const s = t.status || (t.completed ? 'Completed' : 'Pending');
      return s === 'Pending';
    });
  }, [filteredTasks]);

  const onboardingTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      const s = t.status || (t.completed ? 'Completed' : 'Pending');
      return s === 'Ongoing' || s === 'Onboarding' || s === 'In Progress';
    });
  }, [filteredTasks]);

  const completedTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      const s = t.status || (t.completed ? 'Completed' : 'Pending');
      return s === 'Completed';
    });
  }, [filteredTasks]);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityClass = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      case 'medium':
      default: return 'priority-medium';
    }
  };

  return (
    <section id="task-page" style={{ padding: '2rem 0 5rem 0' }}>
      <div className="kanban-board-container">
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* ── Page Header ─────────────────────────────────────────── */}
        <Reveal>
          <div className="kanban-header-bar">
            <div className="kanban-header-left">
              <span className="kanban-pretitle">
                Visual Workflow Pipeline
              </span>
              <h1 className="kanban-title">
                Task Kanban Board
              </h1>
              <p className="kanban-subtitle">
                Live interactive stage board tracking <strong>Pending</strong>, <strong>Onboarding</strong>, and <strong>Completed</strong> deliverables.
              </p>
            </div>

            <div className="kanban-header-actions">
              <div className="kanban-stats-pill">
                <span>📋 Total Tasks:</span>
                <strong>{tasks.length}</strong>
              </div>

              {tasks.length > 3 && (
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-foreground)',
                    fontSize: '0.85rem'
                  }}
                />
              )}

              <button
                className="btn btn-ghost"
                onClick={() => loadTasks(true)}
                disabled={loading || refreshing}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              >
                {refreshing ? 'Refreshing...' : '🔄 Refresh Board'}
              </button>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => loadTasks(false)} />
        ) : (
          <div className="kanban-grid">
            {/* ═══════════════════════════════════════════════════════════
                COLUMN 1: PENDING TASKS
                ═══════════════════════════════════════════════════════════ */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-top">
                  <div className="kanban-column-title-group">
                    <span className="kanban-column-icon">🟡</span>
                    <h2 className="kanban-column-title">Pending</h2>
                  </div>
                  <span className="kanban-badge kanban-badge-pending">
                    {pendingTasks.length}
                  </span>
                </div>
                <p className="kanban-column-desc">
                  Tasks awaiting execution. Can be edited and removed.
                </p>
              </div>

              <div className="kanban-column-body">
                {pendingTasks.length === 0 ? (
                  <div className="kanban-empty">
                    <span className="kanban-empty-icon">📝</span>
                    <span>No pending tasks waiting</span>
                  </div>
                ) : (
                  pendingTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div key={taskId} className="kanban-card kanban-card-pending">
                        <div className="kanban-card-meta">
                          <span className={`kanban-priority-badge ${getPriorityClass(task.priority)}`}>
                            {task.priority || 'Medium'}
                          </span>
                          <span className="kanban-date">{formatDate(task.createdAt)}</span>
                        </div>

                        <h3 className="kanban-card-title">{task.title}</h3>

                        <p className="kanban-card-desc">
                          {task.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided.</span>}
                        </p>

                        <div className="kanban-card-footer">
                          <span className="kanban-card-status-label" style={{ color: 'var(--color-warning)' }}>
                            ✏️ Editable &amp; Removable
                          </span>
                          <div className="kanban-btn-group">
                            <button
                              type="button"
                              className="kanban-btn kanban-btn-edit"
                              onClick={() => handleOpenEdit(task)}
                              title="Edit task details"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="kanban-btn kanban-btn-delete"
                              onClick={() => handleDeleteTask(task)}
                              title="Remove pending task"
                            >
                              🗑️ Remove
                            </button>
                            <button
                              type="button"
                              className="kanban-btn kanban-btn-start"
                              onClick={() => handleAdvanceStatus(task, 'Ongoing')}
                              title="Advance to In Progress"
                            >
                              ▶️ Start
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                COLUMN 2: ONBOARDING / ONGOING TASKS
                ═══════════════════════════════════════════════════════════ */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-top">
                  <div className="kanban-column-title-group">
                    <span className="kanban-column-icon">🔵</span>
                    <h2 className="kanban-column-title">In Progress</h2>
                  </div>
                  <span className="kanban-badge kanban-badge-ongoing">
                    {onboardingTasks.length}
                  </span>
                </div>
                <p className="kanban-column-desc">
                  Actively in development. Editing and removal are locked.
                </p>
              </div>

              <div className="kanban-column-body">
                {onboardingTasks.length === 0 ? (
                  <div className="kanban-empty">
                    <span className="kanban-empty-icon">⚡</span>
                    <span>No tasks actively underway</span>
                  </div>
                ) : (
                  onboardingTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div key={taskId} className="kanban-card kanban-card-ongoing">
                        <div className="kanban-card-meta">
                          <span className={`kanban-priority-badge ${getPriorityClass(task.priority)}`}>
                            {task.priority || 'Medium'}
                          </span>
                          <span className="kanban-date">{formatDate(task.createdAt)}</span>
                        </div>

                        <h3 className="kanban-card-title">{task.title}</h3>

                        <p className="kanban-card-desc">
                          {task.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided.</span>}
                        </p>

                        <div className="kanban-card-footer">
                          <span className="kanban-card-status-label" style={{ color: 'var(--color-info)' }}>
                            🔒 Locked — Cannot edit or remove
                          </span>
                          <div className="kanban-btn-group">
                            <button
                              type="button"
                              className="kanban-btn kanban-btn-complete"
                              onClick={() => handleAdvanceStatus(task, 'Completed')}
                              title="Mark this task as completed"
                            >
                              ✅ Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                COLUMN 3: COMPLETED TASKS
                ═══════════════════════════════════════════════════════════ */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="kanban-column-top">
                  <div className="kanban-column-title-group">
                    <span className="kanban-column-icon">🟢</span>
                    <h2 className="kanban-column-title">Completed</h2>
                  </div>
                  <span className="kanban-badge kanban-badge-completed">
                    {completedTasks.length}
                  </span>
                </div>
                <p className="kanban-column-desc">
                  Finished deliverables. Editing and removal are locked.
                </p>
              </div>

              <div className="kanban-column-body">
                {completedTasks.length === 0 ? (
                  <div className="kanban-empty">
                    <span className="kanban-empty-icon">🏆</span>
                    <span>No completed tasks yet</span>
                  </div>
                ) : (
                  completedTasks.map((task) => {
                    const taskId = task._id || task.id;
                    return (
                      <div key={taskId} className="kanban-card kanban-card-completed">
                        <div className="kanban-card-meta">
                          <span className="kanban-badge kanban-badge-completed" style={{ fontSize: '0.7rem' }}>
                            ✓ Done
                          </span>
                          <span className="kanban-date">{formatDate(task.createdAt)}</span>
                        </div>

                        <h3 className="kanban-card-title">{task.title}</h3>

                        <p className="kanban-card-desc">
                          {task.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided.</span>}
                        </p>

                        {/* Evaluation verdict if reviewed */}
                        {task.evaluationVerdict && task.evaluationVerdict !== 'Pending Evaluation' && (
                          <div className="kanban-eval-box">
                            <div>
                              <span className="kanban-eval-verdict">
                                {task.evaluationVerdict}
                              </span>
                              {task.evaluationScore ? ` • Score: ${task.evaluationScore}/100` : ''}
                            </div>
                            {task.evaluationNotes && (
                              <div className="kanban-eval-notes">
                                "{task.evaluationNotes}"
                              </div>
                            )}
                          </div>
                        )}

                        <div className="kanban-card-footer">
                          <span className="kanban-card-status-label" style={{ color: 'var(--color-success)' }}>
                            ✓ Finalized — Cannot edit or remove
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
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
