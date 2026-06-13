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
  createSteps(input) {
    const values = [...input];
    const steps: SortStep[] = [
      {
        array: [...values],
        phase: 'idle',
        note: '初始数组已生成，准备选择分区基准。',
      },
    ];

    const partition = (left: number, right: number): number => {
      const pivotValue = values[right];
      let storeIndex = left;

      steps.push({
        array: [...values],
        activeIndices: [left, right],
        pivotIndex: right,
        phase: 'partitioning',
        note: `选择第 ${right + 1} 个元素 ${pivotValue} 作为基准。`,
      });

      for (let index = left; index < right; index += 1) {
        steps.push({
          array: [...values],
          activeIndices: [index, storeIndex],
          pivotIndex: right,
          phase: 'comparing',
          note: `比较 ${values[index]} 与基准 ${pivotValue}。`,
        });

        if (values[index] < pivotValue) {
          [values[index], values[storeIndex]] = [values[storeIndex], values[index]];
          steps.push({
            array: [...values],
            activeIndices: [index, storeIndex],
            pivotIndex: right,
            phase: 'swapping',
            note: '当前值小于基准，移动到左侧分区。',
          });
          storeIndex += 1;
        }
      }

      [values[storeIndex], values[right]] = [values[right], values[storeIndex]];
      steps.push({
        array: [...values],
        activeIndices: [storeIndex, right],
        pivotIndex: storeIndex,
        phase: 'swapping',
        note: `基准归位到第 ${storeIndex + 1} 个位置。`,
      });

      return storeIndex;
    };

    const sort = (left: number, right: number): void => {
      if (left >= right) {
        return;
      }

      const pivotIndex = partition(left, right);
      sort(left, pivotIndex - 1);
      sort(pivotIndex + 1, right);
    };

    sort(0, values.length - 1);
    steps.push({
      array: [...values],
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '快速排序完成。',
    });

    return steps;
  },
};
