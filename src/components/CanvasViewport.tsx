import { useEffect, useRef } from 'react';
import { drawSortState } from '../canvas/drawSortState';
import type { SortItem, SortStep } from '../types/sorting';

type CanvasViewportProps = {
  values: SortItem[];
  step: SortStep;
  playbackOriginalIndex: number | null;
};

export const CanvasViewport = ({ values, step, playbackOriginalIndex }: CanvasViewportProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef<() => void>(() => {});

  renderRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSortState(canvas, values, step, playbackOriginalIndex);
  };

  useEffect(() => {
    renderRef.current();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => renderRef.current();
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex h-[460px] min-h-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:h-full">
      <div className="min-h-0 flex-1 bg-slate-50">
        <canvas ref={canvasRef} className="h-full w-full" aria-label="排序过程可视化画布" />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-slate-600" />
          当前数组
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-cyan-600" />
          比较
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-rose-600" />
          交换
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-blue-700" />
          写回
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-orange-500" />
          基准
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-green-700" />
          已完成
        </span>
        <span className="inline-flex items-center gap-2 text-slate-600">
          <span className="h-3 w-3 rounded-sm bg-purple-600" />
          正在播放
        </span>
      </div>
    </div>
  );
};
