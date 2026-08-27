import TaskManager from '../components/TaskManager';

export default function TaskPage({ user, onLogout }) {
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
      <TaskManager user={user} onLogout={onLogout} />
    </div>
  );
}
