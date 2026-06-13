import { algorithms } from '../algorithms/registry';
import type { SortAlgorithmId } from '../types/sorting';

type AlgorithmTabsProps = {
  currentId: SortAlgorithmId;
  onSelect: (algorithmId: SortAlgorithmId) => void;
};

export const AlgorithmTabs = ({ currentId, onSelect }: AlgorithmTabsProps) => (
  <div className="grid gap-3 md:grid-cols-3">
    {algorithms.map((algorithm) => {
      const selected = algorithm.id === currentId;

      return (
        <button
          key={algorithm.id}
          type="button"
          onClick={() => onSelect(algorithm.id)}
          className={`rounded-md border p-4 text-left transition ${
            selected
              ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
          }`}
        >
          <span className="block text-sm font-semibold">{algorithm.name}</span>
          <span className={`mt-2 block text-xs leading-5 ${selected ? 'text-slate-200' : 'text-slate-500'}`}>
            {algorithm.summary}
          </span>
        </button>
      );
    })}
  </div>
);
