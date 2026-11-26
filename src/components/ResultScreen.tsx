'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track, Stage, GameStats, GameMode } from '@/types';

export interface ResultScreenProps {
  track: Track;
  stages: Stage[];
  won: boolean;
  mode: GameMode;
  stats: GameStats;
  onPlayPreview?: () => void;
  isPlayingPreview?: boolean;
  onPlayAgain?: () => void;
}

export function ResultScreen({
  track,
  stages,
  won,
  mode,
  stats,
  onPlayPreview,
  isPlayingPreview = false,
  onPlayAgain,
}: ResultScreenProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  // Doğru tahmin edilen aşama indeksi (0, 1, 2)
  const correctStageIndex = stages.findIndex((s) => s.result === 'correct');
  const stageNumber = correctStageIndex !== -1 ? correctStageIndex + 1 : 1;

  // Aşama emoji dizilimi (3 aşama)
  const emojiString = Array.from({ length: 3 }, (_, i) => {
    const result = stages[i]?.result;
    if (result === 'correct') return '🟩';
    if (result === 'wrong') return '🟥';
    return '⬜';
  }).join('');

  // Paylaşım metni şablonu
  const scoreText = won ? `${stageNumber}/3` : 'X/3';
  const modeLabel = mode === 'daily' ? 'Günün Şarkısı' : 'Sınırsız';
  const shareText = `Web Song Guessr 🎵 (${modeLabel})\n${scoreText}\n${emojiString}`;

  // Panoya Kopyalama Fonksiyonu
  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch (err) {
      console.error('Panoya kopyalama başarısız oldu:', err);
    }
  };

  // 2 saniye sonra "Kopyalandı!" durumunu sıfırla
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Kazanma oranı (%)
  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // Aşama dağılımı grafiği için maksimum değer
  const distribution = stats.distribution ?? [0, 0, 0];
  const maxDistributionVal = Math.max(...distribution, 1);

  return (
    <div
      className="w-full max-w-lg mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 text-neutral-100 select-none"
      aria-label="Oyun Sonuç Ekranı"
    >
      {/* 1. Başlık & Kazanma/Kaybetme Durumu */}
      <div className="text-center space-y-1.5">
        {won ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm sm:text-base font-semibold shadow-sm">
            <span>Tebrikler! {stageNumber}. aşamada bildiniz 🎉</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-sm sm:text-base font-semibold shadow-sm">
            <span>Maalesef bilemediniz 😔 Doğru şarkı:</span>
          </div>
        )}
      </div>

      {/* 2. Şarkı ve Albüm Bilgisi Kartı */}
      <div className="flex items-center gap-4 p-3.5 sm:p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 shadow-inner">
        {/* Albüm Kapağı */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-neutral-700/60 bg-neutral-900 flex items-center justify-center">
          {track.albumCover && !imageError ? (
            <img
              src={track.albumCover}
              alt={`${track.artist} - ${track.title}`}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover aspect-square"
              loading="lazy"
            />
          ) : (
            <svg
              className="w-10 h-10 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          )}
        </div>

        {/* Şarkı Başlığı, Sanatçı ve Albüm */}
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className="text-base sm:text-lg font-bold text-white truncate"
            title={track.title}
          >
            {track.title}
          </h2>
          <p
            className="text-sm font-medium text-neutral-300 truncate"
            title={track.artist}
          >
            {track.artist}
          </p>
          {track.album && (
            <p
              className="text-xs text-neutral-400 truncate"
              title={track.album}
            >
              {track.album}
            </p>
          )}
        </div>
      </div>

      {/* 3. 30 Saniyelik Tam Önizleme Butonu */}
      {onPlayPreview && (
        <button
          type="button"
          onClick={onPlayPreview}
          aria-label={
            isPlayingPreview
              ? 'Önizlemeyi durdur'
              : '30 saniyelik tam önizlemeyi dinle'
          }
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 ${
            isPlayingPreview
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-950/40 ring-1 ring-amber-400/40 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-950/40 ring-1 ring-emerald-400/40'
          }`}
        >
          {isPlayingPreview ? (
            <>
              {/* Pause İkonu */}
              <svg
                className="w-5 h-5 fill-current flex-shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                <rect x="14" y="5" width="4" height="14" rx="1.5" />
              </svg>
              <span>Önizlemeyi Durdur</span>
            </>
          ) : (
            <>
              {/* Play İkonu */}
              <svg
                className="w-5 h-5 fill-current flex-shrink-0"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              <span>30 Saniyelik Önizlemeyi Dinle</span>
            </>
          )}
        </button>
      )}

      {/* 4. Emoji Tablosu & Panoya Kopyalama */}
      <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col items-center gap-3">
        {/* Görsel Emoji Gösterimi */}
        <div
          className="flex items-center gap-2 text-2xl tracking-widest py-1"
          aria-label={`Aşama sonuçları: ${emojiString}`}
        >
          {stages.slice(0, 3).map((stage, idx) => {
            const res = stage.result;
            return (
              <span
                key={idx}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-neutral-900 border border-neutral-800"
              >
                {res === 'correct' ? '🟩' : res === 'wrong' ? '🟥' : '⬜'}
              </span>
            );
          })}
        </div>

        {/* Panoya Kopyala / Paylaş Butonu */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Sonucu Panoya Kopyala"
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 border transition-all duration-200 cursor-pointer ${
            copied
              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'bg-neutral-800/90 hover:bg-neutral-700 active:bg-neutral-800 text-neutral-200 hover:text-white border-neutral-700 hover:border-neutral-600 shadow-sm'
          }`}
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4 text-emerald-400 flex-shrink-0"
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
              <span>Kopyalandı! ✓</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 text-neutral-400 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Sonucu Kopyala / Paylaş</span>
            </>
          )}
        </button>
      </div>

      {/* 5. İstatistik Özeti Kartı */}
      <div className="space-y-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 text-center">
          İstatistikler
        </h3>

        {/* 4'lü İstatistik Izgarası */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
            <div className="text-lg sm:text-xl font-bold text-white">
              {stats.gamesPlayed}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              Oyun
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
            <div className="text-lg sm:text-xl font-bold text-white">
              %{winRate}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              Kazanma
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
            <div className="text-lg sm:text-xl font-bold text-white">
              {stats.currentStreak}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              Seri
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80">
            <div className="text-lg sm:text-xl font-bold text-white">
              {stats.maxStreak}
            </div>
            <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              En İyi
            </div>
          </div>
        </div>

        {/* Aşama Dağılımı Çubuk Grafiği */}
        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
          <h4 className="text-[11px] font-medium text-neutral-400">
            Aşama Dağılımı
          </h4>
          <div className="space-y-1.5 text-xs">
            {[0, 1, 2].map((idx) => {
              const count = distribution[idx] ?? 0;
              const isCurrentWinStage = won && correctStageIndex === idx;
              const widthPercent = Math.max(
                Math.round((count / maxDistributionVal) * 100),
                count > 0 ? 12 : 8
              );

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-3 text-neutral-400 font-mono text-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 bg-neutral-900 rounded-md overflow-hidden h-5 flex items-center">
                    <div
                      style={{ width: `${widthPercent}%` }}
                      className={`h-full flex items-center justify-end px-2 transition-all duration-300 font-semibold text-[11px] ${
                        isCurrentWinStage
                          ? 'bg-emerald-500 text-neutral-950'
                          : count > 0
                          ? 'bg-neutral-700 text-neutral-200'
                          : 'bg-neutral-800/60 text-neutral-500'
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Mod Aksiyonları */}
      <div className="pt-1">
        {mode === 'unlimited' ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3 px-4 rounded-xl font-semibold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-neutral-950 text-base shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Yeni Şarkı / Tekrar Oyna</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-center space-y-3">
            <p className="text-sm text-neutral-300">
              Günün şarkısı tamamlandı! Yarın yeni bir şarkı için tekrar gelin ⏳
            </p>
            <Link
              href="/unlimited"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-800 text-white border border-neutral-700 hover:border-neutral-600 transition-colors text-sm cursor-pointer shadow-sm"
            >
              <span>Sınırsız Modda Oyna 🚀</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultScreen;
