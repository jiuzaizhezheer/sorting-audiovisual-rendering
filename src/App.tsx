import { useEffect, useMemo, useReducer } from 'react';
import { algorithmMap } from './algorithms/registry';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CanvasViewport } from './components/CanvasViewport';
import { ControlPanel } from './components/ControlPanel';
import { StatsPanel } from './components/StatsPanel';
import { createInitialSortState, sortReducer } from './state/sortReducer';

export const App = () => {
  const [state, dispatch] = useReducer(sortReducer, undefined, createInitialSortState);
  const currentStep = state.steps[state.stepIndex];
  const currentAlgorithm = algorithmMap[state.algorithmId];
  const canGoBack = state.stepIndex > 0;
  const canGoForward = state.stepIndex < state.steps.length - 1;

  useEffect(() => {
    if (!state.isPlaying) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: 'nextStep' });
    }, state.speedMs);

    return () => window.clearTimeout(timer);
  }, [state.isPlaying, state.speedMs, state.stepIndex]);

  const visibleValues = useMemo(() => currentStep.array.join(', '), [currentStep.array]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Sorting Visual Lab</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-5xl">排序算法可视化工作台</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              使用 Canvas 2D 展示排序过程，控制流由 React useReducer 统一管理，算法模块保持独立便于扩展。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-md border border-slate-200 bg-white p-2 text-center shadow-sm">
            <div className="px-3 py-2">
              <p className="text-xs text-slate-500">算法</p>
              <p className="font-mono text-lg font-semibold">3</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-slate-500">数据量</p>
              <p className="font-mono text-lg font-semibold">{state.size}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-slate-500">进度</p>
              <p className="font-mono text-lg font-semibold">
                {state.stepIndex + 1}/{state.steps.length}
              </p>
            </div>
          </div>
        </header>

        <AlgorithmTabs
          currentId={state.algorithmId}
          onSelect={(algorithmId) => dispatch({ type: 'selectAlgorithm', algorithmId })}
        />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <CanvasViewport step={currentStep} />
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-cyan-600" />
                  比较
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-red-600" />
                  交换
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-blue-600" />
                  写回
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-amber-500" />
                  基准
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-3 w-3 rounded-sm bg-green-600" />
                  已完成
                </span>
              </div>
              <p className="mt-3 line-clamp-2 font-mono text-xs text-slate-500">{visibleValues}</p>
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <ControlPanel
              isPlaying={state.isPlaying}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              size={state.size}
              speedMs={state.speedMs}
              onTogglePlayback={() => dispatch({ type: 'togglePlayback' })}
              onPrevious={() => dispatch({ type: 'previousStep' })}
              onNext={() => dispatch({ type: 'nextStep' })}
              onReset={() => dispatch({ type: 'resetSteps' })}
              onGenerate={() => dispatch({ type: 'generateValues' })}
              onSizeChange={(size) => dispatch({ type: 'setSize', size })}
              onSpeedChange={(speedMs) => dispatch({ type: 'setSpeed', speedMs })}
            />
            <StatsPanel
              algorithm={currentAlgorithm}
              currentStep={currentStep}
              stepIndex={state.stepIndex}
              totalSteps={state.steps.length}
            />
          </aside>
        </section>
      </div>
    </main>
  );
};
