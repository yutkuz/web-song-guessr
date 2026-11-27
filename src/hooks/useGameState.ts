'use client';

import { useCallback, useEffect, useState } from 'react';
import { GameMode, GameState, GameStatus, GameStats, GuessResult, Stage, Track } from '@/types';
import { STAGE_DURATIONS, MAX_STAGES } from '@/constants/game';
const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0],
  lastPlayedDate: '',
};

export type Feedback = 'correct' | 'wrong' | null;

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
  songNumber: number;
  totalSongs: number;
  feedback: Feedback;
  roundComplete: boolean;
  selectTrack: (track: Track | null) => void;
  submitGuess: () => void;
  skipStage: () => void;
  resetGame: () => Promise<void>;
  setStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  gameState: GameState;
  nextSong: () => void;
}

export const createInitialStages = (): Stage[] =>
  STAGE_DURATIONS.map((duration, index) => ({ index, duration, result: 'pending' as GuessResult, guess: null }));

export function useGameState(mode: GameMode = 'unlimited'): UseGameStateReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [songIndex, setSongIndex] = useState(0);
  const [stages, setStages] = useState<Stage[]>(createInitialStages);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>('loading');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [roundComplete, setRoundComplete] = useState(false);

  const initGame = useCallback(async () => {
    setStatus('loading'); setError(null); setFeedback(null); setRoundComplete(false);
    try {
      const selectedIndexes: number[] = [];
      const loadedTracks: Track[] = [];

      for (let songNumber = 0; songNumber < 5; songNumber += 1) {
        const exclude = selectedIndexes.join(',');
        const response = await fetch(`/api/daily-tracks?count=1${exclude ? `&exclude=${exclude}` : ''}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Şarkılar alınamadı (HTTP ${response.status})`);
        const data = await response.json() as Track & { catalogIndex?: number };
        if (!data || typeof data.id !== 'number') throw new Error('Beş şarkılık liste hazırlanamadı');
        loadedTracks.push(data);
        if (typeof data.catalogIndex !== 'number') throw new Error('Şarkı seçim bilgisi alınamadı');
        selectedIndexes.push(data.catalogIndex);
      }

      if (loadedTracks.length !== 5) throw new Error('Beş şarkılık liste hazırlanamadı');
      setTracks(loadedTracks); setSongIndex(0); setStages(createInitialStages()); setCurrentStageIndex(0); setSelectedTrack(null); setStatus('ready');
      setStats(INITIAL_STATS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şarkılar yüklenemedi');
      setStatus('ready');
    }
  }, [mode]);

  useEffect(() => { initGame(); }, [initGame]);

  const track = tracks[songIndex] ?? null;
  const selectTrack = useCallback((value: Track | null) => setSelectedTrack(value), []);

  const advance = useCallback(() => {
    if (songIndex >= tracks.length - 1) {
      setStatus('won');
      return;
    }
    setSongIndex((index) => index + 1);
    setStages(createInitialStages());
    setCurrentStageIndex(0);
    setSelectedTrack(null);
    setStatus('ready');
  }, [songIndex, tracks.length]);

  const nextSong = useCallback(() => {
    setRoundComplete(false);
    advance();
  }, [advance]);

  const submitGuess = useCallback(() => {
    if (!selectedTrack || !track || status === 'loading' || status === 'won') return;
    const correct = selectedTrack.id === track.id || (selectedTrack.title.toLocaleLowerCase('tr-TR') === track.title.toLocaleLowerCase('tr-TR') && selectedTrack.artist.toLocaleLowerCase('tr-TR') === track.artist.toLocaleLowerCase('tr-TR'));
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => setFeedback(null), 650);
    setStages((previous) => previous.map((stage, index) => index === currentStageIndex ? { ...stage, result: correct ? 'correct' : 'wrong', guess: selectedTrack } : stage));
    setSelectedTrack(null);
    if (correct || currentStageIndex >= MAX_STAGES - 1) {
      setRoundComplete(true);
    } else {
      setCurrentStageIndex((index) => index + 1);
    }
  }, [selectedTrack, track, status, currentStageIndex]);

  const skipStage = useCallback(() => {
    if (!track || status === 'loading' || status === 'won') return;
    setFeedback('wrong'); setTimeout(() => setFeedback(null), 650);
    setStages((previous) => previous.map((stage, index) => index === currentStageIndex ? { ...stage, result: 'skipped' } : stage));
    setSelectedTrack(null);
    if (currentStageIndex >= MAX_STAGES - 1) setRoundComplete(true);
    else setCurrentStageIndex((index) => index + 1);
  }, [track, status, currentStageIndex]);

  const resetGame = useCallback(async () => { await initGame(); }, [initGame]);
  const gameState: GameState = { track, stages, currentStageIndex, status, mode, selectedTrack };
  return { track, stages, currentStageIndex, status, mode, selectedTrack, stats, error, isLoading: status === 'loading', songNumber: Math.min(songIndex + 1, 5), totalSongs: 5, feedback, roundComplete, selectTrack, submitGuess, skipStage, resetGame, setStatus, gameState, nextSong };
}

export default useGameState;
