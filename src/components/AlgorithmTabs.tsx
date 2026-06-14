import { algorithms } from '../algorithms/registry';
import type { SortAlgorithmId } from '../types/sorting';

type AlgorithmTabsProps = {
  currentId: SortAlgorithmId;
  onSelect: (algorithmId: SortAlgorithmId) => void;
};

export const AlgorithmTabs = ({ currentId, onSelect }: AlgorithmTabsProps) => (
  <div className="inline-grid w-full gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm md:w-auto md:grid-cols-3">
    {algorithms.map((algorithm) => {
      const selected = algorithm.id === currentId;

      return (
        <button
          key={algorithm.id}
          type="button"
          onClick={() => onSelect(algorithm.id)}
          className={`h-9 rounded px-5 text-center transition md:min-w-32 ${
            selected
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          <span className="text-sm font-semibold">{algorithm.name}</span>
        </button>
      );
    })}
  </div>
);
