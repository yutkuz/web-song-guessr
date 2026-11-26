'use client';

import React, { useState } from 'react';
import { Stage, GuessResult, Track } from '@/types';
import { STAGE_DURATIONS, MAX_STAGES } from '@/constants/game';

export interface GuessHistoryProps {
  stages: Stage[];
  currentStageIndex: number;
}

/**
 * Şarkı albüm kapağı veya fallback ikonu gösteren yardımcı bileşen
 */
function TrackCover({
  coverUrl,
  title,
  result,
}: {
  coverUrl?: string;
  title: string;
  result: GuessResult;
}) {
  const [hasError, setHasError] = useState(false);

  if (coverUrl && !hasError) {
    return (
      <img
        src={coverUrl}
        alt={title}
        onError={() => setHasError(true)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0 shadow-sm border border-white/10"
        loading="lazy"
      />
    );
  }

  // Fallback müzik ikonu
  const iconColor =
    result === 'correct'
      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50'
      : result === 'wrong'
      ? 'text-rose-400 bg-rose-950/60 border-rose-700/50'
      : 'text-neutral-400 bg-neutral-800 border-neutral-700';

  return (
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${iconColor}`}
      aria-hidden="true"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    </div>
  );
}

/**
 * GuessHistory: Heardle tarzı 3 aşamalı tahmin geçmişi ve durum göstergesi bileşeni
 */
export function GuessHistory({ stages, currentStageIndex }: GuessHistoryProps) {
  // Eğer stages boş veya eksik gelirse MAX_STAGES adet varsayılan aşama oluştur
  const safeStages: Stage[] = Array.from({ length: MAX_STAGES }, (_, i) => {
    const existing = stages?.[i];
    if (existing) return existing;
    return {
      index: i,
      duration: STAGE_DURATIONS[i] ?? (i === 0 ? 1 : i === 1 ? 3 : 10),
      result: 'pending' as GuessResult,
      guess: null,
    };
  });

  return (
    <section
      className="w-full space-y-2.5 select-none"
      aria-label="Tahmin Geçmişi ve Aşamalar"
    >
      {safeStages.map((stage) => {
        const stageDuration =
          stage.duration || STAGE_DURATIONS[stage.index] || 10;
        const isCurrentActive =
          stage.index === currentStageIndex && stage.result === 'pending';
        const isPastPending =
          stage.index < currentStageIndex && stage.result === 'pending';
        const isFuturePending =
          stage.index > currentStageIndex && stage.result === 'pending';

        return (
          <div
            key={stage.index}
            className={`relative flex items-center justify-between gap-3 p-3 rounded-xl border text-sm transition-all duration-200 ${
              // 1. Doğru tahmin
              stage.result === 'correct'
                ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200 shadow-sm shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                : // 2. Yanlış tahmin
                stage.result === 'wrong'
                ? 'border-rose-500/50 bg-rose-950/20 text-rose-200 shadow-sm shadow-rose-950/40 ring-1 ring-rose-500/20'
                : // 3. Atlandı
                stage.result === 'skipped'
                ? 'border-neutral-700 bg-neutral-800/40 text-neutral-300'
                : // 4. Aktif aşama (kullanıcının şu an bulunduğu)
                isCurrentActive
                ? 'border-neutral-400 bg-neutral-900/90 text-neutral-100 ring-2 ring-neutral-400/30 shadow-md shadow-neutral-950/50'
                : // 5. Bekleyen aşama (henüz gelinmemiş)
                  'border-neutral-800/90 border-dashed bg-neutral-900/30 text-neutral-600'
            }`}
          >
            {/* Sol Alan: Aşama Numarası, Süre ve Rozet/İkon */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Aşama Durum Rozeti (İkon / Emoji) */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  stage.result === 'correct'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                    : stage.result === 'wrong'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                    : stage.result === 'skipped'
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    : isCurrentActive
                    ? 'bg-neutral-800 text-neutral-200 border border-neutral-500 animate-pulse'
                    : 'bg-neutral-900/60 text-neutral-700 border border-neutral-800'
                }`}
                aria-label={`Aşama ${stage.index + 1} durumu: ${stage.result}`}
              >
                {stage.result === 'correct' ? (
                  // Yeşil Rozet (🟩 / Onay İkonu)
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : stage.result === 'wrong' ? (
                  // Kırmızı Rozet (🟥 / Çarpı İkonu)
                  <svg
                    className="w-4 h-4 text-rose-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : stage.result === 'skipped' ? (
                  // Atlandı Rozeti (⬜ / İleri İkonu)
                  <svg
                    className="w-4 h-4 text-neutral-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
                    <line x1="19" y1="5" x2="19" y2="19" />
                  </svg>
                ) : isCurrentActive ? (
                  // Aktif Aşama Nabız Göstergesi
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                ) : (
                  // Bekleyen Aşama Numarası
                  <span className="font-mono">{stage.index + 1}</span>
                )}
              </div>

              {/* Aşama Süresi Etiketi (1s, 3s, 10s) */}
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium border flex-shrink-0 ${
                  stage.result === 'correct'
                    ? 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300'
                    : stage.result === 'wrong'
                    ? 'bg-rose-950/60 border-rose-800/40 text-rose-300'
                    : stage.result === 'skipped'
                    ? 'bg-neutral-800/80 border-neutral-700/60 text-neutral-400'
                    : isCurrentActive
                    ? 'bg-neutral-800 border-neutral-600 text-neutral-200 font-semibold'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-600'
                }`}
                title={`Aşama süresi: ${stageDuration} saniye`}
              >
                {stageDuration}s
              </span>

              {/* Albüm Kapağı (varsa) */}
              {stage.guess && (stage.result === 'correct' || stage.result === 'wrong') && (
                <TrackCover
                  coverUrl={stage.guess.albumCover}
                  title={stage.guess.title}
                  result={stage.result}
                />
              )}

              {/* Şarkı / Durum Metni */}
              <div className="min-w-0 flex flex-col justify-center">
                {stage.result === 'correct' ? (
                  <>
                    <span className="font-semibold text-emerald-100 truncate text-sm">
                      {stage.guess?.title || 'Doğru Tahmin'}
                    </span>
                    {stage.guess?.artist && (
                      <span className="text-xs text-emerald-300/80 truncate">
                        {stage.guess.artist}
                      </span>
                    )}
                  </>
                ) : stage.result === 'wrong' ? (
                  <>
                    <span className="font-semibold text-rose-100 truncate text-sm">
                      {stage.guess?.title || 'Yanlış Tahmin'}
                    </span>
                    {stage.guess?.artist && (
                      <span className="text-xs text-rose-300/80 truncate">
                        {stage.guess.artist}
                      </span>
                    )}
                  </>
                ) : stage.result === 'skipped' ? (
                  <span className="text-neutral-400 italic font-medium text-sm">
                    Atlandı
                  </span>
                ) : isCurrentActive ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-200 font-medium text-sm">
                      Tahmin bekleniyor...
                    </span>
                    <span className="hidden sm:inline text-xs text-neutral-400">
                      (Şarkıyı dinleyin)
                    </span>
                  </div>
                ) : (
                  <span className="text-neutral-600 font-mono text-sm tracking-wider">
                    —
                  </span>
                )}
              </div>
            </div>

            {/* Sağ Alan: Rozet & Durum Etiketi */}
            <div className="flex-shrink-0 flex items-center pl-2">
              {stage.result === 'correct' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span aria-hidden="true">🟩</span> Doğru
                </span>
              ) : stage.result === 'wrong' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span aria-hidden="true">🟥</span> Yanlış
                </span>
              ) : stage.result === 'skipped' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                  <span aria-hidden="true">⬜</span> Pas
                </span>
              ) : isCurrentActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-200 border border-neutral-500 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif
                </span>
              ) : (
                <span className="text-xs text-neutral-600 font-mono select-none px-2 py-0.5">
                  —
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default GuessHistory;
