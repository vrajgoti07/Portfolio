import { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Users,
  CheckSquare,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Award,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

/* Strict Warm Palette Status & Priority Themes (Zero Blue/Cyan/Purple) */
const STATUS_THEMES = {
  Pending: { bg: 'rgba(233, 162, 59, 0.12)', border: 'rgba(233, 162, 59, 0.4)', color: '#E9A23B' },
  Ongoing: { bg: 'rgba(255, 107, 53, 0.12)', border: 'rgba(255, 107, 53, 0.4)', color: '#FF6B35' },
  Completed: { bg: 'rgba(85, 182, 133, 0.12)', border: 'rgba(85, 182, 133, 0.4)', color: '#55B685' }
};

const PRIORITY_BADGES = {
  Low: { color: '#A8A29A', bg: 'rgba(168, 162, 154, 0.12)', border: 'rgba(168, 162, 154, 0.25)' },
  Medium: { color: '#E9A23B', bg: 'rgba(233, 162, 59, 0.12)', border: 'rgba(233, 162, 59, 0.3)' },
  High: { color: '#FF6B35', bg: 'rgba(255, 107, 53, 0.15)', border: 'rgba(255, 107, 53, 0.4)' },
  Urgent: { color: '#E56B6F', bg: 'rgba(229, 107, 111, 0.15)', border: 'rgba(229, 107, 111, 0.4)' }
};

export default function AdminDashboard({ onNavigate }) {
  const currentEmail = (getUserEmail() || '').toLowerCase().trim();
  const currentRole = getUserRole();
  const isAdmin = currentEmail === 'vrajgoti07@gmail.com' || currentRole === 'admin';

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(isAdmin));
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'assign' | 'tasks'

  // Task Assign Form State
  const [assignedTo, setAssignedTo] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigning, setAssigning] = useState(false);

  // Evaluate Modal State
  const [evaluatingTask, setEvaluatingTask] = useState(null);
  const [evaluationVerdict, setEvaluationVerdict] = useState('Approved');
  const [evaluationScore, setEvaluationScore] = useState(95);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Delete Confirm Modal State
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const showToast = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Fetch users and tasks
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const [usersData, tasksData] = await Promise.all([
        getAdminUsers(),
        getTasks()
      ]);

      setUsers(usersData.users || []);
      setTasks(Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []));
      if (isRefresh) {
        showToast('success', 'Executive administrative metrics refreshed.');
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(err.message || 'Failed to load executive admin telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    let ignore = false;
    if (isAdmin) {
      Promise.all([getAdminUsers(), getTasks()])
        .then(([usersData, tasksData]) => {
          if (!ignore) {
            setUsers(usersData.users || []);
            setTasks(Array.isArray(tasksData) ? tasksData : (tasksData.tasks || []));
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            console.error('Admin dashboard error:', err);
            setError(err.message || 'Failed to load executive admin telemetry.');
            setLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => (t.status || 'Pending') === 'Pending').length;
    const ongoingTasks = tasks.filter((t) => t.status === 'Ongoing' || t.status === 'In Progress').length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed' || t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers: users.length,
      totalTasks,
      pendingTasks,
      ongoingTasks,
      completedTasks,
      completionRate
    };
  }, [tasks, users]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = !searchFilter.trim() ||
        t.title.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
        (t.description && t.description.toLowerCase().includes(searchFilter.toLowerCase().trim())) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(searchFilter.toLowerCase().trim()));

      const status = t.status || (t.completed ? 'Completed' : 'Pending');
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      const matchesUser = userFilter === 'All' || (t.assignedTo || '').toLowerCase() === userFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesUser;
    });
  }, [tasks, searchFilter, statusFilter, userFilter]);

  // Handle assign task
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('error', 'Task title cannot be empty.');
      return;
    }
    if (!assignedTo) {
      showToast('error', 'Please select a team member.');
      return;
    }

    setAssigning(true);
    try {
      const res = await assignAdminTask({
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedTo,
        priority
      });

      showToast('success', res.message || 'Task successfully assigned to team member.');
      setTaskTitle('');
      setTaskDescription('');
      setPriority('Medium');
      loadDashboardData(true);
      setActiveTab('tasks');
    } catch (err) {
      showToast('error', err.message || 'Failed to assign task.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle evaluate task
  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    if (!evaluatingTask) return;

    setSubmittingEval(true);
    try {
      const res = await evaluateAdminTask(evaluatingTask._id, {
        evaluationVerdict,
        evaluationScore: Number(evaluationScore),
        evaluationNotes: evaluationNotes.trim()
      });

      showToast('success', res.message || 'Deliverable evaluation submitted.');
      setEvaluatingTask(null);
      loadDashboardData(true);
    } catch (err) {
      showToast('error', err.message || 'Failed to submit evaluation.');
    } finally {
      setSubmittingEval(false);
    }
  };

  // Handle delete task
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    setIsDeleting(true);
    try {
      await deleteTask(deletingTaskId);
      showToast('success', 'Task removed successfully.');
      setDeletingTaskId(null);
      loadDashboardData(true);
    } catch (err) {
      showToast('error', err.message || 'Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Unauthorized guard
  if (!isAdmin) {
    return (
      <div style={{ paddingTop: '120px', paddingBottom: '5rem', minHeight: '80vh', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '520px' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem 2rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(233, 162, 59, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: 'var(--accent-secondary)'
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
              Administrator Authorization Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              This portal is restricted to executive administrator credentials (<code>vrajgoti07@gmail.com</code>).
              Please sign in with administrator rights to access team management.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('/login')}>
                Admin Login
              </button>
              <button className="btn btn-secondary" onClick={() => onNavigate('/')}>
                Back to Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '5rem', minHeight: '88vh' }}>
      <div className="container" style={{ maxWidth: '1280px' }}>
        {/* Global Toast */}
        {notification && (
          <NotificationToast
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Dashboard Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="section-tag" style={{ margin: 0 }}>
                👑 RBAC Executive Portal
              </span>
              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentEmail}
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              Admin Executive Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
              Orchestrate team workloads, assign tasks with real-time SMTP alerts, and evaluate deliverables.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              title="Refresh telemetry"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>

            <button
              onClick={() => setActiveTab('assign')}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={15} />
              <span>Assign New Task</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && <Spinner message="Loading executive telemetry and team workloads..." />}

        {/* Error state */}
        {!loading && error && <ErrorMessage message={error} onRetry={() => loadDashboardData(true)} />}

        {!loading && !error && (
          <>
            {/* Executive Summary Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem'
              }}
            >
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Registered Team</span>
                  <Users size={16} color="var(--accent-secondary)" />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalUsers}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Collaborating members</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Total Tasks</span>
                  <CheckSquare size={16} color="var(--accent-primary)" />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalTasks}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Across all pipelines</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Pending</span>
                  <Clock size={16} color="var(--accent-secondary)" />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{stats.pendingTasks}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Awaiting execution</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Ongoing</span>
                  <Sparkles size={16} color="var(--accent-primary)" />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.ongoingTasks}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active development</span>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Completed</span>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-success)' }}>{stats.completedTasks}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stats.completionRate}% completion velocity</span>
              </div>
            </div>

            {/* Admin Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <button
                className={`skill-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview &amp; Telemetry
              </button>
              <button
                className={`skill-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Team Workloads ({users.length})
              </button>
              <button
                className={`skill-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                Manage Deliverables ({tasks.length})
              </button>
              <button
                className={`skill-tab-btn ${activeTab === 'assign' ? 'active' : ''}`}
                onClick={() => setActiveTab('assign')}
              >
                + Assign Task
              </button>
            </div>

            {/* TAB 1: OVERVIEW & USERS TABLE */}
            {(activeTab === 'overview' || activeTab === 'users') && (
              <Reveal>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Team Members &amp; Workload Allocation
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Registered users, assigned tasks, and current execution distribution.
                  </p>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>User / Member</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Pending</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Ongoing</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Completed</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id} style={{ borderBottom: '1px solid rgba(53, 49, 45, 0.5)' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <div>{u.name || u.email.split('@')[0]}</div>
                              <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                                {u.email}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {u.taskStats?.total || 0}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-secondary)' }}>
                              {u.taskStats?.pending || 0}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--accent-primary)' }}>
                              {u.taskStats?.ongoing || 0}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--color-success)' }}>
                              {u.taskStats?.completed || 0}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                                onClick={() => {
                                  setAssignedTo(u.email);
                                  setActiveTab('assign');
                                }}
                              >
                                Assign Task
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            )}

            {/* TAB 2: ASSIGN TASK FORM */}
            {activeTab === 'assign' && (
              <Reveal>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2.25rem', maxWidth: '720px', margin: '0 auto 2.5rem auto', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 107, 53, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Assign New Task
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Dispatches task assignment with asynchronous SMTP notification to assignee.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAssignTask} noValidate>
                    <div className="form-group">
                      <label htmlFor="admin-assign-user" className="form-label">
                        Assignee (Team Member) *
                      </label>
                      <select
                        id="admin-assign-user"
                        required
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select team member...</option>
                        {users.map((u) => (
                          <option key={u._id} value={u.email}>
                            {u.name ? `${u.name} (${u.email})` : u.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-task-title" className="form-label">
                        Task Title *
                      </label>
                      <input
                        id="admin-task-title"
                        type="text"
                        required
                        placeholder="e.g. Implement asynchronous background email queue"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-task-desc" className="form-label">
                        Technical Description &amp; Deliverable Guidelines
                      </label>
                      <textarea
                        id="admin-task-desc"
                        rows={4}
                        placeholder="Detail the acceptance criteria and architecture requirements..."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="admin-task-priority" className="form-label">
                        Priority Level
                      </label>
                      <select
                        id="admin-task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Urgent">Urgent Priority</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                      <button
                        type="submit"
                        disabled={assigning}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.8rem' }}
                      >
                        {assigning ? 'Dispatching Task...' : 'Confirm & Dispatch Task'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('tasks')}
                        className="btn btn-secondary"
                        style={{ padding: '0.8rem 1.25rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Reveal>
            )}

            {/* TAB 3: MANAGE DELIVERABLES & EVALUATIONS */}
            {(activeTab === 'overview' || activeTab === 'tasks') && (
              <Reveal delay={100}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Deliverables &amp; Evaluation Pipeline ({filteredTasks.length})
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                        Review deliverables, assign evaluation scores, and administer task lifecycles.
                      </p>
                    </div>

                    {/* Search & Filter Inputs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={searchFilter}
                          onChange={(e) => setSearchFilter(e.target.value)}
                          className="search-input-box"
                          style={{ paddingLeft: '30px', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Filter size={14} color="var(--text-muted)" />
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="sort-select-box"
                          style={{ fontSize: '0.82rem' }}
                          aria-label="Filter by task status"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <select
                          value={userFilter}
                          onChange={(e) => setUserFilter(e.target.value)}
                          className="sort-select-box"
                          style={{ fontSize: '0.82rem' }}
                          aria-label="Filter by team member"
                        >
                          <option value="All">All Members</option>
                          {users.map((u) => (
                            <option key={u._id} value={u.email}>
                              {u.name || u.email.split('@')[0]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No tasks match the active filter</p>
                      <p style={{ fontSize: '0.85rem' }}>Try clearing your search query or status filter.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Task Details</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Assignee</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Priority</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Evaluation</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((t) => {
                            const status = t.status || (t.completed ? 'Completed' : 'Pending');
                            const statusTheme = STATUS_THEMES[status] || STATUS_THEMES.Pending;
                            const priorityTheme = PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.Medium;

                            return (
                              <tr key={t._id} style={{ borderBottom: '1px solid rgba(53, 49, 45, 0.5)' }}>
                                <td style={{ padding: '0.85rem 1rem', maxWidth: '320px' }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                    {t.title}
                                  </div>
                                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {t.description || 'No description provided.'}
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-code)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {t.assignedTo || 'Unassigned'}
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-code)',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.55rem',
                                      borderRadius: 'var(--radius-xs)',
                                      background: priorityTheme.bg,
                                      border: `1px solid ${priorityTheme.border}`,
                                      color: priorityTheme.color
                                    }}
                                  >
                                    {t.priority || 'Medium'}
                                  </span>
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-code)',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: 'var(--radius-full)',
                                      background: statusTheme.bg,
                                      border: `1px solid ${statusTheme.border}`,
                                      color: statusTheme.color
                                    }}
                                  >
                                    ● {status}
                                  </span>
                                </td>

                                <td style={{ padding: '0.85rem 1rem' }}>
                                  {t.evaluationVerdict ? (
                                    <div>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: t.evaluationVerdict === 'Approved' ? 'var(--color-success)' : 'var(--accent-secondary)' }}>
                                        {t.evaluationVerdict} ({t.evaluationScore || 0}/100)
                                      </span>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending Evaluation</span>
                                  )}
                                </td>

                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                      onClick={() => {
                                        setEvaluatingTask(t);
                                        setEvaluationVerdict(t.evaluationVerdict || 'Approved');
                                        setEvaluationScore(t.evaluationScore || 90);
                                        setEvaluationNotes(t.evaluationNotes || '');
                                      }}
                                      title="Evaluate Deliverable"
                                    >
                                      <Award size={13} />
                                      <span>Evaluate</span>
                                    </button>

                                    <button
                                      className="btn btn-ghost"
                                      style={{ padding: '0.35rem 0.55rem', color: 'var(--color-error)' }}
                                      onClick={() => setDeletingTaskId(t._id)}
                                      title="Delete Task"
                                      aria-label={`Delete ${t.title}`}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Reveal>
            )}
          </>
        )}

        {/* Deliverable Evaluation Modal */}
        {evaluatingTask && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="eval-title">
            <div className="modal-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <Award size={22} color="var(--accent-primary)" />
                <h3 id="eval-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Evaluate Task Deliverable
                </h3>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Assessing: <strong style={{ color: 'var(--text-primary)' }}>{evaluatingTask.title}</strong>
              </p>

              <form onSubmit={handleEvaluateSubmit}>
                <div className="form-group">
                  <label htmlFor="eval-verdict" className="form-label">
                    Verdict *
                  </label>
                  <select
                    id="eval-verdict"
                    value={evaluationVerdict}
                    onChange={(e) => setEvaluationVerdict(e.target.value)}
                    className="form-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Approved">Approved (Production Grade)</option>
                    <option value="Revision Needed">Revision Needed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="eval-score" className="form-label">
                    Score (0 - 100) *
                  </label>
                  <input
                    id="eval-score"
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evaluationScore}
                    onChange={(e) => setEvaluationScore(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eval-notes" className="form-label">
                    Evaluation Notes / Technical Feedback
                  </label>
                  <textarea
                    id="eval-notes"
                    rows={3}
                    placeholder="Provide actionable feedback for the assignee..."
                    value={evaluationNotes}
                    onChange={(e) => setEvaluationNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="submit"
                    disabled={submittingEval}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {submittingEval ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluatingTask(null)}
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
        {deletingTaskId && (
          <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
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

              <h3 id="del-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Confirm Task Removal
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Are you sure you want to delete this task? This action cannot be reversed and updates the database immediately.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--color-error)' }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Task'}
                </button>
                <button
                  onClick={() => setDeletingTaskId(null)}
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
    </div>
  );
}
