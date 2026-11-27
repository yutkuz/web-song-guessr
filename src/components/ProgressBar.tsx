'use client';

import { TOTAL_DURATION } from '@/constants/game';

export interface ProgressBarProps {
  currentTime: number;
  duration?: number;
  currentStageIndex?: number;
  isPlaying?: boolean;
}

export function ProgressBar({ currentTime, duration = TOTAL_DURATION, isPlaying = false }: ProgressBarProps) {
  const limit = duration > 0 ? duration : TOTAL_DURATION;
  const safeTime = Math.min(limit, Math.max(0, currentTime));
  return (
    <div className="w-full space-y-2" aria-label="Şarkı ilerlemesi">
      <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />{safeTime.toFixed(1)}s</span>
        <span>{limit}s</span>
      </div>
      <div className="h-3 w-full rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-75" style={{ width: `${(safeTime / limit) * 100}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
