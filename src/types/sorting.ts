export type SortAlgorithmId = 'bubble' | 'quick' | 'merge';

export type SortPhase = 'idle' | 'comparing' | 'swapping' | 'overwriting' | 'partitioning' | 'done';

export type SortStep = {
  array: number[];
  activeIndices?: number[];
  sortedIndices?: number[];
  pivotIndex?: number;
  phase: SortPhase;
  note: string;
};

export type SortAlgorithm = {
  id: SortAlgorithmId;
  name: string;
  summary: string;
  bestFor: string;
  complexity: {
    time: string;
    space: string;
  };
  createSteps: (input: number[]) => SortStep[];
};
