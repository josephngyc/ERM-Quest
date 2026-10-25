import React from 'react';
import { Play, BookOpen, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';

interface TitleScreenProps {
  selectedWorld: number;
  onSelectWorld: (worldNum: number) => void;
  onStartGame: () => void;
  onOpenNotes: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedWorld,
  onSelectWorld,
  onStartGame,
  onOpenNotes,
  isMuted,
  onToggleMute,
  highScore,
}) => {
  const worlds = [
    { num: 1, name: '1-1: ERM Foundations', topic: 'Topic 1: 3 Flows, BPR 3Ps & Data Silos', bg: 'from-sky-600 to-blue-700' },
    { num: 2, name: '1-2: AI & Process Maps', topic: 'Topic 2: ML, IoT, Blockchain & BPM Symbols', bg: 'from-emerald-700 to-teal-900' },
    { num: 3, name: '1-3: Sales Order Clouds', topic: 'Topic 3: 4 Roles & Fulfilment Steps', bg: 'from-indigo-600 to-purple-800' },
    { num: 4, name: '1-4: EOQ & MRP Castle', topic: 'Topic 4 & 6: Inventory, EOQ & Scheduling', bg: 'from-amber-700 to-red-900' },
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between items-center text-white bg-slate-950/90 overflow-hidden select-none p-4 sm:p-6">
      {/* Background Retro Grid & Animated Sky Gradient */}
      <div className="absolute inset-0 bg-radial from-blue-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Bar: High Score & Sound Toggle */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 font-pixel text-[10px] sm:text-xs">
        <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
          <Trophy className="w-3.5 h-3.5" />
          <span>TOP SCORE: {String(highScore).padStart(6, '0')}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 bg-slate-900/80 hover:bg-slate-800 text-emerald-400 rounded-lg border border-slate-700 hover:border-emerald-400 transition cursor-pointer flex items-center gap-1.5"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          <span className="hidden sm:inline">{isMuted ? 'UNMUTE' : 'MUTE'}</span>
        </button>
      </div>

      {/* Main Centerpiece: Bespoke Retro SVG Logo & Title Lockup */}
      <div className="flex flex-col items-center text-center z-10 my-auto max-w-2xl">
        {/* Inline Retro SVG Logo */}
        <div className="relative mb-3 group">
          <svg className="w-64 sm:w-80 h-28 drop-shadow-[0_10px_25px_rgba(239,68,68,0.3)]" viewBox="0 0 320 110" fill="none">
            {/* 3D Drop Shadows */}
            <text x="160" y="44" textAnchor="middle" fill="#7f1d1d" className="font-pixel text-[26px] font-black tracking-wider">SUPER MARIO</text>
            <text x="160" y="42" textAnchor="middle" fill="#ef4444" className="font-pixel text-[26px] font-black tracking-wider">SUPER MARIO</text>
            
            <text x="160" y="74" textAnchor="middle" fill="#1e3a8a" className="font-pixel text-[17px] font-black tracking-widest">ENTERPRISE QUEST</text>
            <text x="160" y="72" textAnchor="middle" fill="#38bdf8" className="font-pixel text-[17px] font-black tracking-widest">ENTERPRISE QUEST</text>
            
            <text x="160" y="98" textAnchor="middle" fill="#ca8a04" className="font-pixel text-[9px] tracking-widest">BBT2004 LECTURE ADVENTURE</text>
            <text x="160" y="97" textAnchor="middle" fill="#facc15" className="font-pixel text-[9px] tracking-widest">BBT2004 LECTURE ADVENTURE</text>

            {/* Retro Question Block emblem */}
            <rect x="18" y="14" width="28" height="28" rx="4" fill="#fc9838" stroke="#804000" strokeWidth="2" />
            <text x="32" y="34" textAnchor="middle" fill="#ffffff" className="font-pixel text-[15px] font-black">?</text>

            <rect x="274" y="14" width="28" height="28" rx="4" fill="#fc9838" stroke="#804000" strokeWidth="2" />
            <text x="288" y="34" textAnchor="middle" fill="#ffffff" className="font-pixel text-[15px] font-black">?</text>
          </svg>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed font-sans">
          Leap across classic Mario worlds where bumping <span className="text-amber-400 font-bold">? Question Blocks</span> and overcoming <span className="text-blue-400 font-bold">Knowledge Gates</span> tests your mastery of student notes on ERM, BPR, AI, Sales Orders, EOQ, and MRP!
        </p>

        {/* Primary Start CTA Button */}
        <button
          onClick={onStartGame}
          className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:via-amber-400 hover:to-yellow-300 text-slate-950 font-pixel text-xs sm:text-sm rounded-2xl font-black shadow-[0_0_30px_rgba(245,158,11,0.5)] transition transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-3 mb-6"
        >
          <Play className="w-4 h-4 fill-current group-hover:scale-110 transition" />
          <span>START ADVENTURE [SPACE / ENTER]</span>
        </button>

        {/* Level / Topic Selector */}
        <div className="w-full max-w-xl mb-4">
          <div className="font-pixel text-[10px] text-slate-400 mb-2 tracking-wider">
            SELECT ADVENTURE WORLD & LECTURE TOPIC:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {worlds.map(w => {
              const active = w.num === selectedWorld;
              return (
                <button
                  key={w.num}
                  onClick={() => onSelectWorld(w.num)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="font-pixel text-[9px] text-amber-400 mb-1">WORLD {w.num}</div>
                  <div className="text-[11px] font-bold text-slate-100 truncate">{w.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Open Notes Study Button */}
        <button
          onClick={onOpenNotes}
          className="flex items-center gap-2 text-xs text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 px-4 py-2 rounded-xl transition cursor-pointer font-sans font-semibold"
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Review BBT2004 Notes Cheatsheet & AI Generator</span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        </button>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="z-10 font-pixel text-[9px] sm:text-[10px] text-slate-400 tracking-wider text-center border-t border-slate-800/80 pt-3 w-full">
        WASD / ARROWS: Move · SPACE: Jump · SHIFT: Sprint · F / E: Fireball · ESC: Pause
      </div>
    </div>
  );
};
