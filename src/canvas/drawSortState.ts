import type { SortItem, SortStep } from '../types/sorting';
import type { Theme } from '../hooks/useTheme';

const colorForBar = (
  item: SortItem,
  index: number,
  step: SortStep,
  playbackOriginalIndex: number | null,
): string => {
  if (playbackOriginalIndex === item.originalIndex) {
    return '#9333ea';
  }
  if (step.pivotIndex === index) {
    return '#f97316';
  }
  if (step.activeIndices?.includes(index)) {
    if (step.phase === 'done') {
      return '#15803d';
    }
    if (step.phase === 'swapping') {
      return '#e11d48';
    }
    if (step.phase === 'overwriting') {
      return '#1d4ed8';
    }
    return '#0891b2';
  }
  if (step.sortedIndices?.includes(index)) {
    return '#15803d';
  }
  return '#64748b';
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void => {
  if (typeof CanvasRenderingContext2D.prototype.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }

  // Fallback for browsers that don't support roundRect (e.g. older Safari).
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

export const drawSortState = (
  canvas: HTMLCanvasElement,
  values: SortItem[],
  step: SortStep,
  playbackOriginalIndex: number | null,
  scaleMaxValue: number,
  viewportWidth: number,
  viewportHeight: number,
  theme: Theme,
): void => {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(viewportWidth, 1);
  const height = Math.max(viewportHeight, 1);

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
  const itemCount = Math.max(values.length, 1);
  const rawBarWidth = chartWidth / itemCount;
  const gap = rawBarWidth >= 4 ? Math.min(6, rawBarWidth * 0.18) : 0;
  const barWidth = Math.max((chartWidth - gap * (itemCount - 1)) / itemCount, 1);
  const maxValue = Math.max(scaleMaxValue, 1);

  const isDark = theme === 'dark';
  context.fillStyle = isDark ? '#020617' : '#f8fafc';
  context.fillRect(0, 0, width, height);

  context.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
  context.lineWidth = 1;
  for (let line = 0; line <= 4; line += 1) {
    const y = padding + (chartHeight / 4) * line;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  values.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = padding + index * (barWidth + gap);
    const y = height - padding - barHeight;
    const radius = Math.max(0, Math.min(5, barWidth / 2, barHeight / 2));

    const isPlaybackBar = playbackOriginalIndex === item.originalIndex;

    context.fillStyle = colorForBar(item, index, step, playbackOriginalIndex);
    context.beginPath();
    drawRoundRect(context, x, y, barWidth, barHeight, radius);
    context.fill();

    if (isPlaybackBar) {
      context.strokeStyle = '#4c1d95';
      context.lineWidth = Math.max(2, Math.min(5, barWidth * 0.18));
      context.stroke();
    }
  });
};
