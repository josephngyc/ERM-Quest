import React from 'react';
import { Volume2, VolumeX, BookOpen, Pause, Play, Sparkles } from 'lucide-react';

interface GameHUDProps {
  score: number;
  coins: number;
  world: string;
  lives: number;
  time: number;
  streak: number;
  correctCount: number;
  totalAnswered: number;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenNotes: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  coins,
  world,
  lives,
  time,
  streak,
  correctCount,
  totalAnswered,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenNotes,
}) => {
  const padNumber = (num: number, digits: number) => String(num).padStart(digits, '0');

  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between text-white font-pixel text-[10px] sm:text-xs z-20 pointer-events-none select-none bg-gradient-to-b from-black/60 via-black/20 to-transparent">
      {/* Left Cluster: Mario Score & Coins */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div>
          <div className="text-amber-400 font-bold tracking-wider text-[9px] sm:text-[11px]">MARIO</div>
          <div className="tabular-nums tracking-widest text-sm sm:text-base font-extrabold">{padNumber(score, 6)}</div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1.5 rounded border border-amber-500/30">
          <span className="text-amber-400 text-sm animate-pulse">🪙</span>
          <span className="tabular-nums text-amber-200">x{padNumber(coins, 2)}</span>
        </div>
      </div>

      {/* Middle Cluster: World & Topic & ERM Quiz Score */}
      <div className="text-center flex flex-col items-center">
        <div className="text-emerald-400 font-bold tracking-wider text-[9px] sm:text-[11px]">{world}</div>
        <div className="flex items-center gap-1.5 text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30 mt-0.5">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          <span>ERM: {correctCount}/{totalAnswered}</span>
          {streak > 1 && (
            <span className="text-amber-300 text-[9px] bg-amber-500/20 px-1 rounded">🔥x{streak}</span>
          )}
        </div>
      </div>

      {/* Right Cluster: Lives, Time & Action Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden sm:block text-right">
          <div className="text-rose-400 font-bold tracking-wider text-[9px] sm:text-[11px]">LIVES</div>
          <div className="tabular-nums text-rose-300 font-bold">❤️ x{lives}</div>
        </div>

        <div className="text-right">
          <div className="text-amber-400 font-bold tracking-wider text-[9px] sm:text-[11px]">TIME</div>
          <div className="tabular-nums text-white text-sm sm:text-base font-bold">{padNumber(time, 3)}</div>
        </div>

        {/* Buttons (pointer-events-auto) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onOpenNotes}
            title="Study Notes & Formulas"
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-blue-300 hover:text-white rounded border border-slate-700 hover:border-blue-400 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume' : 'Pause'}
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-amber-300 hover:text-white rounded border border-slate-700 hover:border-amber-400 transition cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 sm:p-2 bg-slate-900/80 hover:bg-slate-800 text-emerald-300 hover:text-white rounded border border-slate-700 hover:border-emerald-400 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
