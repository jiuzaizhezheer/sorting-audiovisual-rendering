import { useEffect, useRef, useState } from 'react';
import { algorithms } from '../algorithms/registry';
import type { SortAlgorithmId } from '../types/sorting';

type AlgorithmTabsProps = {
  currentId: SortAlgorithmId;
  onSelect: (algorithmId: SortAlgorithmId) => void;
};

const VISIBLE_ALGORITHM_COUNT = 3;
const TAB_GAP_PX = 4;

const getWindowStartIndex = (currentId: SortAlgorithmId) => {
  const selectedIndex = algorithms.findIndex((algorithm) => algorithm.id === currentId);
  const maxStartIndex = Math.max(0, algorithms.length - VISIBLE_ALGORITHM_COUNT);

  if (selectedIndex <= 0) {
    return 0;
  }

  return Math.min(selectedIndex - 1, maxStartIndex);
};

export const AlgorithmTabs = ({ currentId, onSelect }: AlgorithmTabsProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const windowStartIndex = getWindowStartIndex(currentId);
  const tabWidth =
    viewportWidth > 0
      ? (viewportWidth - TAB_GAP_PX * (VISIBLE_ALGORITHM_COUNT - 1)) / VISIBLE_ALGORITHM_COUNT
      : 0;
  const trackOffset = windowStartIndex * (tabWidth + TAB_GAP_PX);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateWidth = () => setViewportWidth(viewport.clientWidth);
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <nav
      aria-label="排序算法"
      className="sticky top-2 z-10 w-full overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-sm"
    >
      <div ref={viewportRef} className="overflow-hidden">
        <div
          className="flex gap-1 transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            transform: `translateX(-${trackOffset}px)`,
          }}
        >
          {algorithms.map((algorithm, index) => {
            const selected = algorithm.id === currentId;

            return (
              <div
                key={`${algorithm.id}-${index}`}
                className="shrink-0"
                style={{
                  flexBasis:
                    viewportWidth > 0
                      ? `${tabWidth}px`
                      : `calc((100% - ${TAB_GAP_PX * (VISIBLE_ALGORITHM_COUNT - 1)}px) / ${VISIBLE_ALGORITHM_COUNT})`,
                }}
              >
                <button
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => onSelect(algorithm.id)}
                  className={`h-9 w-full min-w-0 rounded px-2 text-center transition-colors duration-200 ${
                    selected
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <span className="block truncate text-sm font-semibold">{algorithm.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
