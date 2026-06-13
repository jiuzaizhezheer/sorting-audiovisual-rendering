import { bubbleSort } from './bubbleSort';
import { mergeSort } from './mergeSort';
import { quickSort } from './quickSort';
import type { SortAlgorithm, SortAlgorithmId } from '../types/sorting';

export const algorithms: SortAlgorithm[] = [bubbleSort, quickSort, mergeSort];

export const algorithmMap = algorithms.reduce(
  (map, algorithm) => {
    map[algorithm.id] = algorithm;
    return map;
  },
  {} as Record<SortAlgorithmId, SortAlgorithm>,
);
