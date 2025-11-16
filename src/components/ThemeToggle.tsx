import { Moon, Sun } from 'lucide-react';

type Props = {
  theme: 'light' | 'dark';
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="no-select flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur transition active:scale-95 sm:gap-2 sm:px-4 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      <Icon size={14} className="sm:hidden" />
      <Icon size={16} className="hidden sm:block" />
      <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
      <span className="sm:hidden">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
