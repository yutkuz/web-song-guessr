'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ProgressBar } from '@/components/ProgressBar';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { GameControls } from '@/components/GameControls';
import { STAGE_DURATIONS } from '@/constants/game';

export default function GamePage() {
  const gameState = useGameState('unlimited');
  const audio = useAudioPlayer();
  const [volume, setVolume] = useState(0.5);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audio.setVolume(0.5);
  }, [audio.setVolume]);

  useEffect(() => {
    if (gameState.track?.previewUrl) audio.loadTrack(gameState.track.previewUrl);
  }, [gameState.track?.previewUrl, audio.loadTrack]);

  const stageStart = gameState.currentStageIndex === 0 ? 0 : STAGE_DURATIONS[gameState.currentStageIndex - 1];
  const duration = STAGE_DURATIONS[gameState.currentStageIndex] ?? 10;

  useEffect(() => {
    audio.seek(stageStart);
  }, [gameState.currentStageIndex, gameState.track?.id]);

  useEffect(() => {
    if (!gameState.roundComplete || !gameState.track) return;
    audio.seek(0);
    audio.play(10);
    previewTimer.current = setTimeout(() => {
      audio.stop();
      gameState.nextSong();
    }, 10000);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [gameState.roundComplete, gameState.track?.id]);

  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'lost') audio.stop();
  }, [gameState.status, audio.stop]);

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
        <div className="grid w-full max-w-[1080px] mx-auto gap-8 lg:grid-cols-[680px_360px] lg:justify-center lg:items-start">
        <div className="flex w-full min-w-0 flex-col gap-6">
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

          {!isOver && <div className="space-y-4 pt-2">
            <SearchAutocomplete key={gameState.currentStageIndex} disabled={gameState.roundComplete} onSelect={gameState.selectTrack} placeholder="Şarkı veya sanatçı ara..." />
            <GameControls disabled={gameState.roundComplete} isPlaying={audio.isPlaying && !gameState.roundComplete} currentStageIndex={gameState.currentStageIndex} hasSelectedTrack={gameState.selectedTrack !== null} gameStatus={audio.isPlaying ? 'playing' : gameState.status} onPlay={() => audio.play(duration)} onStop={audio.stop} onSkip={() => { audio.stop(); gameState.skipStage(); }} onGuess={() => { audio.stop(); gameState.submitGuess(); }} />
          </div>}

          {isOver && <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-4"><h2 className="text-xl font-bold text-emerald-300">Tebrikler, 5 şarkıyı tamamladın! 🎉</h2><button onClick={gameState.resetGame} className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950">Yeni Oyun</button></div>}
        </div>
        {gameState.roundComplete && !isOver && <aside className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-5 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="aspect-square w-full bg-neutral-800">
              {gameState.track.albumCover ? <img src={gameState.track.albumCover} alt={`${gameState.track.artist} - ${gameState.track.title}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-6xl">🎵</div>}
            </div>
            <div className="p-5"><p className="text-xs uppercase tracking-wider text-neutral-500">Cevap</p><h2 className="mt-1 text-2xl font-bold text-white">{gameState.track.title}</h2><p className="mt-1 text-lg text-neutral-300">{gameState.track.artist}</p>{gameState.track.album && <p className="mt-1 text-sm text-neutral-500">{gameState.track.album}</p>}</div>
          </div>
          <button onClick={() => audio.isPlaying ? audio.stop() : audio.play(10)} className="w-full rounded-xl bg-emerald-500 py-4 text-lg font-semibold text-neutral-950">{audio.isPlaying ? 'Durdur' : '▶ Önizlemeyi oynat'}</button>
          <button onClick={() => { if (previewTimer.current) clearTimeout(previewTimer.current); audio.stop(); gameState.nextSong(); }} className="w-full rounded-xl border border-neutral-700 bg-neutral-800 py-3 font-semibold text-white hover:bg-neutral-700">Sonraki şarkı</button>
        </aside>}
        </div>
      )}
    </div>
  );
}
