import type { SortAlgorithm, SortStep } from '../types/sorting';

export const heapSort: SortAlgorithm = {
  id: 'heap',
  name: '堆排序',
  summary: '先建立最大堆，再反复把堆顶最大值交换到数组末尾。',
  bestFor: '适合理解二叉堆和原地排序，时间复杂度稳定但不稳定排序。',
  complexity: {
    time: 'O(n log n)',
    space: 'O(1)',
  },
  *createRunner(values) {
    const sorted = new Set<number>();

    function* heapify(heapSize: number, root: number): Generator<SortStep, void, void> {
      let largest = root;
      const left = root * 2 + 1;
      const right = root * 2 + 2;

      if (left < heapSize) {
        yield {
          activeIndices: [largest, left],
          audioIndices: [largest, left],
          sortedIndices: [...sorted],
          phase: 'comparing',
          note: `比较父节点 ${values[largest].value} 与左子节点 ${values[left].value}。`,
        };

        if (values[left].value > values[largest].value) {
          largest = left;
        }
      }

      if (right < heapSize) {
        yield {
          activeIndices: [largest, right],
          audioIndices: [largest, right],
          sortedIndices: [...sorted],
          phase: 'comparing',
          note: `比较当前较大节点 ${values[largest].value} 与右子节点 ${values[right].value}。`,
        };

        if (values[right].value > values[largest].value) {
          largest = right;
        }
      }

      if (largest !== root) {
        [values[root], values[largest]] = [values[largest], values[root]];
        yield {
          activeIndices: [root, largest],
          audioIndices: [root, largest],
          sortedIndices: [...sorted],
          phase: 'swapping',
          note: '子节点更大，交换后继续向下调整堆。',
        };
        yield* heapify(heapSize, largest);
      }
    }

    for (let index = Math.floor(values.length / 2) - 1; index >= 0; index -= 1) {
      yield {
        activeIndices: [index],
        audioIndices: [index],
        sortedIndices: [...sorted],
        phase: 'partitioning',
        note: `从第 ${index + 1} 个父节点开始调整最大堆。`,
      };
      yield* heapify(values.length, index);
    }

    for (let end = values.length - 1; end > 0; end -= 1) {
      [values[0], values[end]] = [values[end], values[0]];
      sorted.add(end);
      yield {
        activeIndices: [0, end],
        audioIndices: [0, end],
        sortedIndices: [...sorted],
        phase: 'swapping',
        note: `把当前最大值交换到第 ${end + 1} 个位置。`,
      };
      yield* heapify(end, 0);
    }

    sorted.add(0);
    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '堆排序完成。',
    };
  },
};
