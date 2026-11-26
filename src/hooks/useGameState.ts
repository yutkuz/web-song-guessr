'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Track,
  Stage,
  GameStatus,
  GameMode,
  GameState,
  GameStats,
  GuessResult,
} from '@/types';
import { STAGE_DURATIONS, MAX_STAGES } from '@/constants/game';
import {
  getStats,
  saveGameResult,
  getDailyGameState,
  saveDailyGameState,
  INITIAL_STATS,
} from '@/services/statistics';

export interface UseGameStateReturn {
  track: Track | null;
  stages: Stage[];
  currentStageIndex: number;
  status: GameStatus;
  mode: GameMode;
  selectedTrack: Track | null;
  stats: GameStats;
  error: string | null;
  isLoading: boolean;
  selectTrack: (track: Track | null) => void;
  submitGuess: () => void;
  skipStage: () => void;
  resetGame: () => Promise<void>;
  setStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  gameState: GameState;
}

/**
 * Başlangıç aşamalarını oluşturur (3 aşama: 1s, 3s, 10s, pending, null guess)
 */
export const createInitialStages = (): Stage[] =>
  Array.from({ length: MAX_STAGES }, (_, index) => ({
    index,
    duration: STAGE_DURATIONS[index] ?? 10,
    result: 'pending' as GuessResult,
    guess: null,
  }));

/**
 * useGameState Hook
 *
 * Heardle tarzı müzik tahmin oyunu state yöneticisi.
 * Hem 'daily' (Günün Şarkısı) hem de 'unlimited' (Sınırsız) modlarını destekler.
 */
export function useGameState(mode: GameMode = 'daily'): UseGameStateReturn {
  const [track, setTrack] = useState<Track | null>(null);
  const [stages, setStages] = useState<Stage[]>(createInitialStages);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>('loading');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  // Unmount kontrolü
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // İstatistikleri localStorage'dan yükle
  useEffect(() => {
    setStats(getStats(mode));
  }, [mode]);

  /**
   * Oyun başlatma / şarkı getirme mantığı
   */
  const initGame = useCallback(
    async (forceFetch = false) => {
      setStatus('loading');
      setError(null);
      setSelectedTrack(null);

      // Daily modda önce localStorage'daki bugünkü oyunu kontrol et
      if (mode === 'daily' && !forceFetch) {
        const dailyRecord = getDailyGameState();
        if (dailyRecord && dailyRecord.state && dailyRecord.state.track) {
          if (!isMountedRef.current) return;

          setTrack(dailyRecord.state.track);
          setStages(
            Array.isArray(dailyRecord.state.stages) &&
              dailyRecord.state.stages.length === MAX_STAGES
              ? dailyRecord.state.stages
              : createInitialStages()
          );
          setCurrentStageIndex(dailyRecord.state.currentStageIndex ?? 0);
          setStatus(dailyRecord.state.status || 'ready');
          return;
        }
      }

      // Kayıt yoksa veya unlimited moddaysa API'den şarkıyı çek
      try {
        const endpoint =
          mode === 'unlimited'
            ? '/api/daily-tracks?random=true'
            : '/api/daily-tracks';

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Şarkı alınamadı (HTTP ${response.status})`);
        }

        const trackData: Track = await response.json();
        if (!isMountedRef.current) return;

        const freshStages = createInitialStages();
        setTrack(trackData);
        setStages(freshStages);
        setCurrentStageIndex(0);
        setStatus('ready');

        // Daily mod için yeni başlatılan oyunu kaydet
        if (mode === 'daily') {
          saveDailyGameState({
            track: trackData,
            stages: freshStages,
            currentStageIndex: 0,
            status: 'ready',
            mode: 'daily',
            selectedTrack: null,
          });
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Oyun şarkısı yüklenirken hata oluştu:', err);
        setError(
          err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu'
        );
        setStatus('ready');
      }
    },
    [mode]
  );

  // İlk yüklemede oyunu başlat
  useEffect(() => {
    initGame();
  }, [initGame]);

  /**
   * Arama kutusundan şarkı seçme
   */
  const selectTrack = useCallback((selected: Track | null) => {
    setSelectedTrack(selected);
  }, []);

  /**
   * Tahmin gönderme
   */
  const submitGuess = useCallback(() => {
    if (!selectedTrack || !track) return;
    if (status === 'won' || status === 'lost' || status === 'loading') return;

    // Şarkı eşleşme kontrolü (ID eşleşmesi veya Sanatçı & Başlık eşleşmesi)
    const isCorrect =
      selectedTrack.id === track.id ||
      (selectedTrack.title.trim().toLowerCase() ===
        track.title.trim().toLowerCase() &&
        selectedTrack.artist.trim().toLowerCase() ===
          track.artist.trim().toLowerCase());

    const updatedStages: Stage[] = stages.map((s, idx) => {
      if (idx === currentStageIndex) {
        return {
          ...s,
          result: (isCorrect ? 'correct' : 'wrong') as GuessResult,
          guess: selectedTrack,
        };
      }
      return s;
    });

    if (isCorrect) {
      const nextStatus: GameStatus = 'won';
      setStages(updatedStages);
      setStatus(nextStatus);
      setSelectedTrack(null);

      const updatedStats = saveGameResult(mode, true, currentStageIndex);
      setStats(updatedStats);

      if (mode === 'daily') {
        saveDailyGameState({
          track,
          stages: updatedStages,
          currentStageIndex,
          status: nextStatus,
          mode: 'daily',
          selectedTrack: null,
        });
      }
    } else {
      const isLastStage = currentStageIndex >= MAX_STAGES - 1;

      if (isLastStage) {
        const nextStatus: GameStatus = 'lost';
        setStages(updatedStages);
        setStatus(nextStatus);
        setSelectedTrack(null);

        const updatedStats = saveGameResult(mode, false, currentStageIndex);
        setStats(updatedStats);

        if (mode === 'daily') {
          saveDailyGameState({
            track,
            stages: updatedStages,
            currentStageIndex,
            status: nextStatus,
            mode: 'daily',
            selectedTrack: null,
          });
        }
      } else {
        const nextStageIndex = currentStageIndex + 1;
        setStages(updatedStages);
        setCurrentStageIndex(nextStageIndex);
        setSelectedTrack(null);

        if (mode === 'daily') {
          saveDailyGameState({
            track,
            stages: updatedStages,
            currentStageIndex: nextStageIndex,
            status: 'ready',
            mode: 'daily',
            selectedTrack: null,
          });
        }
      }
    }
  }, [selectedTrack, track, status, stages, currentStageIndex, mode]);

  /**
   * Aşamayı atlama (Pas / Pes Et)
   */
  const skipStage = useCallback(() => {
    if (!track) return;
    if (status === 'won' || status === 'lost' || status === 'loading') return;

    const updatedStages: Stage[] = stages.map((s, idx) => {
      if (idx === currentStageIndex) {
        return {
          ...s,
          result: 'skipped' as GuessResult,
          guess: null,
        };
      }
      return s;
    });

    const isLastStage = currentStageIndex >= MAX_STAGES - 1;

    if (isLastStage) {
      const nextStatus: GameStatus = 'lost';
      setStages(updatedStages);
      setStatus(nextStatus);
      setSelectedTrack(null);

      const updatedStats = saveGameResult(mode, false, currentStageIndex);
      setStats(updatedStats);

      if (mode === 'daily') {
        saveDailyGameState({
          track,
          stages: updatedStages,
          currentStageIndex,
          status: nextStatus,
          mode: 'daily',
          selectedTrack: null,
        });
      }
    } else {
      const nextStageIndex = currentStageIndex + 1;
      setStages(updatedStages);
      setCurrentStageIndex(nextStageIndex);
      setSelectedTrack(null);

      if (mode === 'daily') {
        saveDailyGameState({
          track,
          stages: updatedStages,
          currentStageIndex: nextStageIndex,
          status: 'ready',
          mode: 'daily',
          selectedTrack: null,
        });
      }
    }
  }, [track, status, stages, currentStageIndex, mode]);

  /**
   * Oyunu sıfırlama (özellikle sınırsız mod veya yeniden başlatma için)
   */
  const resetGame = useCallback(async () => {
    await initGame(true);
    setStats(getStats(mode));
  }, [initGame, mode]);

  const gameState: GameState = {
    track,
    stages,
    currentStageIndex,
    status,
    mode,
    selectedTrack,
  };

  return {
    track,
    stages,
    currentStageIndex,
    status,
    mode,
    selectedTrack,
    stats,
    error,
    isLoading: status === 'loading',
    selectTrack,
    submitGuess,
    skipStage,
    resetGame,
    setStatus,
    gameState,
  };
}

export default useGameState;
