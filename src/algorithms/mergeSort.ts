import type { SortAlgorithm, SortItem, SortStep } from '../types/sorting';

export const mergeSort: SortAlgorithm = {
  id: 'merge',
  name: '归并排序',
  summary: '先递归拆分数组，再把有序片段合并回原数组。',
  bestFor: '适合理解分治和稳定排序，代价是需要额外空间。',
  complexity: {
    time: 'O(n log n)',
    space: 'O(n)',
  },
  *createRunner(values) {
    function* merge(left: number, middle: number, right: number): Generator<SortStep, void, void> {
      const leftSlice = values.slice(left, middle + 1);
      const rightSlice = values.slice(middle + 1, right + 1);
      const merged: SortItem[] = [];
      let leftIndex = 0;
      let rightIndex = 0;

      while (leftIndex < leftSlice.length && rightIndex < rightSlice.length) {
        const leftPos = left + leftIndex;
        const rightPos = middle + 1 + rightIndex;

        yield {
          activeIndices: [leftPos, rightPos],
          audioIndices: [leftPos, rightPos],
          phase: 'comparing',
          note: `比较左段 ${leftSlice[leftIndex].value} 和右段 ${rightSlice[rightIndex].value}。`,
        };

        if (leftSlice[leftIndex].value <= rightSlice[rightIndex].value) {
          merged.push(leftSlice[leftIndex]);
          leftIndex += 1;
        } else {
          merged.push(rightSlice[rightIndex]);
          rightIndex += 1;
        }
      }

      while (leftIndex < leftSlice.length) {
        merged.push(leftSlice[leftIndex]);
        leftIndex += 1;
      }

      while (rightIndex < rightSlice.length) {
        merged.push(rightSlice[rightIndex]);
        rightIndex += 1;
      }

      for (let i = 0; i < merged.length; i += 1) {
        const targetIndex = left + i;
        values[targetIndex] = merged[i];
        yield {
          activeIndices: [targetIndex],
          audioIndices: [targetIndex],
          phase: 'overwriting',
          note: `把值 ${merged[i].value} 写回第 ${targetIndex + 1} 个位置。`,
        };
      }

      yield {
        activeIndices: Array.from({ length: right - left + 1 }, (_, index) => left + index),
        phase: 'done',
        note: `第 ${left + 1} 到第 ${right + 1} 个位置完成一轮合并。`,
      };
    }

    function* sort(left: number, right: number): Generator<SortStep, void, void> {
      if (left >= right) {
        return;
      }

      const middle = Math.floor((left + right) / 2);
      yield* sort(left, middle);
      yield* sort(middle + 1, right);
      yield* merge(left, middle, right);
    }

    yield* sort(0, values.length - 1);
    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '归并排序完成。',
    };
  },
};
