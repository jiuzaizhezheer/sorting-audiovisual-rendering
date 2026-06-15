import type { SortAlgorithmId, SortItem, SortStep } from '../types/sorting';
import { createRandomArray } from '../utils/randomArray';

export type SortState = {
  algorithmId: SortAlgorithmId;
  values: SortItem[];
  currentStep: SortStep;
  isPlaying: boolean;
  isDone: boolean;
  size: number;
};

export type SortAction =
  | { type: 'selectAlgorithm'; algorithmId: SortAlgorithmId }
  | { type: 'togglePlayback' }
  | { type: 'applyStep'; values: SortItem[]; step: SortStep; isDone: boolean }
  | { type: 'resetValues'; values: SortItem[]; size?: number };

export const createIdleStep = (): SortStep => ({
  phase: 'idle',
  note: '初始数组已生成，准备开始排序。',
});

export const DEFAULT_ALGORITHM_ID: SortAlgorithmId = 'bubble';

export const createInitialSortState = (): SortState => {
  const algorithmId = DEFAULT_ALGORITHM_ID;
  const size = 400;
  const values = createRandomArray(size);

  return {
    algorithmId,
    values,
    currentStep: createIdleStep(),
    isPlaying: false,
    isDone: false,
    size,
  };
};

export const sortReducer = (state: SortState, action: SortAction): SortState => {
  switch (action.type) {
    case 'selectAlgorithm': {
      return {
        ...state,
        algorithmId: action.algorithmId,
        currentStep: createIdleStep(),
        isPlaying: false,
        isDone: false,
      };
    }
    case 'togglePlayback':
      return {
        ...state,
        isPlaying: state.isDone ? false : !state.isPlaying,
      };
    case 'applyStep':
      return {
        ...state,
        values: action.values,
        currentStep: action.step,
        isPlaying: action.isDone ? false : state.isPlaying,
        isDone: action.isDone,
      };
    case 'resetValues':
      return {
        ...state,
        values: action.values,
        size: action.size ?? state.size,
        currentStep: createIdleStep(),
        isPlaying: false,
        isDone: false,
      };
    default:
      return state;
  }
};
