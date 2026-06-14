import type { SortItem } from '../types/sorting';

export const createRandomArray = (size: number): SortItem[] =>
  Array.from({ length: size }, (_, originalIndex) => ({
    originalIndex,
    value: Math.floor(Math.random() * 86) + 12,
  }));
