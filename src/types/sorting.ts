export type SortAlgorithmId =
  | 'bubble'
  | 'quick'
  | 'merge'
  | 'selection'
  | 'insertion'
  | 'shell'
  | 'heap'
  | 'counting'
  | 'bucket'
  | 'radix';

export type SortPhase = 'idle' | 'comparing' | 'swapping' | 'overwriting' | 'partitioning' | 'done';

export type SortItem = {
  originalIndex: number;
  value: number;
};

export type SortStep = {
  activeIndices?: number[];
  audioIndices?: number[];
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
  createRunner: (values: SortItem[]) => Generator<SortStep, SortStep, void>;
};
