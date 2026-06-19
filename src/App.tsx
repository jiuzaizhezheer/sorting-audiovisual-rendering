import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { useSortingVisualizer } from './hooks/useSortingVisualizer';
import { useTheme } from './hooks/useTheme';

export const App = () => {
  const visualizer = useSortingVisualizer();
  const { theme, toggleTheme } = useTheme();
  const { state } = visualizer;

  return (
    <main className="min-h-dvh overflow-auto bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100 lg:h-dvh lg:overflow-hidden">
      <div className="flex min-h-dvh w-screen min-w-0 flex-col gap-3 px-3 py-2 lg:h-full lg:min-h-0 lg:px-4">
        <div className="sticky top-2 z-10 flex gap-2">
          <div className="min-w-0 flex-1">
            <AlgorithmTabs currentId={state.algorithmId} onSelect={visualizer.selectAlgorithm} />
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <section className="grid flex-1 gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_clamp(340px,28vw,520px)]">
          <div className="min-h-0 min-w-0">
            <CanvasViewport
              values={state.values}
              step={state.currentStep}
              playbackOriginalIndex={visualizer.playbackOriginalIndex}
              scaleMaxValue={visualizer.scaleMaxValue}
              theme={theme}
            />
          </div>

          <aside className="flex min-w-0 flex-col overflow-y-auto overflow-x-hidden rounded-md border border-slate-200 bg-white p-[clamp(12px,1.2dvw,22px)] shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 lg:h-full lg:min-h-0">
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
