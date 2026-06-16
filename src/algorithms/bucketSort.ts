import type { SortAlgorithm, SortItem } from '../types/sorting';

const sortBucket = (items: SortItem[]): SortItem[] => {
  const sorted = [...items];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    let scanIndex = index - 1;

    while (scanIndex >= 0 && sorted[scanIndex].value > current.value) {
      sorted[scanIndex + 1] = sorted[scanIndex];
      scanIndex -= 1;
    }

    sorted[scanIndex + 1] = current;
  }

  return sorted;
};

export const bucketSort: SortAlgorithm = {
  id: 'bucket',
  name: '桶排序',
  summary: '把数值分配到多个桶中，分别排序后再按桶顺序合并。',
  bestFor: '适合数据分布较均匀的场景，可展示“分散后局部排序”的思想。',
  complexity: {
    time: '平均 O(n + k)，桶内退化时可到 O(n^2)',
    space: 'O(n + k)',
  },
  *createRunner(values) {
    const minValue = Math.min(...values.map((item) => item.value));
    const maxValue = Math.max(...values.map((item) => item.value));
    const bucketCount = Math.max(4, Math.ceil(Math.sqrt(values.length)));
    const bucketSize = Math.max(1, Math.ceil((maxValue - minValue + 1) / bucketCount));
    const buckets = Array.from({ length: bucketCount }, () => [] as SortItem[]);

    for (let index = 0; index < values.length; index += 1) {
      const item = values[index];
      const bucketIndex = Math.min(bucketCount - 1, Math.floor((item.value - minValue) / bucketSize));
      buckets[bucketIndex].push(item);
      yield {
        activeIndices: [index],
        audioIndices: [index],
        phase: 'partitioning',
        note: `把值 ${item.value} 放入第 ${bucketIndex + 1} 个桶。`,
      };
    }

    let writeIndex = 0;

    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
      const sortedBucket = sortBucket(buckets[bucketIndex]);

      for (const item of sortedBucket) {
        values[writeIndex] = item;
        yield {
          activeIndices: [writeIndex],
          audioIndices: [writeIndex],
          sortedIndices: Array.from({ length: writeIndex + 1 }, (_, index) => index),
          phase: 'overwriting',
          note: `合并第 ${bucketIndex + 1} 个桶中的值 ${item.value}。`,
        };
        writeIndex += 1;
      }
    }

    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '桶排序完成。',
    };
  },
};
