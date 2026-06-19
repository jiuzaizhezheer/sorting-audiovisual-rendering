import { useCallback, useReducer } from 'react';
import { algorithmMap } from '../algorithms/registry';
import { createInitialSortState, sortReducer } from '../state/sortReducer';
import { createRandomArray } from '../utils/randomArray';
import { useSortingPlayback } from './useSortingPlayback';
import { useSpacebarToggle } from './useSpacebarToggle';

export const useSortingVisualizer = () => {
  const [state, dispatch] = useReducer(sortReducer, undefined, createInitialSortState);
  const playback = useSortingPlayback({ state, dispatch });

  const togglePlayback = useCallback(() => {
    dispatch({ type: 'togglePlayback' });
  }, []);

  const generate = useCallback(() => {
    playback.resetToValues(state.algorithmId, createRandomArray(state.size));
  }, [playback.resetToValues, state.algorithmId, state.size]);

  const changeSize = useCallback(
    (size: number) => {
      playback.resetToValues(state.algorithmId, createRandomArray(size), size);
    },
    [playback.resetToValues, state.algorithmId],
  );

  useSpacebarToggle(togglePlayback);

  return {
    state,
    currentAlgorithm: algorithmMap[state.algorithmId],
    playbackOriginalIndex: playback.playbackOriginalIndex,
    scaleMaxValue: playback.scaleMaxValue,
    isFullPlayback: playback.isFullPlayback,
    audioFileName: playback.audioFileName,
    isAudioLoading: playback.isAudioLoading,
    audioFileStatus: playback.audioFileStatus,
    sizeOptions: playback.sizeOptions,
    selectAlgorithm: playback.selectAlgorithm,
    togglePlayback,
    loadAudioFile: playback.loadAudioFile,
    reset: playback.reset,
    generate,
    changeSize,
  };
};
