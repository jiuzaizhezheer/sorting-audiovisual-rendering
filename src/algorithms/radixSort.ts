import type { SortAlgorithm, SortItem } from '../types/sorting';

export const radixSort: SortAlgorithm = {
  id: 'radix',
  name: '基数排序',
  summary: '从低位到高位依次按数字位分桶，保持每一轮分桶的稳定顺序。',
  bestFor: '适合非负整数或可转成定长键的数据，本项目数值均为正整数。',
  complexity: {
    time: 'O(d(n + b))',
    space: 'O(n + b)',
  },
  *createRunner(values) {
    const maxValue = Math.max(...values.map((item) => item.value));

    for (let place = 1; Math.floor(maxValue / place) > 0; place *= 10) {
      const buckets = Array.from({ length: 10 }, () => [] as SortItem[]);

      for (let index = 0; index < values.length; index += 1) {
        const item = values[index];
        const digit = Math.floor(item.value / place) % 10;
        buckets[digit].push(item);
        yield {
          activeIndices: [index],
          audioIndices: [index],
          phase: 'partitioning',
          note: `按 ${place === 1 ? '个位' : '十位'} 数字 ${digit} 放入桶。`,
        };
      }

      let writeIndex = 0;
      for (let digit = 0; digit < buckets.length; digit += 1) {
        for (const item of buckets[digit]) {
          values[writeIndex] = item;
          yield {
            activeIndices: [writeIndex],
            audioIndices: [writeIndex],
            phase: 'overwriting',
            note: `按数字 ${digit} 的桶顺序写回值 ${item.value}。`,
          };
          writeIndex += 1;
        }
      }
    }

    return {
      sortedIndices: [...values.keys()],
      phase: 'done',
      note: '基数排序完成。',
    };
  },
};
