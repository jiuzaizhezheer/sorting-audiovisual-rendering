import { Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react';

type ControlPanelProps = {
  isPlaying: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  size: number;
  speedMs: number;
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onGenerate: () => void;
  onSizeChange: (size: number) => void;
  onSpeedChange: (speedMs: number) => void;
};

export const ControlPanel = ({
  isPlaying,
  canGoBack,
  canGoForward,
  size,
  speedMs,
  onTogglePlayback,
  onPrevious,
  onNext,
  onReset,
  onGenerate,
  onSizeChange,
  onSpeedChange,
}: ControlPanelProps) => (
  <section className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
    <div className="grid grid-cols-5 gap-2">
      <button
        type="button"
        onClick={onTogglePlayback}
        disabled={!canGoForward}
        className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        {isPlaying ? '暂停' : '播放'}
      </button>
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoBack}
        title="上一步"
        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <SkipBack size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        title="下一步"
        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
      >
        <SkipForward size={18} />
      </button>
      <button
        type="button"
        onClick={onReset}
        title="重置步骤"
        className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
      >
        <RotateCcw size={18} />
      </button>
    </div>

    <button
      type="button"
      onClick={onGenerate}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800 hover:border-slate-500"
    >
      <Shuffle size={17} />
      生成新数组
    </button>

    <label className="grid gap-2 text-sm text-slate-600">
      <span className="flex items-center justify-between">
        <span>数组长度</span>
        <span className="font-mono text-slate-900">{size}</span>
      </span>
      <input
        type="range"
        min="12"
        max="72"
        step="4"
        value={size}
        onChange={(event) => onSizeChange(Number(event.target.value))}
        className="accent-slate-950"
      />
    </label>

    <label className="grid gap-2 text-sm text-slate-600">
      <span className="flex items-center justify-between">
        <span>播放间隔</span>
        <span className="font-mono text-slate-900">{speedMs}ms</span>
      </span>
      <input
        type="range"
        min="40"
        max="500"
        step="20"
        value={speedMs}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
        className="accent-slate-950"
      />
    </label>
  </section>
);
