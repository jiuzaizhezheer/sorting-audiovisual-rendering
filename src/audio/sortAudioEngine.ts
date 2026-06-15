import type { SortItem } from '../types/sorting';

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export type SegmentPlaybackHandlers = {
  onSegmentStart?: (originalIndex: number) => void;
  onPlaybackEnd?: () => void;
};

export class SortAudioEngine {
  private context: AudioContext | null = null;
  private customBuffer: AudioBuffer | null = null;
  private activeNodes: AudioScheduledSourceNode[] = [];
  private segmentTimers: number[] = [];
  private playbackToken = 0;

  async ensureReady(): Promise<boolean> {
    const AudioContextConstructor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

    if (!AudioContextConstructor) {
      return false;
    }

    if (!this.context) {
      this.context = new AudioContextConstructor();
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    return this.context.state === 'running';
  }

  async loadAudioFile(file: File): Promise<{ name: string; duration: number }> {
    const ready = await this.ensureReady();
    if (!ready || !this.context) {
      throw new Error('当前浏览器不支持 Web Audio API。');
    }

    this.customBuffer = null;
    const arrayBuffer = await file.arrayBuffer();
    this.customBuffer = await this.context.decodeAudioData(arrayBuffer);

    return {
      name: file.name,
      duration: this.customBuffer.duration,
    };
  }

  stop(): void {
    this.playbackToken += 1;
    this.segmentTimers.forEach((id) => window.clearTimeout(id));
    this.segmentTimers = [];
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Already stopped nodes can be ignored.
      }
    });
    this.activeNodes = [];
  }

  destroy(): void {
    this.stop();
    if (this.context) {
      this.context.close().catch(() => {
        // Context may already be closed.
      });
      this.context = null;
    }
    this.customBuffer = null;
  }

  async playItems(
    items: SortItem[],
    finalOrder: SortItem[],
    handlers: SegmentPlaybackHandlers = {},
  ): Promise<void> {
    const ready = await this.ensureReady();
    if (!ready || !this.context || items.length === 0) {
      return;
    }

    this.stop();

    if (!this.customBuffer) {
      return;
    }

    await this.playCustomSegments(items, finalOrder, handlers);
  }

  private async playCustomSegments(
    items: SortItem[],
    finalOrder: SortItem[],
    handlers: SegmentPlaybackHandlers,
  ): Promise<void> {
    if (!this.context || !this.customBuffer) {
      return;
    }

    const ctx = this.context;
    const buffer = this.customBuffer;
    const token = this.playbackToken;
    const now = ctx.currentTime + 0.015;
    const segmentDuration = buffer.duration / finalOrder.length;
    const segmentByOriginalIndex = new Map<number, { offset: number; duration: number }>();
    const masterGain = ctx.createGain();

    finalOrder.forEach((item, sortedIndex) => {
      segmentByOriginalIndex.set(item.originalIndex, {
        offset: sortedIndex * segmentDuration,
        duration: segmentDuration,
      });
    });

    masterGain.gain.setValueAtTime(0.95, now);
    masterGain.connect(ctx.destination);

    items.forEach((item, playIndex) => {
      const segment = segmentByOriginalIndex.get(item.originalIndex);
      if (!segment) {
        return;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.setValueAtTime(1, now);
      source.connect(masterGain);
      source.start(now + playIndex * segmentDuration, segment.offset, segment.duration);
      this.activeNodes.push(source);

      const delay = Math.max(0, (now + playIndex * segmentDuration - ctx.currentTime) * 1000);
      const timerId = window.setTimeout(() => {
        if (token === this.playbackToken) {
          handlers.onSegmentStart?.(item.originalIndex);
        }
      }, delay);
      this.segmentTimers.push(timerId);
    });

    await new Promise<void>((resolve) => {
      window.setTimeout(() => {
        if (token === this.playbackToken) {
          this.activeNodes = [];
          handlers.onPlaybackEnd?.();
        }
        resolve();
      }, items.length * segmentDuration * 1000 + 30);
    });

    masterGain.disconnect();
  }
}
