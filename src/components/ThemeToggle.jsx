import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function ThemeToggle({ reducedMotion, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 font-code text-xs text-soft hover:text-ink hover:bg-paper/80 border border-line hard-box bg-panel transition-all cursor-pointer"
      title={reducedMotion ? "Enable animations" : "Disable animations (Reduced Motion)"}
    >
      {reducedMotion ? (
        <>
          <EyeOff size={14} className="text-violet" />
          <span>Motion: Off</span>
        </>
      ) : (
        <>
          <Eye size={14} className="text-lime" />
          <span>Motion: On</span>
        </>
      )}
    </button>
  );
}
