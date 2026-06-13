import type { SortStep } from '../types/sorting';

const colorForBar = (index: number, step: SortStep): string => {
  if (step.sortedIndices?.includes(index)) {
    return '#16a34a';
  }
  if (step.pivotIndex === index) {
    return '#f59e0b';
  }
  if (step.activeIndices?.includes(index)) {
    if (step.phase === 'swapping') {
      return '#dc2626';
    }
    if (step.phase === 'overwriting') {
      return '#2563eb';
    }
    return '#0891b2';
  }
  return '#475569';
};

export const drawSortState = (canvas: HTMLCanvasElement, step: SortStep): void => {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const pixelRatio = window.devicePixelRatio || 1;
  const { clientWidth, clientHeight } = canvas;
  const width = Math.max(clientWidth, 1);
  const height = Math.max(clientHeight, 1);

  if (canvas.width !== Math.floor(width * pixelRatio)) {
    canvas.width = Math.floor(width * pixelRatio);
  }
  if (canvas.height !== Math.floor(height * pixelRatio)) {
    canvas.height = Math.floor(height * pixelRatio);
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const gap = Math.max(2, Math.min(6, chartWidth / step.array.length / 5));
  const barWidth = (chartWidth - gap * (step.array.length - 1)) / step.array.length;
  const maxValue = Math.max(...step.array);

  context.fillStyle = '#f8fafc';
  context.fillRect(0, 0, width, height);

  context.strokeStyle = '#e2e8f0';
  context.lineWidth = 1;
  for (let line = 0; line <= 4; line += 1) {
    const y = padding + (chartHeight / 4) * line;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  step.array.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding + index * (barWidth + gap);
    const y = height - padding - barHeight;
    const radius = Math.min(5, barWidth / 2);

    context.fillStyle = colorForBar(index, step);
    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, radius);
    context.fill();
  });
};
