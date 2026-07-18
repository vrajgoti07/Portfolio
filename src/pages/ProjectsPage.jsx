import React from 'react';
import Projects from '../components/Projects';
import Reveal from '../components/Reveal';

export default function ProjectsPage() {
  return (
    <section id="work" className="py-[72px]">
      <Reveal>
        <div className="font-code text-sm text-soft mb-4">// work.js</div>
        <h2 className="font-display font-bold text-[32px] text-ink mb-8 tracking-tight">
          Selected Engineering Systems
        </h2>
        <Projects />
      </Reveal>
    </section>
  );
}
