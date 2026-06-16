import { bucketSort } from './bucketSort';
import { bubbleSort } from './bubbleSort';
import { countingSort } from './countingSort';
import { heapSort } from './heapSort';
import { insertionSort } from './insertionSort';
import { mergeSort } from './mergeSort';
import { quickSort } from './quickSort';
import { radixSort } from './radixSort';
import { selectionSort } from './selectionSort';
import { shellSort } from './shellSort';
import type { SortAlgorithm, SortAlgorithmId } from '../types/sorting';

export const algorithms: SortAlgorithm[] = [
  bubbleSort,
  quickSort,
  mergeSort,
  selectionSort,
  insertionSort,
  shellSort,
  heapSort,
  countingSort,
  bucketSort,
  radixSort,
];

export const algorithmMap = algorithms.reduce(
  (map, algorithm) => {
    map[algorithm.id] = algorithm;
    return map;
  },
  {} as Record<SortAlgorithmId, SortAlgorithm>,
);
