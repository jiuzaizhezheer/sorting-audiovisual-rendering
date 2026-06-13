import { useEffect, useRef } from 'react';
import { drawSortState } from '../canvas/drawSortState';
import type { SortStep } from '../types/sorting';

type CanvasViewportProps = {
  step: SortStep;
};

export const CanvasViewport = ({ step }: CanvasViewportProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const render = () => drawSortState(canvas, step);
    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [step]);

  return (
    <div className="h-[360px] min-h-[300px] overflow-hidden rounded-md border border-slate-200 bg-slate-50 shadow-sm md:h-[520px]">
      <canvas ref={canvasRef} className="h-full w-full" aria-label="排序过程可视化画布" />
    </div>
  );
};
