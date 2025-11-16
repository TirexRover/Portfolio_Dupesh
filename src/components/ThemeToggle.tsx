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
      className="flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
      aria-label="Toggle theme"
    >
      <Icon size={16} />
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
