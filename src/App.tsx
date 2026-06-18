import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { useSortingVisualizer } from './hooks/useSortingVisualizer';

export const App = () => {
  const visualizer = useSortingVisualizer();
  const { state } = visualizer;

  return (
    <main className="min-h-dvh overflow-auto bg-slate-100 text-slate-950 lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-dvh w-screen min-w-0 flex-col gap-3 px-3 py-2 lg:h-full lg:min-h-0 lg:px-4">
        <AlgorithmTabs
          currentId={state.algorithmId}
          onSelect={visualizer.selectAlgorithm}
        />

        <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_clamp(340px,28vw,520px)]">
          <div className="min-h-0 min-w-0">
            <CanvasViewport
              values={state.values}
              step={state.currentStep}
              playbackOriginalIndex={visualizer.playbackOriginalIndex}
              scaleMaxValue={visualizer.scaleMaxValue}
            />
          </div>

          <aside className="flex min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white p-[clamp(12px,1.2dvw,22px)] shadow-sm lg:h-full lg:min-h-0">
            <div className="flex shrink-0 flex-col gap-[clamp(10px,1.2dvh,18px)]">
              <ControlPanel
                isPlaying={state.isPlaying}
                canPlay={!state.isDone}
                isFullPlayback={visualizer.isFullPlayback}
                size={state.size}
                sizeOptions={visualizer.sizeOptions}
                audioFileName={visualizer.audioFileName}
                isAudioLoading={visualizer.isAudioLoading}
                audioFileStatus={visualizer.audioFileStatus}
                onTogglePlayback={visualizer.togglePlayback}
                onAudioFileChange={visualizer.loadAudioFile}
                onReset={visualizer.reset}
                onGenerate={visualizer.generate}
                onSizeChange={visualizer.changeSize}
              />
              <StatsPanel algorithm={visualizer.currentAlgorithm} />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
};
