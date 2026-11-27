'use client';

import React from 'react';
import { GameStatus } from '@/types';
import { STAGE_DURATIONS, MAX_STAGES } from '@/constants/game';

export interface GameControlsProps {
  isPlaying: boolean;
  currentStageIndex: number;
  hasSelectedTrack: boolean;
  gameStatus: GameStatus; // 'loading' | 'ready' | 'playing' | 'won' | 'lost'
  onPlay: () => void;
  onStop: () => void;
  onSkip: () => void;
  onGuess: () => void;
  disabled?: boolean;
}

/**
 * GameControls: Heardle tarzı oyun kontrol butonları bileşeni.
 * - Oynat / Durdur: Mevcut aşama süresince şarkıyı çalar veya durdurur.
 * - Atla (Pas): Sonraki aşamaya geçer veya son aşamadaysa pes eder.
 * - Tahmin Et: Kullanıcı arama kutusundan bir şarkı seçtiğinde tahmini onaylar.
 */
export function GameControls({
  isPlaying,
  currentStageIndex,
  hasSelectedTrack,
  gameStatus,
  onPlay,
  onStop,
  onSkip,
  onGuess,
  disabled = false,
}: GameControlsProps) {
  // Oyun bitti mi veya yükleniyor mu?
  const isGameOver = gameStatus === 'won' || gameStatus === 'lost';
  const isLoading = gameStatus === 'loading';
  const isControlsDisabled = disabled || isLoading || isGameOver;

  // Güvenli aşama indeksi (0, 1, 2)
  const safeStageIndex = Math.min(
    MAX_STAGES - 1,
    Math.max(0, currentStageIndex)
  );

  // Mevcut aşama dinleme süresi (1s, 3s, 10s)
  const currentDuration = STAGE_DURATIONS[safeStageIndex] ?? 1;

  // Son aşama kontrolü (2. index -> 3. aşama)
  const isLastStage = safeStageIndex >= MAX_STAGES - 1;

  // Bir sonraki aşamanın ek süresi (delta saniye: örn: 1s -> 3s için +2s, 3s -> 10s için +7s)
  const nextDuration = !isLastStage
    ? STAGE_DURATIONS[safeStageIndex + 1] ?? currentDuration
    : currentDuration;
  const deltaSeconds = Math.max(0, nextDuration - currentDuration);

  // Buton etiketleri
  const skipButtonLabel = isLastStage ? 'Atla' : 'Uzat';

  // Tahmin Et butonu devre dışı mı?
  const isGuessDisabled = isControlsDisabled || !hasSelectedTrack;

  return (
    <div
      className="w-full space-y-3 select-none"
    >
      {/* 1. Ana Aksiyon: Oynat / Durdur Butonu */}
      <div className="w-full">
        <button
          type="button"
          onClick={isPlaying ? onStop : onPlay}
          disabled={isControlsDisabled}
          aria-label={
            isPlaying
              ? 'Şarkıyı durdur'
              : `Şarkıyı oynat (${currentDuration} saniye)`
          }
          className={`w-full min-h-[48px] sm:min-h-[52px] px-6 py-3 rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
            isControlsDisabled
              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700/60 cursor-not-allowed opacity-50 shadow-none'
            : isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-950/40 ring-1 ring-amber-400/30 motion-safe:animate-pulse'
              : 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 active:from-indigo-600 active:to-violet-600 text-white shadow-indigo-950/40 ring-1 ring-indigo-300/30'
          }`}
        >
          {isPlaying ? (
            <>
              {/* Durdur / Pause İkonu */}
              <svg
                className="w-5 h-5 fill-current flex-shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
              <span>Durdur</span>
            </>
          ) : (
            <>
              {/* Oynat / Play İkonu */}
              <svg
                className="w-5 h-5 fill-current flex-shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              <span>Oynat</span>
            </>
          )}
        </button>
      </div>

      {/* 2. İkincil Aksiyonlar: Atla (Pas) & Tahmin Et Butonları */}
      <div className="game-secondary-actions grid grid-cols-2 gap-3 w-full">
        {/* Atla / Pas Butonu */}
        <button
          type="button"
          onClick={onSkip}
          disabled={isControlsDisabled}
          aria-label={skipButtonLabel}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base flex items-center justify-center gap-2 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
            isControlsDisabled
              ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
              : isLastStage
              ? 'bg-neutral-800/90 hover:bg-neutral-700 text-rose-300 hover:text-rose-200 border-neutral-700 hover:border-rose-500/50 active:bg-neutral-800 shadow-sm'
              : 'bg-white/[.05] hover:bg-white/[.1] text-neutral-200 hover:text-white border-white/10 hover:border-white/20 active:bg-white/[.08] shadow-sm'
          }`}
        >
          {/* İleri / Atla İkonu */}
          <svg
            className={`w-4 h-4 flex-shrink-0 ${
              isLastStage ? 'text-rose-400' : 'text-neutral-400'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
          <span className="truncate">{skipButtonLabel}</span>
        </button>

        {/* Tahmin Et Butonu */}
        <button
          type="button"
          onClick={onGuess}
          disabled={isGuessDisabled}
          aria-label="Tahmini onayla"
          className={`min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
            isGuessDisabled
              ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
              : 'bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 text-[#07120f] border-emerald-300/50 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-200/30'
          }`}
        >
          {/* Onay / Gönder İkonu */}
          <svg
            className="w-4 h-4 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="truncate">Tahmin Et</span>
        </button>
      </div>

      {/* 3. Oyun Durumu Bilgilendirme Rozeti (Yükleniyor veya Oyun Bitti durumlarında) */}
      {isLoading && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400"
        >
          <svg
            className="motion-safe:animate-spin w-3.5 h-3.5 text-emerald-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
          <span>Şarkı yükleniyor...</span>
        </div>
      )}

      {isGameOver && (
        <div
          role="status"
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium ${
            gameStatus === 'won'
              ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
          }`}
        >
          {gameStatus === 'won' ? (
            <>
              <span aria-hidden="true">🎉</span>
              <span>Tebrikler! Şarkıyı başarıyla tahmin ettiniz.</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">😔</span>
              <span>Oyun sona erdi.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GameControls;
