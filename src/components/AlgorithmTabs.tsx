import { algorithms } from '../algorithms/registry';
import type { SortAlgorithmId } from '../types/sorting';

type AlgorithmTabsProps = {
  currentId: SortAlgorithmId;
  onSelect: (algorithmId: SortAlgorithmId) => void;
};

const VISIBLE_ALGORITHM_COUNT = 3;

const getVisibleAlgorithms = (currentId: SortAlgorithmId) => {
  const selectedIndex = algorithms.findIndex((algorithm) => algorithm.id === currentId);

  if (selectedIndex <= 0) {
    return algorithms.slice(0, VISIBLE_ALGORITHM_COUNT);
  }

  return [-1, 0, 1].map((offset) => algorithms[(selectedIndex + offset + algorithms.length) % algorithms.length]);
};

export const AlgorithmTabs = ({ currentId, onSelect }: AlgorithmTabsProps) => {
  const visibleAlgorithms = getVisibleAlgorithms(currentId);

  return (
    <nav
      aria-label="排序算法"
      className="sticky top-2 z-10 grid w-full grid-cols-3 gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm md:w-[min(100%,30rem)]"
    >
      {visibleAlgorithms.map((algorithm) => {
        const selected = algorithm.id === currentId;

        return (
          <button
            key={`${currentId}-${algorithm.id}`}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onSelect(algorithm.id)}
            className={`h-9 min-w-0 rounded px-2 text-center transition duration-200 ${
              selected
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <span className="block truncate text-sm font-semibold">{algorithm.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
