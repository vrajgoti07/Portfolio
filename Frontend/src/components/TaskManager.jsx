import { useState, useEffect, useCallback, useMemo } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import NotificationToast from './NotificationToast';
import { getTasks, createTask, updateTask, deleteTask, getUserEmail, isAdminUser } from '../api';
import './TaskManager.css';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Search,
  Clock,
  Sparkles,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'Pending', label: 'Pending Execution', dotClass: 'dot-pending', badgeColor: 'var(--accent-secondary)' },
  { id: 'Ongoing', label: 'In Progress', dotClass: 'dot-ongoing', badgeColor: 'var(--accent-primary)' },
  { id: 'Completed', label: 'Completed Deliverables', dotClass: 'dot-completed', badgeColor: 'var(--color-success)' }
];

export default function TaskManager({ user, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // New task modal
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit modal
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editStatus, setEditStatus] = useState('Pending');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete modal
  const [deletingTask, setDeletingTask] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const currentUserEmail = (user?.email || getUserEmail() || '').toLowerCase().trim();
  const isAdmin = isAdminUser() || currentUserEmail === 'vrajgoti07@gmail.com';
  const isAuthenticated = Boolean(currentUserEmail);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // Fetch tasks
  const loadTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await getTasks();
      const taskList = Array.isArray(data) ? data : (data.tasks || []);
      setTasks(taskList);
      if (isRefresh) {
        showNotification('success', 'Task pipeline updated.');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.message || 'Failed to load task pipeline.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

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
          setError(err.message || 'Failed to load task pipeline.');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Create Task Handler
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showNotification('error', 'Task title cannot be empty.');
      return;
    }

    if (!isAuthenticated) {
      showNotification('error', 'Please sign in to create and manage tasks.');
      if (onNavigate) onNavigate('/login');
      return;
    }

    setSubmittingCreate(true);
    try {
      await createTask({
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        assignedTo: currentUserEmail
      });

      showNotification('success', 'Task created successfully.');
      setNewTitle('');
      setNewDescription('');
      setNewPriority('Medium');
      setIsCreating(false);
      loadTasks(true);
    } catch (err) {
      showNotification('error', err.message || 'Failed to create task.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (task) => {
    const status = task.status || (task.completed ? 'Completed' : 'Pending');
    if (!isAdmin && status !== 'Pending') {
      showNotification('error', `Editing is locked! Tasks in ${status} status cannot be edited. Only pending tasks can be edited.`);
      return;
    }

    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'Medium');
    setEditStatus(status);
  };

  // Save Edit Handler
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showNotification('error', 'Task title cannot be empty.');
      return;
    }

    setSubmittingEdit(true);
    try {
      await updateTask(editingTask._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        status: editStatus
      });

      showNotification('success', 'Task updated successfully.');
      setEditingTask(null);
      loadTasks(true);
    } catch (err) {
      showNotification('error', err.message || 'Failed to update task.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Advance Task Status (Pending -> Ongoing -> Completed)
  const handleAdvanceStatus = async (task) => {
    const currentStatus = task.status || (task.completed ? 'Completed' : 'Pending');
    let nextStatus = 'Ongoing';
    if (currentStatus === 'Ongoing' || currentStatus === 'In Progress') {
      nextStatus = 'Completed';
    } else if (currentStatus === 'Completed') {
      nextStatus = 'Pending';
    }

    try {
      await updateTask(task._id, { status: nextStatus });
      showNotification('success', `Task moved to ${nextStatus}.`);
      loadTasks(true);
    } catch (err) {
      showNotification('error', err.message || 'Failed to transition task status.');
    }
  };

  // Delete Task Handler
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;

    setSubmittingDelete(true);
    try {
      await deleteTask(deletingTask._id);
      showNotification('success', 'Task deleted successfully.');
      setDeletingTask(null);
      loadTasks(true);
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete task.');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchFilter.toLowerCase().trim();
      const matchesSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q));

      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchFilter, priorityFilter]);

  return (
    <div className="kanban-board-container">
      {/* Toast Notification */}
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header Bar */}
      <div className="kanban-header-bar">
        <div className="kanban-header-left">
          <span className="kanban-pretitle">Full-Stack Task Orchestration</span>
          <h1 className="kanban-title">Task Management Pipeline</h1>
          <p className="kanban-subtitle">
            Enterprise Kanban architecture featuring JWT RBAC, status transition locks, in-memory cache invalidation, and asynchronous notification delivery.
          </p>
        </div>

        <div className="kanban-header-actions">
          <span className="kanban-stats-pill">
            <CheckSquare size={14} color="var(--accent-primary)" />
            <span>{tasks.length} Total Deliverables</span>
          </span>

          <button
            onClick={() => loadTasks(true)}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
            title="Refresh Pipeline"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            id="create-task-btn"
            onClick={() => {
              if (!isAuthenticated) {
                if (onNavigate) onNavigate('/login');
              } else {
                setIsCreating(true);
              }
            }}
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <Plus size={14} />
            <span>{isAuthenticated ? 'New Task' : 'Sign In to Create'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}
      >
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or assignees..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="search-input-box"
            style={{ paddingLeft: '32px', width: '100%', fontSize: '0.84rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="sort-select-box"
            style={{ fontSize: '0.84rem' }}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Urgent">Urgent Priority</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && <Spinner message="Loading task pipeline from MongoDB & in-memory cache..." />}

      {/* Error state */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={() => loadTasks(true)} />
      )}

      {/* Kanban Grid Columns */}
      {!loading && !error && (
        <div className="kanban-grid">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => {
              const status = t.status || (t.completed ? 'Completed' : 'Pending');
              if (col.id === 'Ongoing') {
                return status === 'Ongoing' || status === 'In Progress';
              }
              return status === col.id;
            });

            return (
              <div key={col.id} className="kanban-column">
                {/* Column Header */}
                <div className="kanban-column-header">
                  <div className="kanban-column-title-wrap">
                    <span className={`kanban-column-dot ${col.dotClass}`} />
                    <h3 className="kanban-column-title">{col.label}</h3>
                  </div>
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>

                {/* Column Body */}
                <div className="kanban-column-body">
                  {columnTasks.length === 0 ? (
                    <div className="kanban-empty-state">
                      {col.id === 'Pending' && <Clock size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />}
                      {col.id === 'Ongoing' && <Sparkles size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />}
                      {col.id === 'Completed' && <CheckCircle2 size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />}
                      <p className="kanban-empty-text">No tasks in this lane</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const status = task.status || (task.completed ? 'Completed' : 'Pending');
                      const priorityClass = (task.priority || 'Medium').toLowerCase();
                      const isPending = status === 'Pending';
                      const canEdit = isPending || isAdmin;

                      return (
                        <div
                          key={task._id}
                          className={`kanban-task-card ${status.toLowerCase()}`}
                        >
                          <div className="kanban-task-header">
                            <h4 className="kanban-task-title">{task.title}</h4>
                            <span className={`priority-badge ${priorityClass}`}>
                              {task.priority || 'Medium'}
                            </span>
                          </div>

                          {task.description && (
                            <p className="kanban-task-desc">{task.description}</p>
                          )}

                          {/* Evaluation verdict if available */}
                          {task.evaluationVerdict && (
                            <div
                              style={{
                                background: 'rgba(233, 162, 59, 0.08)',
                                border: '1px solid rgba(233, 162, 59, 0.25)',
                                borderRadius: 'var(--radius-xs)',
                                padding: '0.35rem 0.6rem',
                                fontSize: '0.74rem',
                                color: 'var(--accent-secondary)'
                              }}
                            >
                              <strong>Evaluation:</strong> {task.evaluationVerdict} ({task.evaluationScore || 0}/100)
                              {task.evaluationNotes && <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{task.evaluationNotes}</div>}
                            </div>
                          )}

                          {/* Meta & Actions */}
                          <div className="kanban-task-meta">
                            <span className="kanban-task-assignee" title={task.assignedTo || 'Unassigned'}>
                              <UserCheck size={12} color="var(--accent-primary)" />
                              <span>{task.assignedTo ? task.assignedTo.split('@')[0] : 'Unassigned'}</span>
                            </span>

                            <div className="kanban-task-actions">
                              {/* Advance status */}
                              <button
                                onClick={() => handleAdvanceStatus(task)}
                                className="task-action-btn"
                                title={`Move to next state`}
                              >
                                <span>{status === 'Pending' ? 'Start' : (status === 'Ongoing' ? 'Done' : 'Restart')}</span>
                                <ArrowRight size={11} style={{ display: 'inline', marginLeft: '2px' }} />
                              </button>

                              {/* Edit button */}
                              {canEdit && (
                                <button
                                  onClick={() => handleOpenEdit(task)}
                                  className="task-action-btn"
                                  title="Edit Task Details"
                                >
                                  <Edit2 size={12} />
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                onClick={() => setDeletingTask(task)}
                                className="task-action-btn delete"
                                title="Delete Task"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Creation Modal */}
      {isCreating && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-title">
          <div className="modal-card">
            <h3 id="create-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Create New Task
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Initializes task in Pending execution status.
            </p>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="new-task-title" className="form-label">
                  Task Title *
                </label>
                <input
                  id="new-task-title"
                  type="text"
                  required
                  placeholder="e.g. Build asynchronous caching pipeline"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-task-desc" className="form-label">
                  Description
                </label>
                <textarea
                  id="new-task-desc"
                  rows={3}
                  placeholder="Deliverable specifications and notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-task-priority" className="form-label">
                  Priority
                </label>
                <select
                  id="new-task-priority"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {submittingCreate ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-title">
          <div className="modal-card">
            <h3 id="edit-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              Edit Task Details
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Modify task parameters while respecting status edit locking.
            </p>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label htmlFor="edit-task-title" className="form-label">
                  Task Title *
                </label>
                <input
                  id="edit-task-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-task-desc" className="form-label">
                  Description
                </label>
                <textarea
                  id="edit-task-desc"
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-task-priority" className="form-label">
                  Priority
                </label>
                <select
                  id="edit-task-priority"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-task-status" className="form-label">
                  Status
                </label>
                <select
                  id="edit-task-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTask && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="del-task-title">
          <div className="modal-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(229, 107, 111, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-error)',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 id="del-task-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Delete Task
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{deletingTask.title}"</strong>? This will remove it from MongoDB and invalidate cache.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleConfirmDelete}
                disabled={submittingDelete}
                className="btn btn-primary"
                style={{ flex: 1, background: 'var(--color-error)' }}
              >
                {submittingDelete ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => setDeletingTask(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
