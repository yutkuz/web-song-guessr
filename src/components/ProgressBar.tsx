'use client';

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

const MARKS = [0.7, 3.7];

export function ProgressBar({
  currentTime,
  isPlaying = false,
  stageLimit = TOTAL_DURATION,
  stageStart = 0,
  onSeek,
}: ProgressBarProps) {
  const safeTime = Math.min(TOTAL_DURATION, Math.max(0, currentTime));
  const fill = `${(safeTime / TOTAL_DURATION) * 100}%`;

  const handleChange = (value: number) => {
    onSeek?.(Math.min(stageLimit, Math.max(stageStart, value)));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-emerald-400 motion-safe:animate-pulse' : 'bg-neutral-600'}`} />
          {safeTime.toFixed(1)}s
        </span>
        <span>10s</span>
      </div>

      <div className="relative h-7 flex items-center">
        <div className="absolute inset-x-0 h-3 rounded-full border border-neutral-800 bg-neutral-900" />
        <div className="absolute left-0 h-3 rounded-full bg-emerald-500 pointer-events-none" style={{ width: fill }} />
        {MARKS.map((mark) => (
          <span key={mark} className="absolute top-2 h-3 w-px bg-neutral-950 pointer-events-none" style={{ left: `${mark * 10}%` }} />
        ))}
        <input
          type="range"
          min={0}
          max={TOTAL_DURATION}
          step={0.01}
          value={safeTime}
          onChange={(event) => handleChange(Number(event.target.value))}
          aria-label="Şarkı içinde ilerle"
          className="progress-range relative z-10 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-4"
        />
      </div>

      <div className="relative h-4 text-[10px] text-neutral-500">
        <span className="absolute left-0">0s</span>
        <span className="absolute -translate-x-1/2" style={{ left: '7%' }}>0.7s</span>
        <span className="absolute -translate-x-1/2" style={{ left: '37%' }}>3.7s</span>
        <span className="absolute right-0">10s</span>
      </div>
    </div>
  );
}

export default ProgressBar;
