import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../data/ermNotesData';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, Award, Lock, Sparkles } from 'lucide-react';

interface QuestionModalProps {
  question: QuizQuestion;
  isGate?: boolean;
  onAnswer: (correct: boolean) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  isGate = false,
  onAnswer,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Keyboard shortcut listener for 1, 2, 3, 4, Enter, Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasSubmitted) {
        if (e.key === '1' && question.options[0]) handleSelect(0);
        else if (e.key === '2' && question.options[1]) handleSelect(1);
        else if (e.key === '3' && question.options[2]) handleSelect(2);
        else if (e.key === '4' && question.options[3]) handleSelect(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault();
          onAnswer(selectedIndex === question.correctIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, selectedIndex, question]);

  const handleSelect = (index: number) => {
    if (hasSubmitted) return;
    setSelectedIndex(index);
    setHasSubmitted(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#facc15', '#ec4899'],
      });
    }
  };

  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-4 border-amber-400 rounded-2xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden">
        {/* Retro Header Accent */}
        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {isGate ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-900/80 border border-blue-400 text-blue-300 rounded font-pixel text-[10px]">
                <Lock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>KNOWLEDGE GATE CHALLENGE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/80 border border-amber-400 text-amber-300 rounded font-pixel text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>? BLOCK QUESTION CHALLENGE</span>
              </div>
            )}
          </div>

          <div className="text-slate-400 font-pixel text-[9px] uppercase tracking-wider">
            {question.topicTitle}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-5">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            {question.question}
          </h2>
          {question.sourceNote && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Source: {question.sourceNote}</span>
            </div>
          )}
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5 mb-5">
          {question.options.map((opt, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx];
            let buttonStyle = 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 text-slate-200';

            if (hasSubmitted) {
              if (idx === question.correctIndex) {
                buttonStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50';
              } else if (idx === selectedIndex) {
                buttonStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
              } else {
                buttonStyle = 'bg-slate-800/50 border-slate-800 text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl border-2 flex items-start gap-3 transition-all cursor-pointer ${buttonStyle}`}
              >
                <span className="font-pixel text-xs px-2 py-1 rounded bg-black/40 text-amber-300 shrink-0 mt-0.5">
                  {letter} / [{idx + 1}]
                </span>
                <span className="text-sm font-medium leading-relaxed flex-1">{opt}</span>

                {hasSubmitted && idx === question.correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                )}
                {hasSubmitted && idx === selectedIndex && idx !== question.correctIndex && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Educational Feedback Panel when submitted */}
        {hasSubmitted && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 mb-1.5 font-pixel text-xs">
              {isCorrect ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  CORRECT! +200 PTS & POWER-UP REWARD!
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  INCORRECT! STUDY THIS KEY CONCEPT:
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {question.explanation}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-pixel">
                PRESS [SPACE] OR [ENTER] TO CONTINUE
              </span>

              <button
                onClick={() => onAnswer(isCorrect)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs rounded-lg flex items-center gap-2 font-bold shadow-lg transition transform active:scale-95 cursor-pointer"
              >
                <span>CONTINUE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
