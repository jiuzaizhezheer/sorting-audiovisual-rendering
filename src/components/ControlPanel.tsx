import { FileAudio, Pause, Play, RotateCcw, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

const SPEED_OPTIONS = [2, 5, 7, 10] as const;
const SIZE_OPTIONS = [50, 100, 150, 200] as const;

type TickRangeProps<TValue extends number> = {
  label: string;
  suffix?: string;
  value: TValue;
  options: readonly TValue[];
  onChange: (value: TValue) => void;
};

const TickRange = <TValue extends number>({ label, suffix = '', value, options, onChange }: TickRangeProps<TValue>) => {
  const selectedIndex = Math.max(0, options.findIndex((option) => option === value));

  return (
    <label className="grid gap-1 text-sm text-slate-600">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-slate-900">
          {value}
          {suffix}
        </span>
      </span>
      <div className="grid gap-1 px-2">
        <input
          type="range"
          min="0"
          max={options.length - 1}
          step="1"
          value={selectedIndex}
          onChange={(event) => onChange(options[Number(event.target.value)])}
          className="w-full accent-slate-950"
        />
        <div className="flex justify-between font-mono text-xs text-slate-500">
          {options.map((option) => (
            <span key={option} className="w-0 text-center">
              {option}
            </span>
          ))}
        </div>
      </div>
    </label>
  );
};

type ControlPanelProps = {
  isPlaying: boolean;
  isSoundEnabled: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  size: number;
  speedMs: number;
  audioFileName: string | null;
  isAudioLoading: boolean;
  onTogglePlayback: () => void;
  onToggleSound: () => void;
  onAudioFileChange: (file: File) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onGenerate: () => void;
  onSizeChange: (size: number) => void;
  onSpeedChange: (speedMs: number) => void;
};

export const ControlPanel = ({
  isPlaying,
  isSoundEnabled,
  canGoBack,
  canGoForward,
  size,
  speedMs,
  audioFileName,
  isAudioLoading,
  onTogglePlayback,
  onToggleSound,
  onAudioFileChange,
  onPrevious,
  onNext,
  onReset,
  onGenerate,
  onSizeChange,
  onSpeedChange,
}: ControlPanelProps) => (
  <section className="grid grid-rows-[auto_auto_auto] gap-2">
    <div className="grid min-h-0 gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">播放控制</p>
      <div className="grid grid-cols-[clamp(42px,3.2vw,56px)_minmax(0,1fr)_clamp(42px,3.2vw,56px)_clamp(42px,3.2vw,56px)] gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoBack}
          title="上一步"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <SkipBack size={18} />
        </button>
        <button
          type="button"
          onClick={onTogglePlayback}
          disabled={!canGoForward}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoForward}
          title="下一步"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <SkipForward size={18} />
        </button>
        <button
          type="button"
          onClick={onReset}
          title="重置步骤"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 text-slate-700"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>

    <div className="grid min-h-0 gap-2 border-t border-slate-200 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">声音与音频</p>
      <button
        type="button"
        onClick={onToggleSound}
        className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${
          isSoundEnabled
            ? 'border-cyan-700 bg-cyan-50 text-cyan-800'
            : 'border-slate-300 text-slate-600 hover:border-slate-500'
        }`}
      >
        {isSoundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        {isSoundEnabled ? '声音已开启' : '声音已关闭'}
      </button>

      <label className="grid min-h-14 cursor-pointer content-center gap-0.5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-2 text-sm text-slate-700 hover:border-slate-500">
        <span className="inline-flex items-center gap-2 font-medium text-slate-800">
          <FileAudio size={17} />
          上传音频
        </span>
        <span className="truncate text-xs text-slate-500">
          {isAudioLoading ? '正在解码音频...' : audioFileName ?? '未上传时使用合成音调'}
        </span>
        <input
          type="file"
          accept="audio/*"
          disabled={isAudioLoading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onAudioFileChange(file);
            }
            event.target.value = '';
          }}
          className="sr-only"
        />
      </label>
    </div>

    <div className="grid min-h-0 content-start gap-2 border-t border-slate-200 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">数据设置</p>
      <button
        type="button"
        onClick={onGenerate}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800 hover:border-slate-500"
      >
        <Shuffle size={17} />
        生成新数组
      </button>

      <TickRange label="数组长度" value={size} options={SIZE_OPTIONS} onChange={onSizeChange} />
      <TickRange label="播放间隔" suffix="ms" value={speedMs} options={SPEED_OPTIONS} onChange={onSpeedChange} />
    </div>
  </section>
);
