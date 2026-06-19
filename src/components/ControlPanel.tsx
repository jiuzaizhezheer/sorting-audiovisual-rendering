import { FileAudio, Pause, Play, RotateCcw, Shuffle } from 'lucide-react';

type TickRangeProps<TValue extends number> = {
  label: string;
  suffix?: string;
  value: TValue;
  options: readonly TValue[];
  onChange: (value: TValue) => void;
};

const TickRange = <TValue extends number>({ label, suffix = '', value, options, onChange }: TickRangeProps<TValue>) => {
  const foundIndex = options.findIndex((option) => option === value);
  const selectedIndex = foundIndex >= 0 ? foundIndex : 0;

  return (
    <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-400">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-mono text-slate-900 dark:text-slate-100">
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
          className="w-full accent-slate-950 dark:accent-slate-100"
        />
        <div className="relative h-4 font-mono text-xs text-slate-500 dark:text-slate-500">
          {options.map((option, index) => {
            const left = options.length > 1 ? (index / (options.length - 1)) * 100 : 50;
            return (
              <span
                key={option}
                className="absolute -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                {option}
              </span>
            );
          })}
        </div>
      </div>
    </label>
  );
};

type ControlPanelProps = {
  isPlaying: boolean;
  canPlay: boolean;
  isFullPlayback: boolean;
  size: number;
  sizeOptions: readonly number[];
  audioFileName: string | null;
  isAudioLoading: boolean;
  audioFileStatus: 'idle' | 'ready' | 'error';
  onTogglePlayback: () => void;
  onAudioFileChange: (file: File) => void;
  onReset: () => void;
  onGenerate: () => void;
  onSizeChange: (size: number) => void;
};

export const ControlPanel = ({
  isPlaying,
  canPlay,
  isFullPlayback,
  size,
  sizeOptions,
  audioFileName,
  isAudioLoading,
  audioFileStatus,
  onTogglePlayback,
  onAudioFileChange,
  onReset,
  onGenerate,
  onSizeChange,
}: ControlPanelProps) => (
  <section className="grid grid-rows-[auto_auto_auto] gap-2">
    <div className="grid min-h-0 gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">播放控制</p>
      <div className="grid grid-cols-[minmax(0,1fr)_clamp(42px,3.2vw,56px)] gap-2">
        <button
          type="button"
          onClick={onTogglePlayback}
          disabled={!canPlay}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isFullPlayback ? <Play size={18} /> : isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isFullPlayback ? '正在播放' : isPlaying ? '暂停' : '播放'}
        </button>
        <button
          type="button"
          onClick={onReset}
          title="重置步骤"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>

    <div className="grid min-h-0 gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">音频</p>

      <label
        className={`grid min-h-14 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-2 text-sm transition ${
          audioFileStatus === 'ready'
            ? 'border-emerald-700 bg-emerald-50 text-emerald-900 shadow-[inset_0_0_0_1px_rgba(4,120,87,0.12)] dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200'
            : audioFileStatus === 'error'
              ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
              : 'border-dashed border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-500'
        }`}
      >
        <span className="grid min-w-0 gap-0.5">
          <span className="inline-flex items-center gap-2 font-medium">
            <FileAudio size={17} />
            上传音频
          </span>
          <span className="truncate text-xs opacity-75">
            {isAudioLoading ? '正在解码音频...' : audioFileName ?? '未上传音频时分批推进，每批间隔1ms'}
          </span>
        </span>
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            audioFileStatus === 'ready'
              ? 'bg-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
              : audioFileStatus === 'error'
                ? 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.14)]'
                : isAudioLoading
                  ? 'bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.14)]'
                  : 'bg-slate-300'
          }`}
        />
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

    <div className="grid min-h-0 content-start gap-2 border-t border-slate-200 pt-2 dark:border-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">数据设置</p>
      <button
        type="button"
        onClick={onGenerate}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-800 transition-colors hover:border-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
      >
        <Shuffle size={17} />
        生成新数组
      </button>

      <TickRange label="数组长度" value={size} options={sizeOptions} onChange={onSizeChange} />
    </div>
  </section>
);
