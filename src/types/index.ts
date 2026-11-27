// Track — Deezer API'den dönen şarkı verisi
export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  albumCover: string;    // albüm kapağı URL'si
  previewUrl: string;    // 30 saniyelik önizleme MP3 URL'si
}

// Tahmin sonucu
export type GuessResult = 'correct' | 'wrong' | 'skipped' | 'pending';

// Oyun aşaması (her aşamada dinleme süresi artar)
export interface Stage {
  index: number;          // 0, 1, 2
  duration: number;       // saniye cinsinden (1, 3, 10)
  result: GuessResult;    // bu aşamadaki sonuç
  guess: Track | null;    // kullanıcının tahmini (varsa)
}

// Oyun durumu
export type GameStatus = 'loading' | 'ready' | 'playing' | 'won' | 'lost';

// Oyun modu
export type GameMode = 'daily' | 'unlimited';

// Oyun state'i (useGameState hook için)
export interface GameState {
  track: Track | null;         // doğru cevap olan şarkı
  stages: Stage[];              // 3 aşama
  currentStageIndex: number;    // aktif aşama (0-2)
  status: GameStatus;
  mode: GameMode;
  selectedTrack: Track | null;  // arama sonucu seçilen şarkı (henüz tahmin edilmedi)
}

// localStorage istatistikleri
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];  // [1. aşamada kazanma, 2. aşamada, 3. aşamada]
  lastPlayedDate: string;  // 'YYYY-MM-DD'
}

// Audio player hook dönüş tipi
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: (durationLimit?: number) => void;
  stop: () => void;
  loadTrack: (url: string) => void;
  playPreview: () => void;    // 30 saniyelik tam önizleme
  setVolume: (volume: number) => void;
}
