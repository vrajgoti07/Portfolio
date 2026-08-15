import Hero from '../components/Hero';
import Skills from '../components/Skills';

export default function Home({ onNavigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Hero onNavigate={onNavigate} />
      <div style={{ paddingBottom: '4rem' }}>
        <Skills />
      </div>
    </div>
  );
}
