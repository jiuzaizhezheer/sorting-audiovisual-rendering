import type { SortItem } from '../types/sorting';

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

const NOTE_SCALE = [0, 2, 4, 7, 9, 12, 14, 16];
const BASE_FREQUENCY = 220;

export type SegmentPlaybackHandlers = {
  onSegmentStart?: (originalIndex: number) => void;
  onPlaybackEnd?: () => void;
};

const toFrequency = (value: number, min: number, max: number): number => {
  const range = Math.max(max - min, 1);
  const normalized = (value - min) / range;
  const scaleIndex = Math.min(NOTE_SCALE.length - 1, Math.round(normalized * (NOTE_SCALE.length - 1)));
  return BASE_FREQUENCY * 2 ** (NOTE_SCALE[scaleIndex] / 12);
};

export class SortAudioEngine {
  private context: AudioContext | null = null;
  private customBuffer: AudioBuffer | null = null;
  private activeNodes: AudioScheduledSourceNode[] = [];
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

    const arrayBuffer = await file.arrayBuffer();
    this.customBuffer = await this.context.decodeAudioData(arrayBuffer);

    return {
      name: file.name,
      duration: this.customBuffer.duration,
    };
  }

  stop(): void {
    this.playbackToken += 1;
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // Already stopped nodes can be ignored.
      }
    });
    this.activeNodes = [];
  }

  async playItems(
    items: SortItem[],
    stepDurationMs: number,
    finalOrder: SortItem[],
    handlers: SegmentPlaybackHandlers = {},
  ): Promise<void> {
    const ready = await this.ensureReady();
    if (!ready || !this.context || items.length === 0) {
      return;
    }

    this.stop();

    if (this.customBuffer) {
      await this.playCustomSegments(items, finalOrder, handlers);
      return;
    }

    await this.playGeneratedTones(items, stepDurationMs, handlers);
  }

  private async playGeneratedTones(
    items: SortItem[],
    stepDurationMs: number,
    handlers: SegmentPlaybackHandlers,
  ): Promise<void> {
    if (!this.context) {
      return;
    }

    const token = this.playbackToken;
    const now = this.context.currentTime + 0.015;
    const values = items.map((item) => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate the duration of each individual trigger
    const noteDuration = Math.max(0.025, Math.min(0.09, stepDurationMs / items.length / 1000));
    // Provide a slightly longer decay tail for a more natural pluck sound
    const releaseTime = Math.max(0.15, noteDuration * 1.5);
    const totalPlaybackTime = (items.length - 1) * noteDuration + releaseTime;
    
    const masterGain = this.context.createGain();
    masterGain.gain.setValueAtTime(0.12, now);
    masterGain.connect(this.context.destination);

    items.forEach((item, index) => {
      const startTime = now + index * noteDuration;
      const endTime = startTime + releaseTime;
      const freq = toFrequency(item.value, min, max);

      // Base oscillator (Mallet-like tone)
      const osc1 = this.context!.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Overtone oscillator (Bell-like high harmonic)
      const osc2 = this.context!.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime); // One octave up

      // Envelope gain
      const envGain = this.context!.createGain();
      envGain.gain.setValueAtTime(0.0001, startTime);
      envGain.gain.exponentialRampToValueAtTime(1.0, startTime + 0.005); // Sharp attack
      envGain.gain.exponentialRampToValueAtTime(0.0001, endTime); // Natural decay tail

      // Mix levels
      const osc1Gain = this.context!.createGain();
      osc1Gain.gain.value = 1.0;
      const osc2Gain = this.context!.createGain();
      osc2Gain.gain.value = 0.2; // Keep overtone subtle

      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);
      osc1Gain.connect(envGain);
      osc2Gain.connect(envGain);
      envGain.connect(masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(endTime + 0.01);
      osc2.stop(endTime + 0.01);

      this.activeNodes.push(osc1, osc2);

      window.setTimeout(() => {
        if (token === this.playbackToken) {
          handlers.onSegmentStart?.(item.originalIndex);
        }
      }, Math.max(0, (startTime - this.context!.currentTime) * 1000));
    });

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, totalPlaybackTime * 1000 + 30);
    });

    if (token === this.playbackToken) {
      this.activeNodes = [];
      handlers.onPlaybackEnd?.();
    }

    masterGain.disconnect();
  }

  private async playCustomSegments(
    items: SortItem[],
    finalOrder: SortItem[],
    handlers: SegmentPlaybackHandlers,
  ): Promise<void> {
    if (!this.context || !this.customBuffer) {
      return;
    }

    const token = this.playbackToken;
    const now = this.context.currentTime + 0.015;
    const segmentDuration = this.customBuffer.duration / finalOrder.length;
    const segmentByOriginalIndex = new Map<number, { offset: number; duration: number }>();
    const masterGain = this.context.createGain();

    finalOrder.forEach((item, sortedIndex) => {
      segmentByOriginalIndex.set(item.originalIndex, {
        offset: sortedIndex * segmentDuration,
        duration: segmentDuration,
      });
    });

    masterGain.gain.setValueAtTime(0.95, now);
    masterGain.connect(this.context.destination);

    items.forEach((item, playIndex) => {
      const segment = segmentByOriginalIndex.get(item.originalIndex);
      if (!segment) {
        return;
      }

      const source = this.context!.createBufferSource();
      source.buffer = this.customBuffer;
      source.connect(masterGain);
      source.start(now + playIndex * segment.duration, segment.offset, segment.duration);
      this.activeNodes.push(source);
      window.setTimeout(() => {
        if (token === this.playbackToken) {
          handlers.onSegmentStart?.(item.originalIndex);
        }
      }, Math.max(0, (now + playIndex * segment.duration - this.context!.currentTime) * 1000));
    });

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, this.customBuffer!.duration * 1000 + 30);
    });

    if (token === this.playbackToken) {
      this.activeNodes = [];
      handlers.onPlaybackEnd?.();
    }

    masterGain.disconnect();
  }
}
