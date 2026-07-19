import React from 'react';
import { Terminal } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function NotFound({ onBackToHome }) {
  return (
    <section className="py-[120px] flex items-center justify-center">
      <Reveal>
        <div className="bg-paper border-2 border-line shadow-[6px_6px_0px_var(--color-line)] p-8 max-w-[500px] text-left">
          <div className="font-code text-lime flex items-center gap-2 mb-4">
            <Terminal size={18} />
            <span>sys.error(404)</span>
          </div>
          <h2 className="font-display font-bold text-2xl text-ink mb-3">
            File Not Found
          </h2>
          <p className="font-body text-sm leading-relaxed text-soft mb-6">
            The workspace item you are looking for does not exist. It might have been deleted or moved to a different branch.
          </p>
          <button
            onClick={onBackToHome}
            className="font-code text-xs font-semibold bg-lime text-ink px-4 py-2.5 hard-box cursor-pointer hover:bg-[#b5eb29] transition-colors"
          >
            ~$ cd ~/workspace
          </button>
        </div>
      </Reveal>
    </section>
  );
}
