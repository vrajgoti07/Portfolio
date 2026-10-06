import TaskManager from '../components/TaskManager';

export default function TaskPage({ user, onLogout, onNavigate }) {
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
      <TaskManager user={user} onLogout={onLogout} onNavigate={onNavigate} />
    </div>
  );
}

