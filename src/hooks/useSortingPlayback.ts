import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch } from 'react';
import { algorithmMap } from '../algorithms/registry';
import type { SortAction, SortState } from '../state/sortReducer';
import type { SortAlgorithmId, SortItem, SortStep } from '../types/sorting';
import { AUDIO_SIZE_OPTIONS, NO_AUDIO_SIZE_OPTIONS } from './sortingVisualizerConfig';
import { useSortAudio } from './useSortAudio';

const NO_AUDIO_BATCH_INTERVAL_MS = 1;
const NO_AUDIO_BATCH_BUDGET_MS = 8;
const SILENT_AUDIO_STEP_INTERVAL_MS = 200;

const wait = (duration: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

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

type UseSortingPlaybackOptions = {
  state: SortState;
  dispatch: Dispatch<SortAction>;
};

export const useSortingPlayback = ({ state, dispatch }: UseSortingPlaybackOptions) => {
  const runnerRef = useRef<Generator<SortStep, SortStep, void> | null>(null);
  const runnerValuesRef = useRef<SortItem[]>([]);
  const initialValuesRef = useRef<SortItem[]>(state.values);
  const finalOrderRef = useRef<SortItem[]>(createFinalOrder(state.values));
  const scaleMaxValueRef = useRef(getMaxValue(state.values));
  const stopAudioRef = useRef<() => void>(() => {});

  const resetRunner = useCallback((algorithmId: SortAlgorithmId, values: SortItem[]) => {
    initialValuesRef.current = values;
    runnerValuesRef.current = [...values];
    finalOrderRef.current = createFinalOrder(values);
    scaleMaxValueRef.current = getMaxValue(values);
    runnerRef.current = algorithmMap[algorithmId].createRunner(runnerValuesRef.current);
    stopAudioRef.current();
  }, []);

  const resetToValues = useCallback(
    (algorithmId: SortAlgorithmId, values: SortItem[], size?: number) => {
      resetRunner(algorithmId, values);
      dispatch({ type: 'resetValues', values: [...values], size });
    },
    [dispatch, resetRunner],
  );

  const audio = useSortAudio({
    algorithmId: state.algorithmId,
    isDone: state.isDone,
    finalOrderRef,
    resetToValues,
  });
  stopAudioRef.current = audio.stop;

  const selectAlgorithm = useCallback(
    (algorithmId: SortAlgorithmId) => {
      resetRunner(algorithmId, initialValuesRef.current);
      dispatch({ type: 'selectAlgorithm', algorithmId });
    },
    [dispatch, resetRunner],
  );

  const reset = useCallback(() => {
    resetToValues(state.algorithmId, initialValuesRef.current);
  }, [resetToValues, state.algorithmId]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (audio.hasUploadedAudio) {
        audio.stop();
      }
      return;
    }

    let cancelled = false;

    const runPlayback = async () => {
      if (!runnerRef.current) {
        resetRunner(state.algorithmId, state.values);
      }

      while (!cancelled) {
        if (audio.hasUploadedAudio) {
          const result = runnerRef.current!.next();
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
            await audio.playItems(audioItems, finalOrderRef.current);
          } else {
            await wait(SILENT_AUDIO_STEP_INTERVAL_MS);
          }
          continue;
        }

        const batchStartedAt = performance.now();
        let result: IteratorResult<SortStep, SortStep>;

        do {
          result = runnerRef.current!.next();
        } while (!result.done && performance.now() - batchStartedAt < NO_AUDIO_BATCH_BUDGET_MS);

        await wait(NO_AUDIO_BATCH_INTERVAL_MS);

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
    };

    void runPlayback();

    return () => {
      cancelled = true;
      if (audio.hasUploadedAudio) {
        audio.stop();
      }
    };
  }, [
    audio.hasUploadedAudio,
    audio.playItems,
    audio.stop,
    dispatch,
    resetRunner,
    state.algorithmId,
    state.isPlaying,
  ]);

  return {
    audioFileName: audio.audioFileName,
    isAudioLoading: audio.isAudioLoading,
    audioFileStatus: audio.audioFileStatus,
    playbackOriginalIndex: audio.playbackOriginalIndex,
    isFullPlayback: audio.isFullPlayback,
    scaleMaxValue: scaleMaxValueRef.current,
    sizeOptions: audio.hasUploadedAudio ? AUDIO_SIZE_OPTIONS : NO_AUDIO_SIZE_OPTIONS,
    resetToValues,
    selectAlgorithm,
    reset,
    loadAudioFile: audio.loadAudioFile,
  };
};
