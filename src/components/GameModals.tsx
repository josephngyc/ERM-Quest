import React from 'react';
import { Play, RotateCcw, Home, Trophy, BookOpen, ArrowRight, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PauseModalProps {
  worldName: string;
  topicTitle: string;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  worldName,
  topicTitle,
  onResume,
  onRestart,
  onHome,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border-4 border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center text-white shadow-2xl">
        <div className="font-pixel text-lg text-amber-400 mb-2">PAUSED</div>
        <div className="font-pixel text-xs text-blue-300 mb-1">{worldName}</div>
        <p className="text-xs text-slate-400 mb-6 font-sans">{topicTitle}</p>

        <div className="space-y-3 font-pixel text-xs">
          <button
            onClick={onResume}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME [ESC]</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART LEVEL</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>TITLE SCREEN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  worldName: string;
  onRetry: () => void;
  onHome: () => void;
  onOpenNotes: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  correctAnswers,
  totalQuestions,
  worldName,
  onRetry,
  onHome,
  onOpenNotes,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-4 border-rose-600 rounded-2xl p-6 sm:p-7 max-w-md w-full text-center text-white shadow-2xl">
        <div className="font-pixel text-2xl text-rose-500 mb-2 animate-pulse">GAME OVER</div>
        <div className="font-pixel text-xs text-slate-400 mb-4">{worldName}</div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 space-y-2">
          <div className="flex justify-between font-pixel text-xs text-slate-300">
            <span>FINAL SCORE:</span>
            <span className="text-amber-400">{score}</span>
          </div>
          <div className="flex justify-between font-pixel text-xs text-slate-300">
            <span>ERM QUESTIONS:</span>
            <span className="text-emerald-400">{correctAnswers} / {totalQuestions}</span>
          </div>
        </div>

        <div className="space-y-3 font-pixel text-xs">
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN [ENTER]</span>
          </button>

          <button
            onClick={onOpenNotes}
            className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-xl flex items-center justify-center gap-2 border border-blue-500/40 transition cursor-pointer font-sans font-semibold text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>Review Study Notes & Formulas</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer"
          >
            RETURN TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  coins: number;
  timeRemaining: number;
  correctAnswers: number;
  totalQuestions: number;
  worldNum: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  timeRemaining,
  correctAnswers,
  totalQuestions,
  worldNum,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100;

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center text-white shadow-2xl">
        <div className="inline-flex p-3 bg-amber-400/20 text-amber-400 rounded-full border border-amber-400 mb-3 animate-bounce">
          <Award className="w-8 h-8" />
        </div>

        <div className="font-pixel text-xl sm:text-2xl text-amber-300 mb-1">
          STAGE CLEAR!
        </div>
        <p className="text-xs sm:text-sm text-emerald-400 font-pixel mb-5">
          ERM ENTERPRISE MISSION ACCOMPLISHED!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6 text-left">
          <div className="p-2.5 bg-slate-900/60 rounded-lg">
            <div className="text-[10px] font-pixel text-slate-400">TOTAL SCORE</div>
            <div className="text-lg font-pixel text-amber-400 mt-1">{score}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg">
            <div className="text-[10px] font-pixel text-slate-400">COINS COLLECTED</div>
            <div className="text-lg font-pixel text-yellow-300 mt-1">🪙 x{coins}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg">
            <div className="text-[10px] font-pixel text-slate-400">ERM KNOWLEDGE</div>
            <div className="text-lg font-pixel text-emerald-400 mt-1">{accuracy}%</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg">
            <div className="text-[10px] font-pixel text-slate-400">QUESTIONS SOLVED</div>
            <div className="text-lg font-pixel text-blue-400 mt-1">{correctAnswers}/{totalQuestions}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 font-pixel text-xs">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer text-sm"
            >
              <span>ADVANCE TO WORLD 1-{worldNum + 1}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-300 rounded-xl text-xs">
              🎉 Congratulations! You have conquered all BBT2004 Enterprise Resource Management worlds!
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>
            <button
              onClick={onHome}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>TITLE SCREEN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
