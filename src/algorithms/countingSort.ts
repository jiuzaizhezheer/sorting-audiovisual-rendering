import type { SortAlgorithm, SortItem } from '../types/sorting';

export const countingSort: SortAlgorithm = {
  id: 'counting',
  name: '计数排序',
  summary: '统计每个数值出现次数，再按数值顺序写回数组。',
  bestFor: '适合取值范围较小的整数，本项目随机值范围较窄，演示效果直观。',
  complexity: {
    time: 'O(n + k)',
    space: 'O(n + k)',
  },
  *createRunner(values) {
    const buckets = new Map<number, SortItem[]>();

    for (let index = 0; index < values.length; index += 1) {
      const item = values[index];
      const bucket = buckets.get(item.value) ?? [];
      bucket.push(item);
      buckets.set(item.value, bucket);
      yield {
        activeIndices: [index],
        audioIndices: [index],
        phase: 'partitioning',
        note: `统计值 ${item.value} 的出现次数。`,
      };
    }

    const sortedValues = [...buckets.keys()].sort((a, b) => a - b);
    let writeIndex = 0;

    for (const value of sortedValues) {
      const items = buckets.get(value) ?? [];

      for (const item of items) {
        values[writeIndex] = item;
        yield {
          activeIndices: [writeIndex],
          audioIndices: [writeIndex],
          sortedIndices: Array.from({ length: writeIndex + 1 }, (_, index) => index),
          phase: 'overwriting',
          note: `按计数结果写回值 ${value}。`,
        };
        writeIndex += 1;
      }
    }

    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '计数排序完成。',
    };
  },
};
