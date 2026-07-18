import React from 'react';
import Contact from '../components/Contact';
import Reveal from '../components/Reveal';

export default function ContactPage() {
  return (
    <section id="contact" className="py-[72px]">
      <Reveal>
        <div className="font-code text-sm text-soft mb-4">// contact.md</div>
        <h2 className="font-display font-bold text-[32px] text-ink mb-8 tracking-tight">
          Initialize Connections
        </h2>
        <Contact />
      </Reveal>
    </section>
  );
}
