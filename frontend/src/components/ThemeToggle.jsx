import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-full bg-white dark:bg-slate-800 shadow-md hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 ${className}`}
      aria-label="Toggle Dark Mode"
    >
      {isDark ? (
        <span className="material-icons-round text-xl text-amber-400">light_mode</span>
      ) : (
        <span className="material-icons-round text-xl">dark_mode</span>
      )}
    </button>
  );
}
