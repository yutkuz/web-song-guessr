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
  const [showVolume, setShowVolume] = useState(false);
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
  const revealVolume = () => {
    setShowVolume(true);
    window.setTimeout(() => setShowVolume(false), 1600);
  };

  return (
    <div className="relative w-full flex-1 flex flex-col gap-6 py-2 select-none">
      {gameState.feedback && <div className={`fixed inset-0 z-50 pointer-events-none ${gameState.feedback === 'correct' ? 'bg-emerald-400/30' : 'bg-rose-400/30'} motion-safe:animate-pulse`} aria-hidden="true" />}
      {gameState.isLoading && <div className="flex-1 grid place-items-center text-neutral-400">Şarkı hazırlanıyor...</div>}
      {!gameState.isLoading && gameState.error && !gameState.track && (
        <div role="alert" className="m-auto text-center space-y-4">
          <p className="text-rose-300">{gameState.error}</p>
          <button onClick={() => gameState.resetGame()} className="rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-neutral-950">Tekrar Dene</button>
        </div>
      )}
      {!gameState.isLoading && gameState.track && (
        <div className="relative w-full min-h-[520px]">
        <div className="float-in mx-auto flex w-full max-w-[760px] min-w-0 flex-col gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Kulaklarını <span className="text-gradient">test et.</span></h2><p className="mt-1 text-sm text-neutral-400">Kısa bir kesit dinle, şarkıyı bilmeye çalış.</p></div>
            </div>
          </div>
          <div className="glass-panel neon-ring rounded-[28px] p-4 sm:p-7">
          <div className="game-status-row flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" aria-label={`${3 - gameState.currentStageIndex} hak kaldı`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Hakların</span>
              <div className="flex items-center gap-1.5 text-2xl">
              {[0, 1, 2].map((heart) => (
                <span key={heart} className={heart < 3 - gameState.currentStageIndex ? 'text-rose-400' : 'text-neutral-700'}>♥</span>
              ))}
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-xs font-semibold text-neutral-300">Şarkı {gameState.songNumber}<span className="text-neutral-600"> / </span>{gameState.totalSongs}</span>
            <label htmlFor="volume-slider" className="game-volume relative flex items-center gap-2 text-neutral-400" onClick={revealVolume} onFocus={revealVolume}>
              {showVolume && <span className="absolute -top-6 right-0 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-200">{Math.round(volume * 100)}%</span>}
              <span className="text-lg">🔊</span>
              <input id="volume-slider" type="range" min="0" max="1" step="0.01" value={volume} aria-valuetext={`${Math.round(volume * 100)}%`} onChange={(e) => { changeVolume(Number(e.target.value)); revealVolume(); }} className="w-24 accent-emerald-500" />
            </label>
          </div>

          <ProgressBar currentTime={audio.currentTime} duration={10} currentStageIndex={gameState.currentStageIndex} stageStart={stageStart} stageLimit={duration} isPlaying={audio.isPlaying} onSeek={audio.seek} />

          {!isOver && <div className="space-y-4 pt-2">
            <SearchAutocomplete key={gameState.currentStageIndex} disabled={gameState.roundComplete} onSelect={gameState.selectTrack} placeholder="Şarkı veya sanatçı ara..." />
            <GameControls disabled={gameState.roundComplete} isPlaying={audio.isPlaying && !gameState.roundComplete} currentStageIndex={gameState.currentStageIndex} hasSelectedTrack={gameState.selectedTrack !== null} gameStatus={audio.isPlaying ? 'playing' : gameState.status} onPlay={() => audio.play(duration)} onStop={audio.stop} onSkip={() => { audio.stop(); gameState.skipStage(); }} onGuess={() => { audio.stop(); gameState.submitGuess(); }} />
          </div>}

          {isOver && <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-6 text-center space-y-4"><h2 className="text-xl font-bold text-emerald-300">Tebrikler, 5 şarkıyı tamamladın! 🎉</h2><button onClick={gameState.resetGame} className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-neutral-950">Yeni Oyun</button></div>}
          </div>
        </div>
        {gameState.roundComplete && !isOver && <aside className="glass-panel rounded-[26px] p-5 space-y-5 lg:absolute lg:left-[calc(50%+400px)] lg:top-0 lg:w-[360px]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
            <div className="noise aspect-square w-full bg-gradient-to-br from-indigo-950 to-neutral-900">
              {gameState.track.albumCover ? <img src={gameState.track.albumCover} alt={`${gameState.track.artist} - ${gameState.track.title}`} width={500} height={500} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-6xl">🎵</div>}
            </div>
            <div className="p-5"><p className="text-xs uppercase tracking-wider text-neutral-500">Cevap</p><h2 className="mt-1 text-2xl font-bold text-white">{gameState.track.title}</h2><p className="mt-1 text-lg text-neutral-300">{gameState.track.artist}</p>{gameState.track.album && <p className="mt-1 text-sm text-neutral-500">{gameState.track.album}</p>}</div>
          </div>
          <button onClick={() => audio.isPlaying ? audio.stop() : audio.play(10)} className="w-full rounded-xl bg-emerald-400 py-4 text-lg font-semibold text-[#07120f] shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300">{audio.isPlaying ? 'Durdur' : '▶ Önizlemeyi oynat'}</button>
          <button onClick={() => { if (previewTimer.current) clearTimeout(previewTimer.current); audio.stop(); gameState.nextSong(); }} className="w-full rounded-xl border border-white/10 bg-white/[.06] py-3 font-semibold text-white transition hover:bg-white/[.1]">Sonraki şarkı</button>
        </aside>}
        </div>
      )}
    </div>
  );
}
