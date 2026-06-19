import type { SortAlgorithm } from '../types/sorting';

type StatsPanelProps = {
  algorithm: SortAlgorithm;
};

export const StatsPanel = ({ algorithm }: StatsPanelProps) => (
  <section className="flex min-h-0 flex-col gap-3 overflow-hidden border-t border-slate-200 pt-3 dark:border-slate-800">
    <div className="flex min-h-0 flex-col">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">当前算法</p>
      <h2 className="mt-1 shrink-0 text-lg font-semibold text-slate-950 dark:text-slate-100">{algorithm.name}</h2>
      <p className="mt-1 min-h-0 overflow-y-auto whitespace-normal break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
        {algorithm.bestFor}
      </p>
    </div>

    <div className="shrink-0 grid grid-cols-2 gap-[clamp(10px,1dvw,18px)] text-sm">
      <div className="min-w-0 rounded-md bg-slate-100 p-[clamp(10px,1.1dvw,18px)] dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">时间复杂度</p>
        <p className="mt-1 whitespace-normal break-words font-mono leading-6 text-slate-950 dark:text-slate-100">{algorithm.complexity.time}</p>
      </div>
      <div className="min-w-0 rounded-md bg-slate-100 p-[clamp(10px,1.1dvw,18px)] dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">空间复杂度</p>
        <p className="mt-1 whitespace-normal break-words font-mono leading-6 text-slate-950 dark:text-slate-100">{algorithm.complexity.space}</p>
      </div>
    </div>
  </section>
);
