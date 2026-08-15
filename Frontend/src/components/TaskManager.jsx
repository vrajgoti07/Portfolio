import { useState, useEffect, useCallback } from 'react';
import Reveal from './Reveal';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import NotificationToast from './NotificationToast';
import { getTasks, createTask, updateTask, deleteTask } from '../api';

/* ─── Status Config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  Pending: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.4)',
    color: '#F59E0B',
    dot: '#F59E0B',
    label: 'Pending'
  },
  'In Progress': {
    bg: 'rgba(0, 212, 255, 0.12)',
    border: 'rgba(0, 212, 255, 0.4)',
    color: '#00D4FF',
    dot: '#00D4FF',
    label: 'In Progress'
  },
  Completed: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    color: '#10B981',
    dot: '#10B981',
    label: 'Completed'
  }
};

/* ─── Icons ─────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const RefreshIcon = ({ spin }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ animation: spin ? 'spin 0.8s linear infinite' : 'none' }}
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('Pending');
  const [creating, setCreating] = useState(false);

  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Show Toast Helper ───────────────────────────────────────── */
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  /* ── Fetch Tasks from MongoDB Backend ────────────────────────── */
  const loadTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const data = await getTasks();
      const taskList = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskList);
      if (isRefresh) {
        showNotification('success', 'Tasks synchronized from MongoDB database!');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.message || 'Failed to fetch tasks from backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ── Keyboard shortcut to close modal ─────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editingTask) setEditingTask(null);
        if (deletingTask) setDeletingTask(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask, deletingTask]);

  /* ── Create Task Handler (POST /tasks) ───────────────────────── */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotification('error', 'Task title is required.');
      return;
    }

    setCreating(true);
    try {
      const response = await createTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus
      });

      const createdTask = response.task || response;
      setTasks((prev) => [createdTask, ...prev]);

      setNewTitle('');
      setNewDescription('');
      setNewStatus('Pending');
      showNotification('success', 'Task saved directly to MongoDB database!');
    } catch (err) {
      console.error('Create task error:', err);
      showNotification('error', err.message || 'Failed to create task.');
    } finally {
      setCreating(false);
    }
  };

  /* ── Open Edit Modal ─────────────────────────────────────────── */
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditStatus(task.status || (task.completed ? 'Completed' : 'Pending'));
  };

  /* ── Update Task Handler (PUT /tasks/:id) ─────────────────────── */
  const handleUpdateTask = async (e) => {
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
        status: editStatus
      });

      const updatedTaskObj = response.task || response;
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === taskId ? updatedTaskObj : t))
      );

      setEditingTask(null);
      showNotification('success', 'Task updated in MongoDB database!');
    } catch (err) {
      console.error('Update task error:', err);
      showNotification('error', err.message || 'Failed to update task.');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Quick Status Transition ─────────────────────────────────── */
  const handleQuickStatusChange = async (task, nextStatus) => {
    const taskId = task._id || task.id;
    try {
      const response = await updateTask(taskId, {
        title: task.title,
        description: task.description,
        status: nextStatus
      });

      const updatedTaskObj = response.task || response;
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === taskId ? updatedTaskObj : t))
      );

      showNotification('success', `Task moved to "${nextStatus}"!`);
    } catch (err) {
      console.error('Status change error:', err);
      showNotification('error', err.message || 'Failed to update status.');
    }
  };

  /* ── Delete Task Handler (DELETE /tasks/:id) ─────────────────── */
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    const taskId = deletingTask._id || deletingTask.id;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      setDeletingTask(null);
      showNotification('success', 'Task deleted from MongoDB database.');
    } catch (err) {
      console.error('Delete task error:', err);
      showNotification('error', err.message || 'Failed to delete task.');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived Data & Filtering ────────────────────────────────── */
  const filteredTasks = tasks
    .filter((task) => {
      const taskStatus = task.status || (task.completed ? 'Completed' : 'Pending');
      if (statusFilter !== 'All' && taskStatus !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title?.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        return matchesTitle || matchesDesc;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === 'az') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

  // Calculate statistics
  const statsCounts = {
    total: tasks.length,
    pending: tasks.filter((t) => (t.status || (t.completed ? 'Completed' : 'Pending')) === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => (t.status || (t.completed ? 'Completed' : 'Pending')) === 'Completed').length
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="task-manager" className="task-section">
      <div className="container">
        {/* Toast Notification */}
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* ── Header ────────────────────────────────────────────── */}
        <Reveal>
          <div className="task-header-wrap">
            <div>
              <div className="task-badge-meta">
                <span className="section-tag" style={{ margin: 0 }}>Full-Stack Integration</span>
                <span className="task-conn-badge">
                  <span className={`task-conn-dot ${error ? 'offline' : 'online'}`} />
                  {error ? 'MongoDB Disconnected' : 'MongoDB Connected'}
                </span>
              </div>
              <h1 className="section-title" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Task Management System
              </h1>
              <p className="section-desc" style={{ maxWidth: '640px' }}>
                Connected React frontend to Express REST backend &amp; MongoDB database.
                Full CRUD functionality with real-time state synchronization, search, filters, and persistence.
              </p>
            </div>

            <button
              id="refresh-tasks-btn"
              className="btn btn-ghost task-refresh-btn"
              onClick={() => loadTasks(true)}
              disabled={loading || refreshing}
              title="Refresh from MongoDB"
            >
              <RefreshIcon spin={refreshing} />
              <span>{refreshing ? 'Syncing...' : 'Refresh MongoDB'}</span>
            </button>
          </div>
        </Reveal>

        {/* ── Stats Summary Bar ──────────────────────────────────── */}
        <Reveal delay={100}>
          <div className="task-stats-bar">
            <div className="task-stat-chip">
              <span className="task-stat-num">{statsCounts.total}</span>
              <span className="task-stat-lbl">Total Tasks</span>
            </div>
            <div className="task-stat-chip pending">
              <span className="task-stat-num" style={{ color: STATUS_CONFIG.Pending.color }}>{statsCounts.pending}</span>
              <span className="task-stat-lbl">Pending</span>
            </div>
            <div className="task-stat-chip in-progress">
              <span className="task-stat-num" style={{ color: STATUS_CONFIG['In Progress'].color }}>{statsCounts.inProgress}</span>
              <span className="task-stat-lbl">In Progress</span>
            </div>
            <div className="task-stat-chip completed">
              <span className="task-stat-num" style={{ color: STATUS_CONFIG.Completed.color }}>{statsCounts.completed}</span>
              <span className="task-stat-lbl">Completed</span>
            </div>
          </div>
        </Reveal>

        {/* ── Create Task Form Card ──────────────────────────────── */}
        <Reveal delay={150}>
          <div className="task-form-card">
            <div className="task-form-header">
              <div className="task-form-icon">
                <PlusIcon />
              </div>
              <div>
                <h3 className="task-form-title">Create New Task</h3>
                <p className="task-form-subtitle">Save a new task directly into the MongoDB collection</p>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="task-form">
              <div className="task-form-grid">
                <div className="task-form-group" style={{ flex: '1 1 60%' }}>
                  <label htmlFor="task-title-input" className="task-label">
                    Task Title <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    className="task-input"
                    placeholder="Enter task title (e.g. Implement JWT Authentication)..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="task-form-group" style={{ flex: '1 1 35%' }}>
                  <label htmlFor="task-status-select" className="task-label">
                    Initial Status
                  </label>
                  <select
                    id="task-status-select"
                    className="task-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="task-form-group">
                <label htmlFor="task-desc-input" className="task-label">
                  Description <span style={{ color: 'var(--text-muted)', fontSize: '0.8em' }}>(Optional)</span>
                </label>
                <textarea
                  id="task-desc-input"
                  rows="3"
                  className="task-textarea"
                  placeholder="Enter detailed task requirements, notes, or execution steps..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="task-form-actions">
                <button
                  id="add-task-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Spinner size="sm" />
                      <span>Saving to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      <span>Add Task to MongoDB</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Reveal>

        {/* ── Controls: Search, Filter, Sort ─────────────────────── */}
        <Reveal delay={200}>
          <div className="task-controls-wrapper">
            {/* Status Filter Tabs */}
            <div className="task-filter-pills">
              {['All', 'Pending', 'In Progress', 'Completed'].map((tab) => {
                const isActive = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    id={`filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`task-filter-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setStatusFilter(tab)}
                  >
                    {tab}
                    <span className="task-filter-count">
                      {tab === 'All'
                        ? statsCounts.total
                        : tab === 'Pending'
                        ? statsCounts.pending
                        : tab === 'In Progress'
                        ? statsCounts.inProgress
                        : statsCounts.completed}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search and Sort */}
            <div className="task-search-sort-wrap">
              <div className="task-search-box">
                <SearchIcon />
                <input
                  id="task-search-input"
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="task-search-input"
                />
                {searchQuery && (
                  <button
                    className="task-search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                id="task-sort-select"
                className="task-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tasks"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Title A → Z</option>
              </select>
            </div>
          </div>
        </Reveal>

        {/* ── Task List Content ──────────────────────────────────── */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => loadTasks(false)} />
        ) : filteredTasks.length === 0 ? (
          <Reveal>
            <div className="task-empty-state">
              <div className="task-empty-icon">📝</div>
              <h3 className="task-empty-title">
                {searchQuery || statusFilter !== 'All' ? 'No matching tasks found' : 'No tasks created yet'}
              </h3>
              <p className="task-empty-desc">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try adjusting your search terms or filter selection above.'
                  : 'Get started by creating your first task using the form above. It will be saved directly into MongoDB!'}
              </p>
              {(searchQuery || statusFilter !== 'All') && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </Reveal>
        ) : (
          <div className="task-cards-grid">
            {filteredTasks.map((task, idx) => {
              const currentStatus = task.status || (task.completed ? 'Completed' : 'Pending');
              const statusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
              const taskId = task._id || task.id;

              return (
                <Reveal key={taskId || idx} delay={Math.min(idx * 40, 400)}>
                  <div className={`task-card status-${currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {/* Top Row: Status Badge & Quick Actions */}
                    <div className="task-card-header">
                      <span
                        className="task-status-badge"
                        style={{
                          background: statusStyle.bg,
                          borderColor: statusStyle.border,
                          color: statusStyle.color
                        }}
                      >
                        <span className="task-status-dot" style={{ background: statusStyle.dot }} />
                        {currentStatus}
                      </span>

                      <div className="task-card-actions">
                        <button
                          id={`edit-task-${taskId}`}
                          className="task-icon-btn edit"
                          onClick={() => handleOpenEdit(task)}
                          title="Edit Task"
                          aria-label="Edit Task"
                        >
                          <EditIcon />
                        </button>
                        <button
                          id={`delete-task-${taskId}`}
                          className="task-icon-btn delete"
                          onClick={() => setDeletingTask(task)}
                          title="Delete Task"
                          aria-label="Delete Task"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Task Title */}
                    <h3 className="task-card-title">{task.title}</h3>

                    {/* Task Description */}
                    <p className="task-card-desc">
                      {task.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description provided.</span>}
                    </p>

                    {/* Footer: Date & Quick Status Toggle */}
                    <div className="task-card-footer">
                      <span className="task-date">
                        {formatDate(task.createdAt)}
                      </span>

                      {/* Quick Status Cycler */}
                      <div className="task-quick-status">
                        {currentStatus !== 'Completed' ? (
                          <button
                            className="task-status-quick-btn complete"
                            onClick={() => handleQuickStatusChange(task, 'Completed')}
                            title="Mark as Completed"
                          >
                            <CheckCircleIcon /> Mark Done
                          </button>
                        ) : (
                          <button
                            className="task-status-quick-btn reopen"
                            onClick={() => handleQuickStatusChange(task, 'Pending')}
                            title="Reopen Task"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Task Modal ────────────────────────────────────── */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Task</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingTask(null)}
                title="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="modal-form">
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
                <label className="task-label">Status</label>
                <select
                  className="task-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="task-form-group">
                <label className="task-label">Description</label>
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
                  {updating ? 'Saving to MongoDB...' : 'Update Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deletingTask && (
        <div className="modal-overlay" onClick={() => setDeletingTask(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">⚠️</div>
            <h3 className="modal-title" style={{ textAlign: 'center' }}>Delete Task</h3>
            <p className="delete-modal-text">
              Are you sure you want to permanently delete <strong>"{deletingTask.title}"</strong> from MongoDB?
              This operation cannot be undone.
            </p>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeletingTask(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteTask}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
