import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { drawSortState } from '../canvas/drawSortState';
import type { SortItem, SortStep } from '../types/sorting';

type CanvasViewportProps = {
  values: SortItem[];
  step: SortStep;
  playbackOriginalIndex: number | null;
  scaleMaxValue: number;
};

export const CanvasViewport = ({ values, step, playbackOriginalIndex, scaleMaxValue }: CanvasViewportProps) => {
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderRef = useRef<() => void>(() => {});
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  renderRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;
    drawSortState(canvas, values, step, playbackOriginalIndex, scaleMaxValue, canvasSize.width, canvasSize.height);
  };

  useLayoutEffect(() => {
    renderRef.current();
  });

  useEffect(() => {
    const canvasArea = canvasAreaRef.current;
    if (!canvasArea) return;

    const updateCanvasSize = () => {
      const { width, height } = canvasArea.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(width));
      const nextHeight = Math.max(1, Math.floor(height));

      setCanvasSize((currentSize) => {
        if (currentSize.width === nextWidth && currentSize.height === nextHeight) {
          return currentSize;
        }

        return { width: nextWidth, height: nextHeight };
      });
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasArea);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex h-[460px] min-h-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:h-full">
      <div ref={canvasAreaRef} className="min-h-0 flex-1 bg-slate-50">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ height: canvasSize.height, width: canvasSize.width }}
          aria-label="排序过程可视化画布"
        />
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
