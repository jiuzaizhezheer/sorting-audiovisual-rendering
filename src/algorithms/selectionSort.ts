import type { SortAlgorithm } from '../types/sorting';

export const selectionSort: SortAlgorithm = {
  id: 'selection',
  name: '选择排序',
  summary: '每一轮从未排序区间中找出最小值，并放到当前起始位置。',
  bestFor: '适合理解“选择最优元素”的排序思路，交换次数少但比较次数固定较多。',
  complexity: {
    time: 'O(n^2)',
    space: 'O(1)',
  },
  *createRunner(values) {
    const sorted = new Set<number>();

    for (let start = 0; start < values.length - 1; start += 1) {
      let minIndex = start;

      yield {
        activeIndices: [start],
        audioIndices: [start],
        sortedIndices: [...sorted],
        phase: 'partitioning',
        note: `从第 ${start + 1} 个位置开始寻找最小值。`,
      };

      for (let index = start + 1; index < values.length; index += 1) {
        yield {
          activeIndices: [minIndex, index],
          audioIndices: [minIndex, index],
          sortedIndices: [...sorted],
          phase: 'comparing',
          note: `比较当前最小值 ${values[minIndex].value} 和候选值 ${values[index].value}。`,
        };

        if (values[index].value < values[minIndex].value) {
          minIndex = index;
          yield {
            activeIndices: [minIndex],
            audioIndices: [minIndex],
            sortedIndices: [...sorted],
            phase: 'partitioning',
            note: `找到新的最小值 ${values[minIndex].value}。`,
          };
        }
      }

      if (minIndex !== start) {
        [values[start], values[minIndex]] = [values[minIndex], values[start]];
        yield {
          activeIndices: [start, minIndex],
          audioIndices: [start, minIndex],
          sortedIndices: [...sorted],
          phase: 'swapping',
          note: `把最小值交换到第 ${start + 1} 个位置。`,
        };
      }

      sorted.add(start);
      yield {
        activeIndices: [start],
        audioIndices: [start],
        sortedIndices: [...sorted],
        phase: 'done',
        note: `第 ${start + 1} 个位置已经就位。`,
      };
    }

    sorted.add(values.length - 1);
    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '选择排序完成。',
    };
  },
};
