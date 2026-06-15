import type { SortAlgorithm } from '../types/sorting';

export const bubbleSort: SortAlgorithm = {
  id: 'bubble',
  name: '冒泡排序',
  summary: '重复比较相邻元素，把较大的值逐步推到右侧。',
  bestFor: '适合理解相邻交换和稳定排序，不适合大规模数据。',
  complexity: {
    time: 'O(n^2)',
    space: 'O(1)',
  },
  *createRunner(values) {
    const sorted = new Set<number>();

    for (let end = values.length - 1; end > 0; end -= 1) {
      for (let index = 0; index < end; index += 1) {
        yield {
          activeIndices: [index, index + 1],
          audioIndices: [index, index + 1],
          sortedIndices: [...sorted],
          phase: 'comparing',
          note: `比较第 ${index + 1} 和第 ${index + 2} 个元素。`,
        };

        if (values[index].value > values[index + 1].value) {
          [values[index], values[index + 1]] = [values[index + 1], values[index]];
          yield {
            activeIndices: [index, index + 1],
            audioIndices: [index, index + 1],
            sortedIndices: [...sorted],
            phase: 'swapping',
            note: '左侧元素更大，交换这两个值。',
          };
        }
      }

      sorted.add(end);
      yield {
        sortedIndices: [...sorted],
        phase: 'done',
        note: `第 ${end + 1} 个位置已经就位，本轮比较结束。`,
      };
    }

    sorted.add(0);
    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '冒泡排序完成。',
    };
  },
};
