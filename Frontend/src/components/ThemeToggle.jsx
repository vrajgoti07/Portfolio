import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggle}
      className="theme-toggle-btn"
      title={isDark ? 'Switch to Warm Ivory Light Mode' : 'Switch to Warm Charcoal Dark Mode'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      id="theme-toggle-btn"
    >
      {isDark ? (
        <Sun size={18} color="var(--accent-secondary, #E9A23B)" />
      ) : (
        <Moon size={18} color="var(--accent-primary, #FF6B35)" />
      )}
    </button>
  );
}
