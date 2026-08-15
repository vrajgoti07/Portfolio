import Projects from '../components/Projects';

export default function ProjectsPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
      <Projects onNavigate={onNavigate} />
    </div>
  );
}
