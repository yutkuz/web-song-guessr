'use client';

import { useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ProgressBar } from '@/components/ProgressBar';
import { GuessHistory } from '@/components/GuessHistory';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { GameControls } from '@/components/GameControls';
import { ResultScreen } from '@/components/ResultScreen';
import { STAGE_DURATIONS } from '@/constants/game';

export default function DailyGamePage() {
  const gameState = useGameState('daily');
  const audio = useAudioPlayer();

  // Şarkı yüklendiğinde ses oynatıcısına MP3 önizleme URL'sini ver
  useEffect(() => {
    if (gameState.track?.previewUrl) {
      audio.loadTrack(gameState.track.previewUrl);
    }
  }, [gameState.track?.previewUrl, audio.loadTrack]);

  // Oyun bittiğinde çalan sesi durdur
  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'lost') {
      audio.stop();
    }
  }, [gameState.status, audio.stop]);

  // Aktif aşamanın dinleme süresi (1s, 3s, 10s)
  const currentDurationLimit =
    STAGE_DURATIONS[gameState.currentStageIndex] ?? 1;

  // Oyun aktif mi?
  const isGameActive =
    gameState.status === 'ready' || gameState.status === 'playing';

  // Oyun bitti mi?
  const isGameOver =
    gameState.status === 'won' || gameState.status === 'lost';

  // GameControls için güncel durum
  const controlStatus = audio.isPlaying ? 'playing' : gameState.status;

  const handlePlay = () => {
    audio.play(currentDurationLimit);
  };

  const handleStop = () => {
    audio.stop();
  };

  const handleGuess = () => {
    audio.stop();
    gameState.submitGuess();
  };

  const handleSkip = () => {
    audio.stop();
    gameState.skipStage();
  };

  const handlePlayPreview = () => {
    if (audio.isPlaying) {
      audio.stop();
    } else {
      audio.playPreview();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-2 sm:py-4 gap-6 select-none">
      {/* 1. Yükleniyor Durumu (Skeleton) */}
      {gameState.isLoading && (
        <div
          className="w-full space-y-6 animate-pulse"
          aria-label="Günün şarkısı yükleniyor"
        >
          {/* Progress Bar İskeleti */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-neutral-800 rounded-md" />
              <div className="h-4 w-24 bg-neutral-800 rounded-md" />
            </div>
            <div className="h-3.5 w-full bg-neutral-850 rounded-full" />
          </div>

          {/* Aşama Kartları İskeleti */}
          <div className="space-y-2.5">
            <div className="h-14 w-full bg-neutral-900 border border-neutral-800 rounded-xl" />
            <div className="h-14 w-full bg-neutral-900/70 border border-neutral-800/70 rounded-xl" />
            <div className="h-14 w-full bg-neutral-900/40 border border-neutral-800/40 rounded-xl" />
          </div>

          {/* Kontrol Butonları İskeleti */}
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full bg-neutral-900 border border-neutral-800 rounded-xl" />
            <div className="h-12 w-full bg-neutral-900/80 border border-neutral-800/80 rounded-xl" />
          </div>

          {/* Spinner ve Bilgilendirme */}
          <div className="flex items-center justify-center gap-2.5 text-neutral-400 text-sm pt-4">
            <svg
              className="animate-spin h-5 w-5 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Günün şarkısı hazırlanıyor...</span>
          </div>
        </div>
      )}

      {/* 2. Hata Durumu */}
      {!gameState.isLoading && gameState.error && !gameState.track && (
        <div
          role="alert"
          className="w-full bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center space-y-4 my-auto shadow-xl"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-900/50 flex items-center justify-center text-rose-300 text-2xl">
            ⚠️
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-rose-200">
              Şarkı Yüklenemedi
            </h2>
            <p className="text-sm text-neutral-300">
              {gameState.error || 'Şarkı yüklenirken bir problem oluştu.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => gameState.resetGame()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* 3. Ana Oyun Akışı */}
      {!gameState.isLoading && gameState.track && (
        <>
          {/* Üst Kısım: Progress Bar ve Aşama Geçmişi */}
          <div className="space-y-6">
            <ProgressBar
              currentTime={audio.currentTime}
              duration={audio.duration}
              currentStageIndex={gameState.currentStageIndex}
              isPlaying={audio.isPlaying}
            />

            <GuessHistory
              stages={gameState.stages}
              currentStageIndex={gameState.currentStageIndex}
            />
          </div>

          {/* Alt Kısım: Oyun Devam Ediyorsa Arama ve Kontroller */}
          {isGameActive && (
            <div className="space-y-4 pt-2">
              <SearchAutocomplete
                key={gameState.currentStageIndex}
                onSelect={gameState.selectTrack}
                placeholder="Şarkı veya sanatçı adı ara..."
              />

              <GameControls
                isPlaying={audio.isPlaying}
                currentStageIndex={gameState.currentStageIndex}
                hasSelectedTrack={gameState.selectedTrack !== null}
                gameStatus={controlStatus}
                onPlay={handlePlay}
                onStop={handleStop}
                onSkip={handleSkip}
                onGuess={handleGuess}
              />
            </div>
          )}

          {/* Alt Kısım: Oyun Bittiyse Sonuç Ekranı */}
          {isGameOver && (
            <div className="pt-2 animate-fadeIn">
              <ResultScreen
                track={gameState.track}
                stages={gameState.stages}
                won={gameState.status === 'won'}
                mode="daily"
                stats={gameState.stats}
                onPlayPreview={handlePlayPreview}
                isPlayingPreview={audio.isPlaying}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
