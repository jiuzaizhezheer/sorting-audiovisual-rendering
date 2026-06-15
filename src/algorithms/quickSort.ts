import type { SortAlgorithm, SortStep } from '../types/sorting';

export const quickSort: SortAlgorithm = {
  id: 'quick',
  name: '快速排序',
  summary: '选取基准值，把小于基准的元素移动到左侧，再递归处理两边。',
  bestFor: '平均性能好，适合展示分区思想；基准选择不佳时会退化。',
  complexity: {
    time: '平均 O(n log n)，最坏 O(n^2)',
    space: 'O(log n)',
  },
  *createRunner(values) {
    const sorted = new Set<number>();

    function* partition(left: number, right: number): Generator<SortStep, number, void> {
      const pivotValue = values[right].value;
      let storeIndex = left;

      yield {
        activeIndices: [left, right],
        audioIndices: [right],
        sortedIndices: [...sorted],
        pivotIndex: right,
        phase: 'partitioning',
        note: `选择第 ${right + 1} 个元素 ${pivotValue} 作为基准。`,
      };

      for (let index = left; index < right; index += 1) {
        yield {
          activeIndices: [index, storeIndex],
          audioIndices: [index, right],
          sortedIndices: [...sorted],
          pivotIndex: right,
          phase: 'comparing',
          note: `比较 ${values[index].value} 与基准 ${pivotValue}。`,
        };

        if (values[index].value < pivotValue) {
          [values[index], values[storeIndex]] = [values[storeIndex], values[index]];
          yield {
            activeIndices: [index, storeIndex],
            audioIndices: [index, storeIndex],
            sortedIndices: [...sorted],
            pivotIndex: right,
            phase: 'swapping',
            note: '当前值小于基准，移动到左侧分区。',
          };
          storeIndex += 1;
        }
      }

      [values[storeIndex], values[right]] = [values[right], values[storeIndex]];
      sorted.add(storeIndex);
      yield {
        activeIndices: [storeIndex, right],
        audioIndices: [storeIndex, right],
        sortedIndices: [...sorted],
        pivotIndex: storeIndex,
        phase: 'swapping',
        note: `基准归位到第 ${storeIndex + 1} 个位置，本轮分区结束。`,
      };

      return storeIndex;
    }

    function* sort(left: number, right: number): Generator<SortStep, void, void> {
      if (left > right) {
        return;
      }

      if (left === right) {
        sorted.add(left);
        return;
      }

      const pivotIndex = yield* partition(left, right);
      yield* sort(left, pivotIndex - 1);
      yield* sort(pivotIndex + 1, right);
    }

    yield* sort(0, values.length - 1);
    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '快速排序完成。',
    };
  },
};
