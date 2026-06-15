import { useEffect, useRef, useReducer, useState } from 'react';
import { algorithmMap } from './algorithms/registry';
import { SortAudioEngine } from './audio/sortAudioEngine';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { createInitialSortState, sortReducer } from './state/sortReducer';
import type { SortAlgorithmId, SortItem, SortStep } from './types/sorting';
import { createRandomArray } from './utils/randomArray';

const NO_AUDIO_SIZE_OPTIONS = [400, 600, 800, 1000] as const;
const AUDIO_SIZE_OPTIONS = [25, 50, 75, 100] as const;
const NO_AUDIO_STEP_INTERVAL_MS = 1;

const getStepAudioItems = (array: SortItem[], audioIndices: number[] | undefined): SortItem[] => {
  if (!audioIndices?.length) {
    return [];
  }

  return [...new Set(audioIndices)]
    .map((index) => array[index])
    .filter((item): item is SortItem => item !== undefined);
};

const createFinalOrder = (values: SortItem[]): SortItem[] => [...values].sort((a, b) => a.value - b.value);

export const App = () => {
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
  const currentStep = state.currentStep;
  const currentAlgorithm = algorithmMap[state.algorithmId];
  const hasUploadedAudio = audioFileStatus === 'ready';
  const sizeOptions = hasUploadedAudio ? AUDIO_SIZE_OPTIONS : NO_AUDIO_SIZE_OPTIONS;
  const canPlay = !state.isDone;

  const resetRunner = (algorithmId: SortAlgorithmId, values: SortItem[]) => {
    initialValuesRef.current = values;
    runnerValuesRef.current = [...values];
    finalOrderRef.current = createFinalOrder(values);
    runnerRef.current = algorithmMap[algorithmId].createRunner(runnerValuesRef.current);
    audioEngineRef.current?.stop();
    setPlaybackOriginalIndex(null);
  };

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
  }, [state.isDone, hasUploadedAudio]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Spacebar': {
          event.preventDefault();
          dispatch({ type: 'togglePlayback' });
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!state.isPlaying) {
      if (hasUploadedAudio) {
        audioEngineRef.current?.stop();
      }
      setPlaybackOriginalIndex(null);
      return;
    }

    let cancelled = false;

    const scheduleNextStep = async () => {
      if (!runnerRef.current) {
        resetRunner(state.algorithmId, state.values);
      }

      let result = runnerRef.current!.next();

      if (hasUploadedAudio) {
        const nextStep = result.value;
        const audioItems = getStepAudioItems(runnerValuesRef.current, nextStep.audioIndices);

        if (audioItems.length === 0) {
          await Promise.resolve();
        } else {
          audioEngineRef.current ??= new SortAudioEngine();
          await audioEngineRef.current.playItems(
            audioItems,
            finalOrderRef.current,
            {
              onSegmentStart: setPlaybackOriginalIndex,
              onPlaybackEnd: () => setPlaybackOriginalIndex(null),
            },
          );
        }
      } else {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, NO_AUDIO_STEP_INTERVAL_MS);
        });
      }

      if (!cancelled) {
        dispatch({
          type: 'applyStep',
          values: [...runnerValuesRef.current],
          step: result.value,
          isDone: Boolean(result.done),
        });
      }
    };

    void scheduleNextStep();

    return () => {
      cancelled = true;
      if (hasUploadedAudio) {
        audioEngineRef.current?.stop();
      }
      setPlaybackOriginalIndex(null);
    };
  }, [currentStep, hasUploadedAudio, state.algorithmId, state.isPlaying, state.values]);

  const resetToValues = (algorithmId: SortAlgorithmId, values: SortItem[], size?: number) => {
    resetRunner(algorithmId, values);
    dispatch({ type: 'resetValues', values: [...values], size });
  };

  return (
    <main className="min-h-dvh overflow-auto bg-slate-100 text-slate-950 lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-dvh w-screen min-w-0 flex-col gap-3 px-3 py-2 lg:h-full lg:min-h-0 lg:px-4">
        <AlgorithmTabs
          currentId={state.algorithmId}
          onSelect={(algorithmId) => {
            resetRunner(algorithmId, initialValuesRef.current);
            dispatch({ type: 'selectAlgorithm', algorithmId });
          }}
        />

        <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_clamp(340px,28vw,520px)]">
          <div className="min-h-0 min-w-0">
            <CanvasViewport values={state.values} step={currentStep} playbackOriginalIndex={playbackOriginalIndex} />
          </div>

          <aside className="flex min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white p-[clamp(12px,1.2dvw,22px)] shadow-sm lg:h-full lg:min-h-0">
            <div className="flex shrink-0 flex-col gap-[clamp(10px,1.2dvh,18px)]">
              <ControlPanel
                isPlaying={state.isPlaying}
                canPlay={canPlay}
                isFullPlayback={isFullPlayback}
                size={state.size}
                sizeOptions={sizeOptions}
                audioFileName={audioFileName}
                isAudioLoading={isAudioLoading}
                audioFileStatus={audioFileStatus}
                onTogglePlayback={() => {
                  dispatch({ type: 'togglePlayback' });
                }}
                onAudioFileChange={(file) => {
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
                      resetToValues(
                        state.algorithmId,
                        createRandomArray(NO_AUDIO_SIZE_OPTIONS[0]),
                        NO_AUDIO_SIZE_OPTIONS[0],
                      );
                    })
                    .finally(() => {
                      setIsAudioLoading(false);
                    });
                }}
                onReset={() => resetToValues(state.algorithmId, initialValuesRef.current)}
                onGenerate={() => resetToValues(state.algorithmId, createRandomArray(state.size))}
                onSizeChange={(size) => resetToValues(state.algorithmId, createRandomArray(size), size)}
              />
              <StatsPanel algorithm={currentAlgorithm} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};
