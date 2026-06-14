import { useEffect, useRef, useReducer, useState } from 'react';
import { algorithmMap } from './algorithms/registry';
import { SortAudioEngine } from './audio/sortAudioEngine';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { createInitialSortState, sortReducer } from './state/sortReducer';

export const App = () => {
  const [state, dispatch] = useReducer(sortReducer, undefined, createInitialSortState);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [playbackOriginalIndex, setPlaybackOriginalIndex] = useState<number | null>(null);
  const audioEngineRef = useRef<SortAudioEngine | null>(null);
  const currentStep = state.steps[state.stepIndex];
  const currentAlgorithm = algorithmMap[state.algorithmId];
  const canGoBack = state.stepIndex > 0;
  const canGoForward = state.stepIndex < state.steps.length - 1;
  useEffect(() => {
    if (!state.isPlaying) {
      audioEngineRef.current?.stop();
      setPlaybackOriginalIndex(null);
      return;
    }

    let cancelled = false;

    const scheduleNextStep = async () => {
      if (state.isSoundEnabled && currentStep.playSoundAfterStep) {
        audioEngineRef.current ??= new SortAudioEngine();
        await audioEngineRef.current.playItems(
          currentStep.array,
          state.speedMs,
          state.steps[state.steps.length - 1].array,
          {
            onSegmentStart: setPlaybackOriginalIndex,
            onPlaybackEnd: () => setPlaybackOriginalIndex(null),
          },
        );
      } else {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, state.speedMs);
        });
      }

      if (!cancelled) {
        dispatch({ type: 'nextStep' });
      }
    };

    void scheduleNextStep();

    return () => {
      cancelled = true;
      audioEngineRef.current?.stop();
      setPlaybackOriginalIndex(null);
    };
  }, [currentStep, state.isPlaying, state.isSoundEnabled, state.speedMs]);

  return (
    <main className="min-h-dvh overflow-auto bg-slate-100 text-slate-950 lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-dvh w-screen min-w-0 flex-col gap-3 px-3 py-2 lg:h-full lg:min-h-0 lg:px-4">
        <AlgorithmTabs
          currentId={state.algorithmId}
          onSelect={(algorithmId) => dispatch({ type: 'selectAlgorithm', algorithmId })}
        />

        <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_clamp(340px,28vw,520px)]">
          <div className="min-h-0 min-w-0">
            <CanvasViewport step={currentStep} playbackOriginalIndex={playbackOriginalIndex} />
          </div>

          <aside className="flex min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white p-[clamp(12px,1.2dvw,22px)] shadow-sm lg:h-full lg:min-h-0">
            <div className="flex shrink-0 flex-col gap-[clamp(10px,1.2dvh,18px)]">
              <ControlPanel
                isPlaying={state.isPlaying}
                isSoundEnabled={state.isSoundEnabled}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                size={state.size}
                speedMs={state.speedMs}
                audioFileName={audioFileName}
                isAudioLoading={isAudioLoading}
                onTogglePlayback={() => {
                  audioEngineRef.current ??= new SortAudioEngine();
                  if (!state.isPlaying && state.isSoundEnabled) {
                    void audioEngineRef.current.ensureReady();
                  }
                  dispatch({ type: 'togglePlayback' });
                }}
                onToggleSound={() => {
                  if (state.isSoundEnabled) {
                    audioEngineRef.current?.stop();
                  }
                  dispatch({ type: 'toggleSound' });
                }}
                onAudioFileChange={(file) => {
                  audioEngineRef.current ??= new SortAudioEngine();
                  setIsAudioLoading(true);
                  audioEngineRef.current
                    .loadAudioFile(file)
                    .then((audioFile) => {
                      setAudioFileName(`${audioFile.name} (${audioFile.duration.toFixed(1)}s)`);
                    })
                    .catch((error: unknown) => {
                      setAudioFileName(error instanceof Error ? error.message : '音频解码失败');
                    })
                    .finally(() => {
                      setIsAudioLoading(false);
                    });
                }}
                onPrevious={() => dispatch({ type: 'previousStep' })}
                onNext={() => dispatch({ type: 'nextStep' })}
                onReset={() => dispatch({ type: 'resetSteps' })}
                onGenerate={() => dispatch({ type: 'generateValues' })}
                onSizeChange={(size) => dispatch({ type: 'setSize', size })}
                onSpeedChange={(speedMs) => dispatch({ type: 'setSpeed', speedMs })}
              />
              <StatsPanel algorithm={currentAlgorithm} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};
