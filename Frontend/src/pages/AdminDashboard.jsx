import { useState, useEffect, useCallback } from 'react';
import Reveal from '../components/Reveal';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import NotificationToast from '../components/NotificationToast';
import {
  getTasks,
  getAdminUsers,
  assignAdminTask,
  evaluateAdminTask,
  deleteTask,
  getUserEmail,
  getUserRole
} from '../api';

const STATUS_THEMES = {
  Pending: { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)', color: '#F59E0B' },
  Ongoing: { bg: 'rgba(0, 212, 255, 0.12)', border: 'rgba(0, 212, 255, 0.4)', color: '#00D4FF' },
  Completed: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)', color: '#10B981' }
};

const PRIORITY_BADGES = {
  Low: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)' },
  Medium: { color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' },
  High: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)' },
  Urgent: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' }
};

export default function AdminDashboard({ onNavigate }) {
  const currentEmail = (getUserEmail() || '').toLowerCase().trim();
  const currentRole = getUserRole();
  const isAdmin = currentEmail === 'vrajgoti07@gmail.com' && currentRole === 'admin';

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Assign Task Form State
  const [assignedTo, setAssignedTo] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigning, setAssigning] = useState(false);

  // Evaluate Modal State
  const [evaluatingTask, setEvaluatingTask] = useState(null);
  const [evaluationVerdict, setEvaluationVerdict] = useState('Approved');
  const [evaluationScore, setEvaluationScore] = useState(90);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Task Filter
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const showToast = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // Fetch users and tasks
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [usersData, tasksData] = await Promise.all([
        getAdminUsers(),
        getTasks()
      ]);

      const fetchedUsers = usersData.users || [];
      setUsers(fetchedUsers);
      if (fetchedUsers.length > 0 && !assignedTo) {
        setAssignedTo(fetchedUsers[0].email);
      }

      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      console.error('Admin dashboard load error:', err);
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, assignedTo]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Assign Task
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('error', 'Task title is required.');
      return;
    }
    if (!assignedTo) {
      showToast('error', 'Please select a team member under admin to assign the task.');
      return;
    }

    setAssigning(true);
    try {
      const response = await assignAdminTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedTo: assignedTo.trim().toLowerCase(),
        priority
      });

      const newTask = response.task || response;
      setTasks((prev) => [newTask, ...prev]);

      // Reset form
      setTaskTitle('');
      setTaskDescription('');
      setPriority('Medium');
      showToast('success', `Task successfully assigned to ${assignedTo}!`);

      // Refresh users to update workload counts
      const usersData = await getAdminUsers();
      if (usersData?.users) setUsers(usersData.users);
    } catch (err) {
      showToast('error', err.message || 'Failed to assign task.');
    } finally {
      setAssigning(false);
    }
  };

  // Open Evaluation Modal
  const handleOpenEvaluate = (task) => {
    setEvaluatingTask(task);
    setEvaluationVerdict(task.evaluationVerdict || 'Approved');
    setEvaluationScore(task.evaluationScore !== null && task.evaluationScore !== undefined ? task.evaluationScore : 90);
    setEvaluationNotes(task.evaluationNotes || '');
  };

  // Submit Evaluation
  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!evaluatingTask) return;

    setSubmittingEval(true);
    const taskId = evaluatingTask._id || evaluatingTask.id;
    try {
      const response = await evaluateAdminTask(taskId, {
        evaluationVerdict,
        evaluationScore: Number(evaluationScore),
        evaluationNotes: evaluationNotes.trim()
      });

      const updated = response.task || response;
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === taskId ? updated : t)));
      setEvaluatingTask(null);
      showToast('success', 'Deliverable evaluation saved successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to save evaluation.');
    } finally {
      setSubmittingEval(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      showToast('success', 'Task removed.');
    } catch (err) {
      showToast('error', err.message || 'Failed to delete task.');
    }
  };

  // Check admin authorization
  if (!isAdmin) {
    return (
      <div style={{ paddingTop: '120px', paddingBottom: '5rem', minHeight: '80vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '540px' }}>
          <div className="task-form-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.8rem', color: '#EF4444' }}>
              Admin Privileges Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              The Admin Dashboard is strictly reserved for the designated administrator:
              <br />
              <strong style={{ color: 'var(--accent-secondary)' }}>vrajgoti07@gmail.com</strong>.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('/login')}>
                Sign In as Admin
              </button>
              <button className="btn btn-ghost" onClick={() => onNavigate('/tasks')}>
                Go to Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const taskStatus = task.status || (task.completed ? 'Completed' : 'Pending');
    const matchesStatus = statusFilter === 'All' || taskStatus === statusFilter;
    const matchesUser = userFilter === 'All' || task.assignedTo === userFilter;
    return matchesStatus && matchesUser;
  });

  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => (t.status || 'Pending') === 'Pending').length;
  const ongoingCount = tasks.filter((t) => t.status === 'Ongoing' || t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '5rem', minHeight: '90vh' }}>
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="container">
        {/* Header Banner */}
        <Reveal>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#000',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '100px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  👑 Super Admin
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-code)' }}>
                  vrajgoti07@gmail.com
                </span>
              </div>
              <h1 className="section-title" style={{ margin: 0, fontSize: '2.3rem' }}>
                Admin Evaluation &amp; Task Assignment
              </h1>
              <p className="section-desc" style={{ marginTop: '0.4rem', maxWidth: '680px' }}>
                Assign tasks to team members under your supervision, monitor workload in real time, and evaluate submitted deliverables.
              </p>
            </div>

            <button
              className="btn btn-ghost"
              onClick={loadDashboardData}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              🔄 Refresh Dashboard
            </button>
          </div>
        </Reveal>

        {/* Top KPI Metrics */}
        <Reveal delay={100}>
          <div className="task-stats-bar" style={{ marginBottom: '2.5rem' }}>
            <div className="task-stat-chip">
              <span className="task-stat-num">{users.length}</span>
              <span className="task-stat-lbl">Team Members Under Admin</span>
            </div>
            <div className="task-stat-chip">
              <span className="task-stat-num">{totalTasks}</span>
              <span className="task-stat-lbl">Total Tasks</span>
            </div>
            <div className="task-stat-chip pending">
              <span className="task-stat-num" style={{ color: STATUS_THEMES.Pending.color }}>{pendingCount}</span>
              <span className="task-stat-lbl">Pending</span>
            </div>
            <div className="task-stat-chip in-progress">
              <span className="task-stat-num" style={{ color: STATUS_THEMES.Ongoing.color }}>{ongoingCount}</span>
              <span className="task-stat-lbl">Ongoing</span>
            </div>
            <div className="task-stat-chip completed">
              <span className="task-stat-num" style={{ color: STATUS_THEMES.Completed.color }}>{completedCount}</span>
              <span className="task-stat-lbl">Completed Deliverables</span>
            </div>
          </div>
        </Reveal>

        {/* Main Grid: Assign Task Form (Left) & Team Members Under Admin (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Form: Assign Task */}
          <Reveal delay={150}>
            <div className="task-form-card" style={{ height: '100%' }}>
              <div className="task-form-header">
                <div className="task-form-icon" style={{ background: 'rgba(108, 99, 255, 0.15)', color: 'var(--accent-secondary)' }}>
                  📌
                </div>
                <div>
                  <h3 className="task-form-title">Assign Task to Team Member</h3>
                  <p className="task-form-subtitle">Assign deliverables directly to team members under admin</p>
                </div>
              </div>

              <form onSubmit={handleAssignTask} className="task-form" style={{ marginTop: '1.25rem' }}>
                <div className="task-form-group">
                  <label className="task-label">
                    Select Team Member <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  {users.length === 0 ? (
                    <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      No registered users found yet. Once users register on the site, they will appear here automatically.
                    </div>
                  ) : (
                    <select
                      className="task-select"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      required
                    >
                      {users.map((u) => (
                        <option key={u._id} value={u.email}>
                          {u.name || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="task-form-group">
                  <label className="task-label">
                    Task Title <span style={{ color: 'var(--accent-tertiary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="task-input"
                    placeholder="e.g. Build Payment Gateway Integration..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="task-form-group">
                  <label className="task-label">Priority Level</label>
                  <select
                    className="task-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="task-form-group">
                  <label className="task-label">Deliverable Requirements / Description</label>
                  <textarea
                    rows="3"
                    className="task-textarea"
                    placeholder="Provide detailed instructions, acceptance criteria, and milestones..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assigning || users.length === 0}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {assigning ? (
                    <>
                      <Spinner size="sm" />
                      <span>Assigning Task...</span>
                    </>
                  ) : (
                    <span>🚀 Assign Task to Team Member</span>
                  )}
                </button>
              </form>
            </div>
          </Reveal>

          {/* Team Members Directory */}
          <Reveal delay={200}>
            <div className="task-form-card" style={{ height: '100%' }}>
              <div className="task-form-header">
                <div className="task-form-icon" style={{ background: 'rgba(0, 212, 255, 0.15)', color: '#00D4FF' }}>
                  👥
                </div>
                <div>
                  <h3 className="task-form-title">Team Members Under Admin</h3>
                  <p className="task-form-subtitle">People managed by admin with their active workloads</p>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {users.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No team members registered yet.
                  </div>
                ) : (
                  users.map((u) => {
                    const stats = u.taskStats || { total: 0, pending: 0, ongoing: 0, completed: 0 };
                    return (
                      <div
                        key={u._id}
                        style={{
                          padding: '0.9rem 1.1rem',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-card)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {u.name || u.email.split('@')[0]}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-code)' }}>
                            {u.email}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span
                            title="Pending Tasks"
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#F59E0B',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            P: {stats.pending}
                          </span>
                          <span
                            title="Ongoing Tasks"
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(0, 212, 255, 0.12)',
                              color: '#00D4FF',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            O: {stats.ongoing}
                          </span>
                          <span
                            title="Completed Tasks"
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: '#10B981',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            C: {stats.completed}
                          </span>

                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                            onClick={() => {
                              setAssignedTo(u.email);
                              setUserFilter(u.email);
                            }}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Deliverables & Evaluation Section */}
        <Reveal delay={250}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                Task Deliverables &amp; Evaluation
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
                Review work submitted by team members and record performance evaluations
              </p>
            </div>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="task-select"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '160px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Team Members</option>
                {users.map((u) => (
                  <option key={u._id} value={u.email}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>

              <select
                className="task-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '130px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </Reveal>

        {/* Task Cards Grid */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadDashboardData} />
        ) : filteredTasks.length === 0 ? (
          <div className="task-empty-state">
            <div className="task-empty-icon">🗂️</div>
            <h3 className="task-empty-title">No tasks found</h3>
            <p className="task-empty-desc">
              {statusFilter !== 'All' || userFilter !== 'All'
                ? 'Try changing the filters above to see more tasks.'
                : 'Assign your first task to a team member using the form above!'}
            </p>
          </div>
        ) : (
          <div className="task-cards-grid">
            {filteredTasks.map((task) => {
              const currentStatus = task.status || (task.completed ? 'Completed' : 'Pending');
              const statusTheme = STATUS_THEMES[currentStatus] || STATUS_THEMES.Pending;
              const priorityTheme = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Medium;
              const taskId = task._id || task.id;

              return (
                <div key={taskId} className={`task-card status-${currentStatus.toLowerCase()}`}>
                  <div className="task-card-header">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        className="task-status-badge"
                        style={{
                          background: statusTheme.bg,
                          borderColor: statusTheme.border,
                          color: statusTheme.color
                        }}
                      >
                        <span className="task-status-dot" style={{ background: statusTheme.color }} />
                        {currentStatus}
                      </span>

                      {task.priority && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: priorityTheme.bg,
                            color: priorityTheme.color
                          }}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>

                    <button
                      className="task-icon-btn delete"
                      title="Delete task"
                      onClick={() => handleDeleteTask(taskId)}
                    >
                      🗑️
                    </button>
                  </div>

                  <h3 className="task-card-title" style={{ marginTop: '0.6rem' }}>{task.title}</h3>
                  <p className="task-card-desc">
                    {task.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No description provided.</span>}
                  </p>

                  <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', margin: '0.75rem 0', fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <strong>Assigned To:</strong>{' '}
                      <span style={{ color: 'var(--accent-secondary)' }}>
                        {task.assignedTo || 'Unassigned'}
                      </span>
                    </div>
                    {task.evaluationVerdict && task.evaluationVerdict !== 'Pending Evaluation' && (
                      <div style={{ marginTop: '0.35rem', color: '#10B981' }}>
                        <strong>Verdict:</strong> {task.evaluationVerdict}{' '}
                        {task.evaluationScore ? `(${task.evaluationScore}/100)` : ''}
                      </div>
                    )}
                  </div>

                  {/* Evaluation Button */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(task.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}
                      onClick={() => handleOpenEvaluate(task)}
                    >
                      📝 Evaluate Deliverable
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evaluate Deliverable Modal */}
      {evaluatingTask && (
        <div className="modal-overlay" onClick={() => setEvaluatingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Evaluate Deliverable</h3>
              <button className="modal-close-btn" onClick={() => setEvaluatingTask(null)}>×</button>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '0.8rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                {evaluatingTask.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Assigned to: {evaluatingTask.assignedTo} | Status: {evaluatingTask.status || 'Pending'}
              </div>
            </div>

            <form onSubmit={handleSubmitEvaluation}>
              <div className="task-form-group">
                <label className="task-label">Evaluation Verdict</label>
                <select
                  className="task-select"
                  value={evaluationVerdict}
                  onChange={(e) => setEvaluationVerdict(e.target.value)}
                >
                  <option value="Approved">Approved</option>
                  <option value="Needs Revision">Needs Revision</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Pending Evaluation">Pending Evaluation</option>
                </select>
              </div>

              <div className="task-form-group">
                <label className="task-label">Score / Grade (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="task-input"
                  value={evaluationScore}
                  onChange={(e) => setEvaluationScore(e.target.value)}
                />
              </div>

              <div className="task-form-group">
                <label className="task-label">Admin Feedback &amp; Evaluation Notes</label>
                <textarea
                  rows="4"
                  className="task-textarea"
                  placeholder="Enter detailed feedback on the deliverable, areas for improvement, or praise..."
                  value={evaluationNotes}
                  onChange={(e) => setEvaluationNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEvaluatingTask(null)}
                  disabled={submittingEval}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEval}
                >
                  {submittingEval ? 'Saving Evaluation...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
