import About from '../components/About';

export default function AboutPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '4rem' }}>
      <About onNavigate={onNavigate} />
    </div>
  );
}
