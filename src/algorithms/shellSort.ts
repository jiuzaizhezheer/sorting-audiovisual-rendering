import type { SortAlgorithm } from '../types/sorting';

export const shellSort: SortAlgorithm = {
  id: 'shell',
  name: '希尔排序',
  summary: '先按较大间隔做分组插入排序，再逐步缩小间隔直到 1。',
  bestFor: '适合理解插入排序的改进思路，能让元素先进行长距离移动。',
  complexity: {
    time: '通常介于 O(n log n) 与 O(n^2) 之间，取决于间隔序列',
    space: 'O(1)',
  },
  *createRunner(values) {
    for (let gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
      yield {
        activeIndices: Array.from({ length: Math.ceil(values.length / gap) }, (_, index) => index * gap).filter(
          (index) => index < values.length,
        ),
        phase: 'partitioning',
        note: `当前间隔为 ${gap}，对间隔子序列做插入排序。`,
      };

      for (let index = gap; index < values.length; index += 1) {
        const current = values[index];
        let scanIndex = index;

        yield {
          activeIndices: [index, index - gap],
          audioIndices: [index, index - gap],
          phase: 'comparing',
          note: `比较第 ${index + 1} 个元素与前方间隔 ${gap} 的元素。`,
        };

        while (scanIndex >= gap && values[scanIndex - gap].value > current.value) {
          values[scanIndex] = values[scanIndex - gap];
          yield {
            activeIndices: [scanIndex - gap, scanIndex],
            audioIndices: [scanIndex],
            phase: 'overwriting',
            note: `把 ${values[scanIndex].value} 沿间隔 ${gap} 右移。`,
          };
          scanIndex -= gap;
        }

        values[scanIndex] = current;
        yield {
          activeIndices: [scanIndex],
          audioIndices: [scanIndex],
          phase: 'overwriting',
          note: `把 ${current.value} 放入当前间隔子序列中的正确位置。`,
        };
      }
    }

    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '希尔排序完成。',
    };
  },
};
