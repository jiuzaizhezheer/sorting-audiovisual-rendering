import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
};

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? '切换到白天模式' : '切换到夜间模式'}
      title={isDark ? '切换到白天模式' : '切换到夜间模式'}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
};
