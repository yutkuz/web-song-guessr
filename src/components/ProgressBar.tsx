'use client';

import React from 'react';
import { STAGE_DURATIONS, TOTAL_DURATION } from '@/constants/game';

export interface ProgressBarProps {
  currentTime: number;
  duration?: number;           // varsayılan TOTAL_DURATION (10s)
  currentStageIndex: number;   // 0, 1, 2
  isPlaying?: boolean;
}

/**
 * Zamanı mm:ss formatına dönüştürür (örn: 0:01)
 */
function formatTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({
  currentTime,
  duration = TOTAL_DURATION,
  currentStageIndex,
  isPlaying = false,
}: ProgressBarProps) {
  const totalDuration = duration > 0 ? duration : TOTAL_DURATION;
  const safeStageIndex = Math.min(
    STAGE_DURATIONS.length - 1,
    Math.max(0, currentStageIndex)
  );

  // Aktif aşamanın izin verilen maksimum süresi
  const activeStageLimit =
    totalDuration > TOTAL_DURATION
      ? totalDuration
      : (STAGE_DURATIONS[safeStageIndex] ?? TOTAL_DURATION);

  // Saniye ve yüzde hesaplamaları
  const safeCurrentTime = Math.min(totalDuration, Math.max(0, currentTime));
  const progressPercent = Math.min(
    100,
    Math.max(0, (safeCurrentTime / totalDuration) * 100)
  );
  const unlockedPercent = Math.min(
    100,
    Math.max(0, (activeStageLimit / totalDuration) * 100)
  );

  return (
    <div className="w-full space-y-2 select-none" aria-label="Şarkı dinleme ilerlemesi">
      {/* Üst Bilgi: Zaman Göstergesi ve Aktif Aşama */}
      <div className="flex items-center justify-between text-xs font-medium text-neutral-400">
        <div className="flex items-center gap-1.5 font-mono">
          <span
            className={`inline-block w-2 h-2 rounded-full transition-colors ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'
            }`}
          />
          <span className="text-neutral-200 font-semibold">
            {formatTime(safeCurrentTime)}
          </span>
          <span className="text-neutral-500">/</span>
          <span>{formatTime(activeStageLimit)}</span>
          <span className="text-neutral-500 text-[11px] ml-1 hidden sm:inline">
            ({safeCurrentTime.toFixed(1)}s / {activeStageLimit}s)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-neutral-300 font-semibold">
            {safeStageIndex + 1}. Aşama
          </span>
          <span className="text-neutral-500">
            ({STAGE_DURATIONS.length} aşama)
          </span>
        </div>
      </div>

      {/* Progress Bar Ana Çubuk */}
      <div className="relative h-3 sm:h-3.5 w-full bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden shadow-inner">
        {/* Kilitli Olmayan / Dinlenebilir Aşama Arka Plan Vurgusu */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-neutral-700/60 transition-all duration-300"
          style={{ width: `${unlockedPercent}%` }}
          title={`Açık dinleme süresi: ${activeStageLimit} saniye`}
        />

        {/* Canlı İlerleme Çubuğu (Dolum) */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-[width] duration-75 ease-linear shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Aşama Ayraç Çizgileri (Divider) */}
        {STAGE_DURATIONS.map((stageDuration, index) => {
          // Son aşama (%100) çubuğun bitişi olduğu için iç divider olarak sadece ara noktaları çiziyoruz
          if (stageDuration >= totalDuration) return null;
          const leftPercent = (stageDuration / totalDuration) * 100;

          return (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-[2px] bg-neutral-950/80 z-10 pointer-events-none"
              style={{ left: `${leftPercent}%` }}
            />
          );
        })}
      </div>

      {/* Alt Rozetler / Aşama Göstergeleri */}
      <div className="relative flex justify-between items-center text-[11px] font-medium pt-0.5">
        {STAGE_DURATIONS.map((stageDuration, index) => {
          const isUnlocked = index <= safeStageIndex;
          const isCurrent = index === safeStageIndex;

          return (
            <div
              key={index}
              className={`flex items-center gap-1 transition-colors ${
                isCurrent
                  ? 'text-emerald-400 font-semibold'
                  : isUnlocked
                  ? 'text-neutral-300'
                  : 'text-neutral-600'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isCurrent
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : isUnlocked
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-900 text-neutral-600 border border-neutral-800/80'
                }`}
              >
                {stageDuration}s
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressBar;
