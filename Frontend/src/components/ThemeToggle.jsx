import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="toggle-btn"
      title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={14} color="var(--accent-gold)" />
          <span>Theme: Dark</span>
        </>
      ) : (
        <>
          <Moon size={14} color="var(--accent-primary)" />
          <span>Theme: Light</span>
        </>
      )}
    </button>
  );
}
