import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameEngine } from '../game/gameEngine';
import { GameRenderer } from '../game/renderer';
import { getLevel } from '../game/levels';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from '../game/constants';
import { QuizQuestion } from '../data/ermNotesData';
import { sound } from '../audio/soundEffects';
import { GameHUD } from './GameHUD';
import { QuestionModal } from './QuestionModal';
import { TitleScreen } from './TitleScreen';
import { PauseModal, GameOverModal, VictoryModal } from './GameModals';
import { NotesDrawer } from './NotesDrawer';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Sparkles } from 'lucide-react';

export const MarioGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // High-level Game States
  const [gameState, setGameState] = useState<'title' | 'playing' | 'question' | 'paused' | 'game_over' | 'victory'>('title');
  const [currentWorldNum, setCurrentWorldNum] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const [streak, setStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Active question modal state
  const [activeQuestion, setActiveQuestion] = useState<{
    question: QuizQuestion;
    isGate: boolean;
    blockCoord?: string;
  } | null>(null);

  // Study Notes Drawer
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  // Load High Score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('erm_mario_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update High Score helper
  const addScore = useCallback((pts: number) => {
    setScore(prev => {
      const next = prev + pts;
      setHighScore(curr => {
        if (next > curr) {
          localStorage.setItem('erm_mario_highscore', String(next));
          return next;
        }
        return curr;
      });
      return next;
    });
  }, []);

  // Initialize or start level
  const startLevel = useCallback((worldNum: number, keepStats: boolean = false) => {
    setCurrentWorldNum(worldNum);
    const levelData = getLevel(worldNum);

    if (!keepStats) {
      setScore(0);
      setCoins(0);
      setLives(3);
      setCorrectCount(0);
      setTotalQuestionsAnswered(0);
      setStreak(0);
    }
    setTimeRemaining(300);

    const engine = new GameEngine(levelData, {
      onQuestionTrigger: (question, isGate, blockCoord) => {
        setActiveQuestion({ question, isGate, blockCoord });
        setGameState('question');
      },
      onLevelComplete: () => {
        setGameState('victory');
      },
      onGameOver: () => {
        setGameState('game_over');
      },
      onCoinCollected: count => {
        setCoins(c => {
          const next = c + count;
          if (next >= 100) {
            setLives(l => l + 1);
            return next - 100;
          }
          return next;
        });
      },
      onLifeLost: () => {
        setLives(l => {
          const remaining = l - 1;
          if (remaining <= 0) {
            setGameState('game_over');
            return 0;
          } else {
            // Respawn Mario in current level
            if (engineRef.current) {
              engineRef.current.resetMarioPosition();
            }
            return remaining;
          }
        });
      },
      onScoreAdded: pts => {
        addScore(pts);
      },
    });

    engineRef.current = engine;
    setGameState('playing');
  }, [addScore]);

  // Main 60fps Game Loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Delta time clamp to prevent jumping on tab switch
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        if (gameState === 'playing') {
          engine.update(dt);
        }

        // Render current game frame
        renderer.render(
          engine.level,
          engine.cameraX,
          engine.mario,
          engine.marioState,
          engine.isInvincible,
          engine.isStar,
          engine.enemies,
          engine.items,
          engine.particles,
          engine.bumpingBlocks,
          engine.flagpoleY,
          engine.globalTick
        );
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [gameState]);

  // Level Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 1) {
          if (engineRef.current) {
            engineRef.current.killMario();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle pause with Escape
      if (e.key === 'Escape' && (gameState === 'playing' || gameState === 'paused')) {
        e.preventDefault();
        setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'));
        return;
      }

      // Toggle Mute with 'm'
      if (e.key.toLowerCase() === 'm' && gameState !== 'question') {
        const nextMuted = sound.toggleMute();
        setIsMuted(nextMuted);
        return;
      }

      // Title screen start with Enter or Space
      if (gameState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startLevel(currentWorldNum, false);
        return;
      }

      // Game Over retry with Enter
      if (gameState === 'game_over' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startLevel(currentWorldNum, false);
        return;
      }

      // Forward to engine when playing
      if (gameState === 'playing' && engineRef.current) {
        // Prevent browser page scrolling on arrow/space
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
        engineRef.current.handleKeyDown(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.handleKeyUp(e.code);
      }
    };

    const handleBlur = () => {
      if (engineRef.current) {
        engineRef.current.clearInputs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, currentWorldNum, startLevel]);

  // Question Answer Handler
  const handleAnswerQuestion = (isCorrect: boolean) => {
    if (!activeQuestion || !engineRef.current) return;

    setTotalQuestionsAnswered(t => t + 1);

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setStreak(s => {
        const next = s + 1;
        // 1-UP life reward on 3-streak!
        if (next % 3 === 0) {
          setLives(l => l + 1);
          sound.playPowerUpCollect();
        }
        return next;
      });

      engineRef.current.answerQuestionSuccess(activeQuestion.isGate, activeQuestion.blockCoord);
    } else {
      setStreak(0);
      engineRef.current.answerQuestionFailure();
    }

    setActiveQuestion(null);
    setGameState('playing');
  };

  // Add custom questions from Gemini
  const handleAddCustomQuestions = (questions: QuizQuestion[]) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;

    // Distribute newly generated questions into remaining question blocks
    let qIdx = 0;
    Object.keys(engine.level.questionBlocks).forEach(coord => {
      if (qIdx < questions.length) {
        engine.level.questionBlocks[coord] = questions[qIdx];
        qIdx++;
      }
    });
  };

  // Sound toggle helper
  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // On-screen Touch Controls helper for mobile/tablet players
  const handleTouchDown = (key: string) => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.handleKeyDown(key);
    }
  };

  const handleTouchUp = (key: string) => {
    if (engineRef.current && gameState === 'playing') {
      engineRef.current.handleKeyUp(key);
    }
  };

  const currentLevelData = engineRef.current?.level || getLevel(currentWorldNum);

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      {/* 16:9 Canvas Container */}
      <div className="relative w-full h-full max-w-[177.78vh] max-h-[56.25vw] flex items-center justify-center bg-black shadow-2xl">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH}
          height={VIEWPORT_HEIGHT}
          className="w-full h-full object-contain block image-rendering-pixelated"
        />

        {/* HUD (shown when playing, paused, or answering) */}
        {gameState !== 'title' && (
          <GameHUD
            score={score}
            coins={coins}
            world={currentLevelData.world}
            lives={lives}
            time={timeRemaining}
            streak={streak}
            correctCount={correctCount}
            totalAnswered={totalQuestionsAnswered}
            isMuted={isMuted}
            isPaused={gameState === 'paused'}
            onToggleMute={handleToggleMute}
            onTogglePause={() => setGameState(g => (g === 'paused' ? 'playing' : 'paused'))}
            onOpenNotes={() => setIsNotesOpen(true)}
          />
        )}

        {/* Title Screen */}
        {gameState === 'title' && (
          <TitleScreen
            selectedWorld={currentWorldNum}
            onSelectWorld={w => setCurrentWorldNum(w)}
            onStartGame={() => startLevel(currentWorldNum, false)}
            onOpenNotes={() => setIsNotesOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            highScore={highScore}
          />
        )}

        {/* Question Challenge Modal */}
        {gameState === 'question' && activeQuestion && (
          <QuestionModal
            question={activeQuestion.question}
            isGate={activeQuestion.isGate}
            onAnswer={handleAnswerQuestion}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <PauseModal
            worldName={currentLevelData.world}
            topicTitle={currentLevelData.topicTitle}
            onResume={() => setGameState('playing')}
            onRestart={() => startLevel(currentWorldNum, true)}
            onHome={() => setGameState('title')}
          />
        )}

        {/* Game Over Modal */}
        {gameState === 'game_over' && (
          <GameOverModal
            score={score}
            correctAnswers={correctCount}
            totalQuestions={totalQuestionsAnswered}
            worldName={currentLevelData.world}
            onRetry={() => startLevel(currentWorldNum, false)}
            onHome={() => setGameState('title')}
            onOpenNotes={() => setIsNotesOpen(true)}
          />
        )}

        {/* Victory Modal */}
        {gameState === 'victory' && (
          <VictoryModal
            score={score + timeRemaining * 10}
            coins={coins}
            timeRemaining={timeRemaining}
            correctAnswers={correctCount}
            totalQuestions={totalQuestionsAnswered}
            worldNum={currentWorldNum}
            hasNextLevel={currentWorldNum < 4}
            onNextLevel={() => startLevel(currentWorldNum + 1, true)}
            onReplay={() => startLevel(currentWorldNum, true)}
            onHome={() => setGameState('title')}
          />
        )}

        {/* Mobile / Tablet On-Screen Touch Controls (low occlusion, pointer-events-auto) */}
        {gameState === 'playing' && (
          <div className="absolute inset-0 pointer-events-none sm:hidden flex flex-col justify-end p-4 z-30">
            <div className="flex justify-between items-end w-full">
              {/* D-Pad Left/Right */}
              <div className="flex gap-2 pointer-events-auto">
                <button
                  onTouchStart={() => handleTouchDown('ArrowLeft')}
                  onTouchEnd={() => handleTouchUp('ArrowLeft')}
                  onMouseDown={() => handleTouchDown('ArrowLeft')}
                  onMouseUp={() => handleTouchUp('ArrowLeft')}
                  className="w-14 h-14 bg-slate-900/80 active:bg-slate-700 text-white rounded-2xl border-2 border-slate-700 flex items-center justify-center active:scale-95 shadow-lg select-none"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onTouchStart={() => handleTouchDown('ArrowRight')}
                  onTouchEnd={() => handleTouchUp('ArrowRight')}
                  onMouseDown={() => handleTouchDown('ArrowRight')}
                  onMouseUp={() => handleTouchUp('ArrowRight')}
                  className="w-14 h-14 bg-slate-900/80 active:bg-slate-700 text-white rounded-2xl border-2 border-slate-700 flex items-center justify-center active:scale-95 shadow-lg select-none"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {/* Action Buttons: Jump & Sprint/Fire */}
              <div className="flex gap-2 pointer-events-auto">
                <button
                  onTouchStart={() => handleTouchDown('ShiftLeft')}
                  onTouchEnd={() => handleTouchUp('ShiftLeft')}
                  onMouseDown={() => handleTouchDown('ShiftLeft')}
                  onMouseUp={() => handleTouchUp('ShiftLeft')}
                  className="w-13 h-13 bg-amber-600/80 active:bg-amber-500 text-white rounded-2xl border-2 border-amber-500 flex items-center justify-center active:scale-95 shadow-lg select-none"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <button
                  onTouchStart={() => handleTouchDown('Space')}
                  onTouchEnd={() => handleTouchUp('Space')}
                  onMouseDown={() => handleTouchDown('Space')}
                  onMouseUp={() => handleTouchUp('Space')}
                  className="w-15 h-15 bg-emerald-600/90 active:bg-emerald-500 text-white rounded-2xl border-2 border-emerald-400 flex items-center justify-center active:scale-95 shadow-lg font-pixel text-xs select-none"
                >
                  <ArrowUp className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Study Notes & AI Question Generator Drawer */}
      <NotesDrawer
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onAddCustomQuestions={handleAddCustomQuestions}
      />
    </div>
  );
};
