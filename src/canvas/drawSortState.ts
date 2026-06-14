import type { SortStep } from '../types/sorting';

const colorForBar = (index: number, step: SortStep, playbackOriginalIndex: number | null): string => {
  if (playbackOriginalIndex === step.array[index].originalIndex) {
    return '#a855f7';
  }
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

export const drawSortState = (
  canvas: HTMLCanvasElement,
  step: SortStep,
  playbackOriginalIndex: number | null,
): void => {
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
  const chartWidth = Math.max(width - padding * 2, 1);
  const chartHeight = Math.max(height - padding * 2, 1);
  const itemCount = Math.max(step.array.length, 1);
  const rawBarWidth = chartWidth / itemCount;
  const gap = rawBarWidth >= 4 ? Math.min(6, rawBarWidth * 0.18) : 0;
  const barWidth = Math.max((chartWidth - gap * (itemCount - 1)) / itemCount, 1);
  const maxValue = Math.max(...step.array.map((item) => item.value));

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

  step.array.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = padding + index * (barWidth + gap);
    const y = height - padding - barHeight;
    const radius = Math.max(0, Math.min(5, barWidth / 2, barHeight / 2));

    const isPlaybackBar = playbackOriginalIndex === item.originalIndex;

    context.fillStyle = colorForBar(index, step, playbackOriginalIndex);
    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, radius);
    context.fill();

    if (isPlaybackBar) {
      context.strokeStyle = '#581c87';
      context.lineWidth = Math.max(2, Math.min(5, barWidth * 0.18));
      context.stroke();
    }
  });
};
