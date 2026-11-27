'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PREVIEW_DURATION, TOTAL_DURATION } from '@/constants/game';
import { AudioPlayerState } from '@/types';

export interface UseAudioPlayerOptions {
  targetDuration?: number;
  initialUrl?: string;
  duration?: number;
}

/**
 * useAudioPlayer Hook
 *
 * Sadece yerleşik Baseline HTMLAudioElement ve requestAnimationFrame kullanır.
 * Harici ses kütüphaneleri (Howler.js, Tone.js vb.) KESİNLİKLE kullanılmaz.
 *
 * Özellikler:
 * - 0.0s Başlangıç Kuralı: Ses oynatıldığında her zaman 0.0s'den başlar.
 * - requestAnimationFrame: timeupdate yerine akıcı 60fps RAF döngüsü ile pozisyon takibi.
 * - Gecikmesiz Aşama Süre Sınırı: Hedef süreye (örn. 1s, 3s, 10s) ulaşıldığında ses anında durdurulur.
 * - 30s Önizleme: Doğru tahmin veya oyun sonu için playPreview() desteği.
 * - Autoplay Uyumu & Temizlik: Unmount durumunda RAF iptal edilir, ses durdurulur ve bellek temizlenir.
 */
export function useAudioPlayer(
  param1?: number | string | UseAudioPlayerOptions,
  param2?: number | string
): AudioPlayerState {
  // Parametre ayrıştırma (targetDuration, url veya options nesnesi)
  let initialTargetDuration = 1;
  let initialUrl = '';
  let initialDuration = TOTAL_DURATION;

  if (typeof param1 === 'number') {
    initialTargetDuration = param1;
    if (typeof param2 === 'string') {
      initialUrl = param2;
    }
  } else if (typeof param1 === 'string') {
    initialUrl = param1;
    if (typeof param2 === 'number') {
      initialTargetDuration = param2;
    }
  } else if (param1 && typeof param1 === 'object') {
    if (typeof param1.targetDuration === 'number') {
      initialTargetDuration = param1.targetDuration;
    }
    if (typeof param1.initialUrl === 'string') {
      initialUrl = param1.initialUrl;
    }
    if (typeof param1.duration === 'number') {
      initialDuration = param1.duration;
    }
  }

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [volume, setVolumeState] = useState<number>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const targetDurationRef = useRef<number>(initialTargetDuration);
  const targetLimitRef = useRef<number>(initialTargetDuration);

  // Güncel hedef aşama süresini senkronize et
  useEffect(() => {
    targetDurationRef.current = initialTargetDuration;
  }, [initialTargetDuration]);

  // Audio örneğini al veya oluştur
  const getAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = volume;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // Ses durdurma ve sıfırlama
  const stop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // Audio henüz hazır olmayabilir
      }
    }

    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Şarkı yükleme
  const loadTrack = useCallback(
    (url: string) => {
      stop();
      const audio = getAudio();
      if (!audio) return;

      if (url) {
        audio.src = url;
        audio.load();
      } else {
        audio.removeAttribute('src');
        audio.load();
      }

      setCurrentTime(0);
      setIsPlaying(false);
    },
    [getAudio, stop]
  );

  // Ses oynatma (0.0s başlangıç kuralı ve RAF döngüsü)
  const play = useCallback(
    (durationLimit?: number) => {
      const audio = getAudio();
      if (!audio || !audio.src) {
        return;
      }

      // Var olan RAF döngüsünü temizle
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const limit = durationLimit ?? targetDurationRef.current;
      targetLimitRef.current = limit;

      // Süre sınırına göre duration ayarla (30s önizleme vs. 10s progress bar)
      if (limit > TOTAL_DURATION) {
        setDuration(limit);
      } else {
        setDuration(TOTAL_DURATION);
      }

      // Kullanıcı çubuktan bir noktaya sardıysa oradan devam et.
      if (audio.currentTime >= limit || audio.currentTime < 0) audio.currentTime = 0;
      setCurrentTime(audio.currentTime);

      // requestAnimationFrame döngüsü
      const tick = () => {
        const a = audioRef.current;
        if (!a) return;

        // Aşama süresi sınırına veya şarkı sonuna ulaşıldığında anında durdur
        if (a.currentTime >= targetLimitRef.current || a.ended) {
          a.pause();
          setCurrentTime(targetLimitRef.current);
          setIsPlaying(false);
          rafIdRef.current = null;
          return;
        }

        // Akıcı pozisyon güncellemesi
        setCurrentTime(a.currentTime);
        rafIdRef.current = requestAnimationFrame(tick);
      };

      const playPromise = audio.play();
      setIsPlaying(true);
      rafIdRef.current = requestAnimationFrame(tick);

      if (playPromise !== undefined) {
        playPromise.catch((err: unknown) => {
          console.warn('Audio playback was prevented or failed:', err);
          setIsPlaying(false);
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
        });
      }
    },
    [getAudio]
  );

  // 30 Saniyelik Tam Önizleme
  const playPreview = useCallback(() => {
    setDuration(PREVIEW_DURATION);
    play(PREVIEW_DURATION);
  }, [play]);

  const setVolume = useCallback((nextVolume: number) => {
    const safeVolume = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(safeVolume);
    if (audioRef.current) audioRef.current.volume = safeVolume;
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const safeTime = Math.min(TOTAL_DURATION, Math.max(0, time));
    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  // initialUrl varsa ilk yükleme
  useEffect(() => {
    if (initialUrl) {
      loadTrack(initialUrl);
    }
  }, [initialUrl, loadTrack]);

  // Yaşam döngüsü ve ses sonlanma dinleyicisi + Temizlik (Cleanup)
  useEffect(() => {
    const audio = getAudio();
    if (!audio) return;

    const handleEnded = () => {
      stop();
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);

      // RAF iptal et
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Sesi durdur ve kaynağı serbest bırak
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [getAudio, stop]);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    stop,
    loadTrack,
    playPreview,
    setVolume,
    seek,
  };
}

export default useAudioPlayer;
