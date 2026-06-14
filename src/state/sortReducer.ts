import { algorithmMap } from '../algorithms/registry';
import type { SortAlgorithmId, SortItem, SortStep } from '../types/sorting';
import { createRandomArray } from '../utils/randomArray';

export type SortState = {
  algorithmId: SortAlgorithmId;
  values: SortItem[];
  steps: SortStep[];
  stepIndex: number;
  isPlaying: boolean;
  isSoundEnabled: boolean;
  speedMs: number;
  size: number;
};

export type SortAction =
  | { type: 'selectAlgorithm'; algorithmId: SortAlgorithmId }
  | { type: 'generateValues' }
  | { type: 'setSize'; size: number }
  | { type: 'setSpeed'; speedMs: number }
  | { type: 'toggleSound' }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'togglePlayback' }
  | { type: 'nextStep' }
  | { type: 'previousStep' }
  | { type: 'resetSteps' };

const buildSteps = (algorithmId: SortAlgorithmId, values: SortItem[]): SortStep[] =>
  algorithmMap[algorithmId].createSteps(values);

export const createInitialSortState = (): SortState => {
  const algorithmId: SortAlgorithmId = 'bubble';
  const size = 100;
  const values = createRandomArray(size);

  return {
    algorithmId,
    values,
    steps: buildSteps(algorithmId, values),
    stepIndex: 0,
    isPlaying: false,
    isSoundEnabled: true,
    speedMs: 5,
    size,
  };
};

export const sortReducer = (state: SortState, action: SortAction): SortState => {
  switch (action.type) {
    case 'selectAlgorithm': {
      const steps = buildSteps(action.algorithmId, state.values);
      return {
        ...state,
        algorithmId: action.algorithmId,
        steps,
        stepIndex: 0,
        isPlaying: false,
      };
    }
    case 'generateValues': {
      const values = createRandomArray(state.size);
      return {
        ...state,
        values,
        steps: buildSteps(state.algorithmId, values),
        stepIndex: 0,
        isPlaying: false,
      };
    }
    case 'setSize': {
      const values = createRandomArray(action.size);
      return {
        ...state,
        size: action.size,
        values,
        steps: buildSteps(state.algorithmId, values),
        stepIndex: 0,
        isPlaying: false,
      };
    }
    case 'setSpeed':
      return {
        ...state,
        speedMs: action.speedMs,
      };
    case 'toggleSound':
      return {
        ...state,
        isSoundEnabled: !state.isSoundEnabled,
      };
    case 'play':
      return {
        ...state,
        isPlaying: state.stepIndex < state.steps.length - 1,
      };
    case 'pause':
      return {
        ...state,
        isPlaying: false,
      };
    case 'togglePlayback':
      return {
        ...state,
        isPlaying: state.stepIndex < state.steps.length - 1 ? !state.isPlaying : false,
      };
    case 'nextStep': {
      const stepIndex = Math.min(state.stepIndex + 1, state.steps.length - 1);
      return {
        ...state,
        stepIndex,
        isPlaying: stepIndex < state.steps.length - 1 ? state.isPlaying : false,
      };
    }
    case 'previousStep':
      return {
        ...state,
        stepIndex: Math.max(state.stepIndex - 1, 0),
        isPlaying: false,
      };
    case 'resetSteps':
      return {
        ...state,
        stepIndex: 0,
        isPlaying: false,
      };
    default:
      return state;
  }
};
