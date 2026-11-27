'use client';

import type { MouseEvent } from 'react';
import { TOTAL_DURATION } from '@/constants/game';

export interface ProgressBarProps {
  currentTime: number;
  duration?: number;
  currentStageIndex?: number;
  isPlaying?: boolean;
  stageLimit?: number;
  stageStart?: number;
  onSeek?: (time: number) => void;
}

export function ProgressBar({ currentTime, duration = TOTAL_DURATION, isPlaying = false, stageLimit = TOTAL_DURATION, stageStart = 0, onSeek }: ProgressBarProps) {
  const limit = TOTAL_DURATION;
  const safeTime = Math.min(limit, Math.max(0, currentTime));
  const seekTo = (event: MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const raw = ((event.clientX - rect.left) / rect.width) * limit;
    onSeek(Math.min(stageLimit, Math.max(stageStart, raw)));
  };
  return (
    <div className="w-full space-y-2" aria-label="Şarkı ilerlemesi">
      <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />{safeTime.toFixed(1)}s</span>
        <span>{limit}s</span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer" onClick={seekTo}>
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-75" style={{ width: `${(safeTime / limit) * 100}%` }} />
        {[0.7, 3.7].map((mark) => <span key={mark} className="absolute top-0 bottom-0 w-px bg-neutral-950/90" style={{ left: `${mark * 10}%` }} />)}
      </div>
      <div className="relative h-4 text-[10px] text-neutral-500"><span className="absolute left-0">0s</span><span className="absolute -translate-x-1/2" style={{ left: '7%' }}>0.7s</span><span className="absolute -translate-x-1/2" style={{ left: '37%' }}>3.7s</span><span className="absolute right-0">10s</span></div>
    </div>
  );
}

export default ProgressBar;
