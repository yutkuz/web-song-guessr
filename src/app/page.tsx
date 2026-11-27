'use client';

import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ProgressBar } from '@/components/ProgressBar';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { GameControls } from '@/components/GameControls';
import { STAGE_DURATIONS } from '@/constants/game';

export default function GamePage() {
  const gameState = useGameState('unlimited');
  const audio = useAudioPlayer();
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (gameState.track?.previewUrl) audio.loadTrack(gameState.track.previewUrl);
  }, [gameState.track?.previewUrl, audio.loadTrack]);

  const stageStart = gameState.currentStageIndex === 0 ? 0 : STAGE_DURATIONS[gameState.currentStageIndex - 1];
  const duration = STAGE_DURATIONS[gameState.currentStageIndex] ?? 10;

  useEffect(() => {
    audio.seek(stageStart);
  }, [gameState.currentStageIndex, gameState.track?.id]);

  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'lost') audio.stop();
  }, [gameState.status, audio.stop]);

  const isActive = gameState.status === 'ready' || gameState.status === 'playing';
  const isOver = gameState.status === 'won' || gameState.status === 'lost';
  const changeVolume = (value: number) => { setVolume(value); audio.setVolume(value); };

  return (
    <div className="relative w-full flex-1 flex flex-col gap-6 py-4 select-none">
      {gameState.feedback && <div className={`fixed inset-0 z-50 pointer-events-none ${gameState.feedback === 'correct' ? 'bg-emerald-400/30' : 'bg-rose-400/30'} animate-pulse`} aria-hidden="true" />}
      {gameState.isLoading && <div className="flex-1 grid place-items-center text-neutral-400">Şarkı hazırlanıyor...</div>}
      {!gameState.isLoading && gameState.error && !gameState.track && (
        <div role="alert" className="m-auto text-center space-y-4">
          <p className="text-rose-300">{gameState.error}</p>
          <button onClick={() => gameState.resetGame()} className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-neutral-950">Tekrar Dene</button>
        </div>
      )}
      {!gameState.isLoading && gameState.track && (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label={`${3 - gameState.currentStageIndex} hak kaldı`}>
              <span className="text-xs text-neutral-400">Kalan hak:</span>
              <div className="flex items-center gap-1.5 text-2xl">
              {[0, 1, 2].map((heart) => (
                <span key={heart} className={heart < 3 - gameState.currentStageIndex ? 'text-rose-400' : 'text-neutral-700'}>♥</span>
              ))}
              </div>
            </div>
            <span className="text-sm font-medium text-neutral-400">Şarkı {gameState.songNumber}/{gameState.totalSongs}</span>
            <label className="flex items-center gap-2 text-neutral-400" aria-label="Ses seviyesi">
              <span className="text-lg">🔊</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} className="w-24 accent-emerald-500" />
            </label>
          </div>

          <ProgressBar currentTime={audio.currentTime} duration={10} currentStageIndex={gameState.currentStageIndex} stageStart={stageStart} stageLimit={duration} isPlaying={audio.isPlaying} onSeek={audio.seek} />

          {isActive && <div className="space-y-4 pt-2">
            <SearchAutocomplete key={gameState.currentStageIndex} onSelect={gameState.selectTrack} placeholder="Şarkı veya sanatçı ara..." />
            <GameControls isPlaying={audio.isPlaying} currentStageIndex={gameState.currentStageIndex} hasSelectedTrack={gameState.selectedTrack !== null} gameStatus={audio.isPlaying ? 'playing' : gameState.status} onPlay={() => audio.play(duration)} onStop={audio.stop} onSkip={() => { audio.stop(); gameState.skipStage(); }} onGuess={() => { audio.stop(); gameState.submitGuess(); }} />
          </div>}

          {isOver && <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-4"><h2 className="text-xl font-bold text-emerald-300">Tebrikler, 5 şarkıyı tamamladın! 🎉</h2><button onClick={gameState.resetGame} className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950">Yeni Oyun</button></div>}
        </>
      )}
    </div>
  );
}
