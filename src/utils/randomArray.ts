export const createRandomArray = (size: number): number[] =>
  Array.from({ length: size }, () => Math.floor(Math.random() * 86) + 12);
