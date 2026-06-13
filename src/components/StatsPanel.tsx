import type { SortAlgorithm, SortStep } from '../types/sorting';

type StatsPanelProps = {
  algorithm: SortAlgorithm;
  currentStep: SortStep;
  stepIndex: number;
  totalSteps: number;
};

export const StatsPanel = ({ algorithm, currentStep, stepIndex, totalSteps }: StatsPanelProps) => {
  const progress = totalSteps <= 1 ? 100 : Math.round((stepIndex / (totalSteps - 1)) * 100);

  return (
    <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">当前算法</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">{algorithm.name}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{algorithm.bestFor}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-100 p-3">
          <p className="text-slate-500">时间复杂度</p>
          <p className="mt-1 font-mono text-slate-950">{algorithm.complexity.time}</p>
        </div>
        <div className="rounded-md bg-slate-100 p-3">
          <p className="text-slate-500">空间复杂度</p>
          <p className="mt-1 font-mono text-slate-950">{algorithm.complexity.space}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">步骤</span>
          <span className="font-mono text-slate-950">
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-950" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">状态说明</p>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-700">{currentStep.note}</p>
      </div>
    </section>
  );
};
