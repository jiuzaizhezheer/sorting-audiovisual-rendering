import type { SortAlgorithm } from '../types/sorting';

export const insertionSort: SortAlgorithm = {
  id: 'insertion',
  name: '插入排序',
  summary: '把当前元素插入到左侧已经有序的区间中。',
  bestFor: '适合展示局部有序数据的处理方式，数组接近有序时效率较高。',
  complexity: {
    time: 'O(n^2)，接近有序时可接近 O(n)',
    space: 'O(1)',
  },
  *createRunner(values) {
    const sorted = new Set<number>([0]);

    yield {
      activeIndices: [0],
      audioIndices: [0],
      sortedIndices: [...sorted],
      phase: 'done',
      note: '第 1 个元素单独构成有序区间。',
    };

    for (let index = 1; index < values.length; index += 1) {
      const current = values[index];
      let scanIndex = index - 1;

      yield {
        activeIndices: [index],
        audioIndices: [index],
        sortedIndices: [...sorted],
        phase: 'partitioning',
        note: `取出第 ${index + 1} 个元素 ${current.value}，准备插入左侧有序区间。`,
      };

      while (scanIndex >= 0 && values[scanIndex].value > current.value) {
        yield {
          activeIndices: [scanIndex, scanIndex + 1],
          audioIndices: [scanIndex, scanIndex + 1],
          sortedIndices: [...sorted],
          phase: 'comparing',
          note: `${values[scanIndex].value} 大于 ${current.value}，需要右移。`,
        };

        values[scanIndex + 1] = values[scanIndex];
        yield {
          activeIndices: [scanIndex, scanIndex + 1],
          audioIndices: [scanIndex + 1],
          sortedIndices: [...sorted],
          phase: 'overwriting',
          note: `把 ${values[scanIndex + 1].value} 右移一格。`,
        };
        scanIndex -= 1;
      }

      values[scanIndex + 1] = current;
      sorted.add(index);
      yield {
        activeIndices: [scanIndex + 1],
        audioIndices: [scanIndex + 1],
        sortedIndices: [...Array.from({ length: index + 1 }, (_, position) => position)],
        phase: 'overwriting',
        note: `把 ${current.value} 插入到第 ${scanIndex + 2} 个位置。`,
      };
    }

    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '插入排序完成。',
    };
  },
};
