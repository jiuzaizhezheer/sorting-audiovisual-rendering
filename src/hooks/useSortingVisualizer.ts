import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { algorithmMap } from '../algorithms/registry';
import { SortAudioEngine } from '../audio/sortAudioEngine';
import { createInitialSortState, sortReducer } from '../state/sortReducer';
import type { SortAlgorithmId, SortItem, SortStep } from '../types/sorting';
import { createRandomArray } from '../utils/randomArray';

export const NO_AUDIO_SIZE_OPTIONS = [200, 400, 600, 800] as const;
export const AUDIO_SIZE_OPTIONS = [25, 50, 75, 100] as const;

const NO_AUDIO_STEP_INTERVAL_MS = 1;
const SILENT_AUDIO_STEP_INTERVAL_MS = 200;

const getStepAudioItems = (array: SortItem[], audioIndices: number[] | undefined): SortItem[] => {
  if (!audioIndices?.length) {
    return [];
  }

  return [...new Set(audioIndices)]
    .map((index) => array[index])
    .filter((item): item is SortItem => item !== undefined);
};

const createFinalOrder = (values: SortItem[]): SortItem[] => [...values].sort((a, b) => a.value - b.value);
const getMaxValue = (values: SortItem[]): number => Math.max(...values.map((item) => item.value), 1);

export const useSortingVisualizer = () => {
  const [state, dispatch] = useReducer(sortReducer, undefined, createInitialSortState);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioFileStatus, setAudioFileStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const [playbackOriginalIndex, setPlaybackOriginalIndex] = useState<number | null>(null);
  const [isFullPlayback, setIsFullPlayback] = useState(false);
  const audioEngineRef = useRef<SortAudioEngine | null>(null);
  const runnerRef = useRef<Generator<SortStep, SortStep, void> | null>(null);
  const runnerValuesRef = useRef<SortItem[]>([]);
  const initialValuesRef = useRef<SortItem[]>(state.values);
  const finalOrderRef = useRef<SortItem[]>(createFinalOrder(state.values));
  const scaleMaxValueRef = useRef(getMaxValue(state.values));
  const hasUploadedAudio = audioFileStatus === 'ready';

  const resetRunner = useCallback((algorithmId: SortAlgorithmId, values: SortItem[]) => {
    initialValuesRef.current = values;
    runnerValuesRef.current = [...values];
    finalOrderRef.current = createFinalOrder(values);
    scaleMaxValueRef.current = getMaxValue(values);
    runnerRef.current = algorithmMap[algorithmId].createRunner(runnerValuesRef.current);
    audioEngineRef.current?.stop();
    setPlaybackOriginalIndex(null);
  }, []);

  const resetToValues = useCallback(
    (algorithmId: SortAlgorithmId, values: SortItem[], size?: number) => {
      resetRunner(algorithmId, values);
      dispatch({ type: 'resetValues', values: [...values], size });
    },
    [resetRunner],
  );

  const togglePlayback = useCallback(() => {
    dispatch({ type: 'togglePlayback' });
  }, []);

  const selectAlgorithm = useCallback(
    (algorithmId: SortAlgorithmId) => {
      resetRunner(algorithmId, initialValuesRef.current);
      dispatch({ type: 'selectAlgorithm', algorithmId });
    },
    [resetRunner],
  );

  const reset = useCallback(() => {
    resetToValues(state.algorithmId, initialValuesRef.current);
  }, [resetToValues, state.algorithmId]);

  const generate = useCallback(() => {
    resetToValues(state.algorithmId, createRandomArray(state.size));
  }, [resetToValues, state.algorithmId, state.size]);

  const changeSize = useCallback(
    (size: number) => {
      resetToValues(state.algorithmId, createRandomArray(size), size);
    },
    [resetToValues, state.algorithmId],
  );

  const loadAudioFile = useCallback(
    (file: File) => {
      audioEngineRef.current ??= new SortAudioEngine();
      setIsAudioLoading(true);
      setAudioFileStatus('idle');
      audioEngineRef.current
        .loadAudioFile(file)
        .then((audioFile) => {
          setAudioFileName(`${audioFile.name} (${audioFile.duration.toFixed(1)}s)`);
          setAudioFileStatus('ready');
          resetToValues(state.algorithmId, createRandomArray(AUDIO_SIZE_OPTIONS[0]), AUDIO_SIZE_OPTIONS[0]);
        })
        .catch((error: unknown) => {
          setAudioFileName(error instanceof Error ? error.message : '音频解码失败');
          setAudioFileStatus('error');
          resetToValues(state.algorithmId, createRandomArray(NO_AUDIO_SIZE_OPTIONS[0]), NO_AUDIO_SIZE_OPTIONS[0]);
        })
        .finally(() => {
          setIsAudioLoading(false);
        });
    },
    [resetToValues, state.algorithmId],
  );

  useEffect(() => {
    return () => {
      audioEngineRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!state.isDone || !hasUploadedAudio) {
      return;
    }

    let cancelled = false;
    const sortedValues = finalOrderRef.current;

    const playFullPass = async () => {
      setIsFullPlayback(true);
      audioEngineRef.current ??= new SortAudioEngine();
      await audioEngineRef.current.playItems(sortedValues, sortedValues, {
        onSegmentStart: setPlaybackOriginalIndex,
        onPlaybackEnd: () => setPlaybackOriginalIndex(null),
      });
      if (!cancelled) {
        setPlaybackOriginalIndex(null);
        setIsFullPlayback(false);
      }
    };

    void playFullPass();

    return () => {
      cancelled = true;
      audioEngineRef.current?.stop();
      setPlaybackOriginalIndex(null);
      setIsFullPlayback(false);
    };
  }, [hasUploadedAudio, state.isDone]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (hasUploadedAudio) {
        audioEngineRef.current?.stop();
      }
      setPlaybackOriginalIndex(null);
      return;
    }

    let cancelled = false;

    const runPlayback = async () => {
      if (!runnerRef.current) {
        resetRunner(state.algorithmId, state.values);
      }

      while (!cancelled) {
        const result = runnerRef.current!.next();

        if (hasUploadedAudio) {
          const nextStep = result.value;

          dispatch({
            type: 'applyStep',
            values: [...runnerValuesRef.current],
            step: nextStep,
            isDone: Boolean(result.done),
          });

          if (result.done) {
            return;
          }

          const audioItems = getStepAudioItems(runnerValuesRef.current, nextStep.audioIndices);

          if (audioItems.length > 0) {
            audioEngineRef.current ??= new SortAudioEngine();
            await audioEngineRef.current.playItems(audioItems, finalOrderRef.current, {
              onSegmentStart: setPlaybackOriginalIndex,
              onPlaybackEnd: () => setPlaybackOriginalIndex(null),
            });
          } else {
            await new Promise<void>((resolve) => {
              window.setTimeout(resolve, SILENT_AUDIO_STEP_INTERVAL_MS);
            });
          }
        } else {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, NO_AUDIO_STEP_INTERVAL_MS);
          });

          if (cancelled) {
            return;
          }

          dispatch({
            type: 'applyStep',
            values: [...runnerValuesRef.current],
            step: result.value,
            isDone: Boolean(result.done),
          });

          if (result.done) {
            return;
          }
        }
      }
    };

    void runPlayback();

    return () => {
      cancelled = true;
      if (hasUploadedAudio) {
        audioEngineRef.current?.stop();
      }
      setPlaybackOriginalIndex(null);
    };
  }, [hasUploadedAudio, resetRunner, state.algorithmId, state.isPlaying]);

  return {
    state,
    currentAlgorithm: algorithmMap[state.algorithmId],
    playbackOriginalIndex,
    scaleMaxValue: scaleMaxValueRef.current,
    isFullPlayback,
    audioFileName,
    isAudioLoading,
    audioFileStatus,
    sizeOptions: hasUploadedAudio ? AUDIO_SIZE_OPTIONS : NO_AUDIO_SIZE_OPTIONS,
    selectAlgorithm,
    togglePlayback,
    loadAudioFile,
    reset,
    generate,
    changeSize,
  };
};
