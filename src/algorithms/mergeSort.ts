import type { SortAlgorithm, SortStep } from '../types/sorting';

export const mergeSort: SortAlgorithm = {
  id: 'merge',
  name: '归并排序',
  summary: '先递归拆分数组，再把有序片段合并回原数组。',
  bestFor: '适合理解分治和稳定排序，代价是需要额外空间。',
  complexity: {
    time: 'O(n log n)',
    space: 'O(n)',
  },
  createSteps(input) {
    const values = [...input];
    const steps: SortStep[] = [
      {
        array: [...values],
        phase: 'idle',
        note: '初始数组已生成，准备递归拆分。',
      },
    ];

    const merge = (left: number, middle: number, right: number): void => {
      const leftSlice = values.slice(left, middle + 1);
      const rightSlice = values.slice(middle + 1, right + 1);
      let leftIndex = 0;
      let rightIndex = 0;
      let writeIndex = left;

      while (leftIndex < leftSlice.length && rightIndex < rightSlice.length) {
        steps.push({
          array: [...values],
          activeIndices: [left + leftIndex, middle + 1 + rightIndex],
          phase: 'comparing',
          note: `比较左段 ${leftSlice[leftIndex]} 和右段 ${rightSlice[rightIndex]}。`,
        });

        if (leftSlice[leftIndex] <= rightSlice[rightIndex]) {
          values[writeIndex] = leftSlice[leftIndex];
          leftIndex += 1;
        } else {
          values[writeIndex] = rightSlice[rightIndex];
          rightIndex += 1;
        }

        steps.push({
          array: [...values],
          activeIndices: [writeIndex],
          phase: 'overwriting',
          note: `把较小值写回第 ${writeIndex + 1} 个位置。`,
        });
        writeIndex += 1;
      }

      while (leftIndex < leftSlice.length) {
        values[writeIndex] = leftSlice[leftIndex];
        steps.push({
          array: [...values],
          activeIndices: [writeIndex],
          phase: 'overwriting',
          note: `左段剩余值写回第 ${writeIndex + 1} 个位置。`,
        });
        leftIndex += 1;
        writeIndex += 1;
      }

      while (rightIndex < rightSlice.length) {
        values[writeIndex] = rightSlice[rightIndex];
        steps.push({
          array: [...values],
          activeIndices: [writeIndex],
          phase: 'overwriting',
          note: `右段剩余值写回第 ${writeIndex + 1} 个位置。`,
        });
        rightIndex += 1;
        writeIndex += 1;
      }
    };

    const sort = (left: number, right: number): void => {
      if (left >= right) {
        return;
      }

      const middle = Math.floor((left + right) / 2);
      sort(left, middle);
      sort(middle + 1, right);
      merge(left, middle, right);
    };

    sort(0, values.length - 1);
    steps.push({
      array: [...values],
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '归并排序完成。',
    });

    return steps;
  },
};
