import React from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function NotFound({ onBackToHome }) {
  return (
    <div className="notfound-container">
      {/* Background ambient orbs */}
      <div className="notfound-glow-1" />
      <div className="notfound-glow-2" />

      <Reveal>
        <div className="notfound-card">
          {/* Header tab control */}
          <div className="notfound-terminal-header">
            <div className="notfound-dots">
              <span className="notfound-dot red" />
              <span className="notfound-dot yellow" />
              <span className="notfound-dot green" />
            </div>
            <div className="font-code text-xs text-soft flex items-center gap-1.5">
              <Terminal size={14} className="text-violet" />
              <span>sys.error(404)</span>
            </div>
          </div>

          {/* Giant error code */}
          <div className="notfound-huge-text">404</div>

          {/* Text descriptions */}
          <div className="text-center mb-6">
            <h3 className="font-display font-bold text-xl text-ink mb-2">
              Workspace Item Not Found
            </h3>
            <p className="font-body text-sm leading-relaxed text-soft max-w-[360px] mx-auto">
              The path you requested does not exist. It might have been relocated, deleted, or never compiled.
            </p>
          </div>

          {/* Interactive code console details */}
          <div className="bg-panel border border-line rounded-lg p-4 font-code text-xs text-left mb-6 space-y-1 select-none">
            <div className="flex items-center gap-2">
              <span className="text-violet">status:</span>
              <span className="text-soft">RESOLVED_NULL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet">target:</span>
              <span className="text-soft truncate max-w-[280px]">{window.location.pathname}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-violet">action:</span>
              <span className="text-soft">cd ~/workspace</span>
            </div>
          </div>

          {/* Rollback button */}
          <button
            onClick={onBackToHome}
            className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 cursor-pointer"
          >
            <span>~$ cd ~/workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </Reveal>
    </div>
  );
}
