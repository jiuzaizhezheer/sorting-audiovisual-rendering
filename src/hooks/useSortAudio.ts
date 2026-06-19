import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { SortAudioEngine } from '../audio/sortAudioEngine';
import type { SortAlgorithmId, SortItem } from '../types/sorting';
import { createRandomArray } from '../utils/randomArray';
import { AUDIO_SIZE_OPTIONS, NO_AUDIO_SIZE_OPTIONS } from './sortingVisualizerConfig';

type UseSortAudioOptions = {
  algorithmId: SortAlgorithmId;
  isDone: boolean;
  finalOrderRef: RefObject<SortItem[]>;
  resetToValues: (algorithmId: SortAlgorithmId, values: SortItem[], size?: number) => void;
};

export const useSortAudio = ({
  algorithmId,
  isDone,
  finalOrderRef,
  resetToValues,
}: UseSortAudioOptions) => {
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioFileStatus, setAudioFileStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const [playbackOriginalIndex, setPlaybackOriginalIndex] = useState<number | null>(null);
  const [isFullPlayback, setIsFullPlayback] = useState(false);
  const audioEngineRef = useRef<SortAudioEngine | null>(null);
  const algorithmIdRef = useRef(algorithmId);
  const hasUploadedAudio = audioFileStatus === 'ready';

  algorithmIdRef.current = algorithmId;

  const stop = useCallback(() => {
    audioEngineRef.current?.stop();
    setPlaybackOriginalIndex(null);
  }, []);

  const playItems = useCallback(async (items: SortItem[], finalOrder: SortItem[]) => {
    audioEngineRef.current ??= new SortAudioEngine();
    await audioEngineRef.current.playItems(items, finalOrder, {
      onSegmentStart: setPlaybackOriginalIndex,
      onPlaybackEnd: () => setPlaybackOriginalIndex(null),
    });
  }, []);

  const loadAudioFile = useCallback(
    (file: File) => {
      audioEngineRef.current ??= new SortAudioEngine();
      setIsAudioLoading(true);
      setAudioFileStatus('idle');
      audioEngineRef.current
        .loadAudioFile(file)
        .then((audioFile) => {
          const currentAlgorithmId = algorithmIdRef.current;
          setAudioFileName(`${audioFile.name} (${audioFile.duration.toFixed(1)}s)`);
          setAudioFileStatus('ready');
          resetToValues(currentAlgorithmId, createRandomArray(AUDIO_SIZE_OPTIONS[0]), AUDIO_SIZE_OPTIONS[0]);
        })
        .catch((error: unknown) => {
          const currentAlgorithmId = algorithmIdRef.current;
          setAudioFileName(error instanceof Error ? error.message : '音频解码失败');
          setAudioFileStatus('error');
          resetToValues(
            currentAlgorithmId,
            createRandomArray(NO_AUDIO_SIZE_OPTIONS[0]),
            NO_AUDIO_SIZE_OPTIONS[0],
          );
        })
        .finally(() => {
          setIsAudioLoading(false);
        });
    },
    [resetToValues],
  );

  useEffect(() => {
    return () => {
      audioEngineRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isDone || !hasUploadedAudio) {
      return;
    }

    let cancelled = false;
    const sortedValues = finalOrderRef.current;

    const playFullPass = async () => {
      setIsFullPlayback(true);
      await playItems(sortedValues, sortedValues);
      if (!cancelled) {
        setPlaybackOriginalIndex(null);
        setIsFullPlayback(false);
      }
    };

    void playFullPass();

    return () => {
      cancelled = true;
      stop();
      setIsFullPlayback(false);
    };
  }, [finalOrderRef, hasUploadedAudio, isDone, playItems, stop]);

  return {
    audioFileName,
    isAudioLoading,
    audioFileStatus,
    playbackOriginalIndex,
    isFullPlayback,
    hasUploadedAudio,
    loadAudioFile,
    playItems,
    stop,
  };
};
