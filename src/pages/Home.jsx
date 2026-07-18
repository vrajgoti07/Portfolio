import React from 'react';
import { GitCommit } from 'lucide-react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Reveal from '../components/Reveal';
import { experience } from '../data/portfolioData';

export default function Home({ onNavigate }) {
  return (
    <div className="flex flex-col">
      {/* 1. Hero / About Area (about.tsx) */}
      <section id="about" className="py-[72px] border-b-2 border-line">
        <Hero onNavigate={onNavigate} />
        <About />
      </section>

      {/* 2. Skills Area (skills.json) */}
      <section id="skills" className="py-[72px] border-b-2 border-line">
        <Reveal>
          <div className="font-code text-sm text-soft mb-4">// skills.json</div>
          <h2 className="font-display font-bold text-[32px] text-ink mb-8 tracking-tight">
            Technical Domain Expertise
          </h2>
          <Skills />
        </Reveal>
      </section>

      {/* 3. Experience Area (experience.log) */}
      <section id="experience" className="py-[72px]">
        <Reveal>
          <div className="font-code text-sm text-soft mb-4">// experience.log</div>
          <h2 className="font-display font-bold text-[32px] text-ink mb-8 tracking-tight">
            Professional Changelog
          </h2>
          
          <div className="relative pl-8 ml-3">
            {/* Timeline Line */}
            <div className="absolute left-1 top-2 bottom-2 w-[2px] bg-ink" />

            {experience.map((exp, idx) => (
              <div className="relative mb-10 last:mb-0" key={idx}>
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[37px] top-1.5 w-4 h-4 border-2 border-ink rounded-full z-10 ${
                    idx === 0 ? 'bg-lime' : 'bg-paper'
                  }`}
                />
                
                <Reveal delay={idx * 150}>
                  <div className="font-code text-xs mb-1.5 flex items-center gap-2">
                    <span className="text-violet font-semibold flex items-center gap-1">
                      <GitCommit size={14} />
                      {exp.hash}
                    </span>
                    <span className="text-soft">{exp.dates}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink mb-2">
                    {exp.role}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-soft">
                    {exp.desc}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
