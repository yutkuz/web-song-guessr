import { GameStats, GameMode, GameState } from '@/types';
import {
  DAILY_STATS_KEY,
  UNLIMITED_STATS_KEY,
  DAILY_STATE_KEY,
} from '@/constants/game';

export interface DailyGameStateRecord {
  date: string;
  state: Partial<GameState>;
}

export const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0],
  lastPlayedDate: '',
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function getStorageKey(mode: GameMode): string {
  return mode === 'daily' ? DAILY_STATS_KEY : UNLIMITED_STATS_KEY;
}

/**
 * İlgili oyun modunun (daily veya unlimited) istatistiklerini localStorage'dan okur.
 * Kayıt yoksa veya sunucu ortamındaysa varsayılan INITIAL_STATS değerlerini döner.
 */
export function getStats(mode: GameMode): GameStats {
  if (typeof window === 'undefined') {
    return { ...INITIAL_STATS, distribution: [...INITIAL_STATS.distribution] };
  }

  const key = getStorageKey(mode);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { ...INITIAL_STATS, distribution: [...INITIAL_STATS.distribution] };
    }

    const parsed = JSON.parse(raw) as Partial<GameStats>;
    return {
      gamesPlayed: typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : INITIAL_STATS.gamesPlayed,
      gamesWon: typeof parsed.gamesWon === 'number' ? parsed.gamesWon : INITIAL_STATS.gamesWon,
      currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : INITIAL_STATS.currentStreak,
      maxStreak: typeof parsed.maxStreak === 'number' ? parsed.maxStreak : INITIAL_STATS.maxStreak,
      distribution:
        Array.isArray(parsed.distribution) && parsed.distribution.length === 3
          ? [...parsed.distribution]
          : [...INITIAL_STATS.distribution],
      lastPlayedDate: typeof parsed.lastPlayedDate === 'string' ? parsed.lastPlayedDate : INITIAL_STATS.lastPlayedDate,
    };
  } catch (error) {
    console.error(`Error reading stats for mode ${mode}:`, error);
    return { ...INITIAL_STATS, distribution: [...INITIAL_STATS.distribution] };
  }
}

/**
 * Oyun sonucunu (kazanma/kaybetme, aşama indeksi) ilgili modun istatistiklerine kaydeder.
 * Güncellenmiş istatistik nesnesini döndürür.
 */
export function saveGameResult(
  mode: GameMode,
  won: boolean,
  stageIndex: number
): GameStats {
  if (typeof window === 'undefined') {
    return { ...INITIAL_STATS, distribution: [...INITIAL_STATS.distribution] };
  }

  const stats = getStats(mode);
  const today = getTodayString();
  const yesterday = getYesterdayString();

  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;

    if (mode === 'daily') {
      if (stats.lastPlayedDate === yesterday) {
        stats.currentStreak += 1;
      } else if (stats.lastPlayedDate === today) {
        // Bugün zaten oynanmışsa streak değişmez
      } else {
        // İlk kez oynanıyor veya streak kırılmış
        stats.currentStreak = 1;
      }
    } else {
      // Unlimited modda her kazanmada streak artar
      stats.currentStreak += 1;
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

    if (stageIndex >= 0 && stageIndex < stats.distribution.length) {
      stats.distribution[stageIndex] += 1;
    }
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;

  try {
    const key = getStorageKey(mode);
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.error(`Error saving stats for mode ${mode}:`, error);
  }

  return stats;
}

/**
 * İlgili oyun modunun istatistiklerini localStorage'dan temizler/sıfırlar.
 */
export function resetStats(mode: GameMode): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(mode);
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error resetting stats for mode ${mode}:`, error);
  }
}

/**
 * Günün oyun durumunu okur. Kaydedilen tarih bugünün tarihi değilse null döner.
 */
export function getDailyGameState(): DailyGameStateRecord | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(DAILY_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as DailyGameStateRecord;
    const today = getTodayString();

    if (parsed.date !== today) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error reading daily game state:', error);
    return null;
  }
}

/**
 * Günün tarihi ile birlikte oyun durumunu DAILY_STATE_KEY anahtarıyla kaydeder.
 */
export function saveDailyGameState(state: Partial<GameState>): void {
  if (typeof window === 'undefined') return;

  try {
    const today = getTodayString();
    const payload: DailyGameStateRecord = {
      date: today,
      state,
    };
    localStorage.setItem(DAILY_STATE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Error saving daily game state:', error);
  }
}

/**
 * Günün oyun durumunu localStorage'dan siler.
 */
export function clearDailyGameState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(DAILY_STATE_KEY);
  } catch (error) {
    console.error('Error clearing daily game state:', error);
  }
}
