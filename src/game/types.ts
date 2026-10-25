import { QuizQuestion } from '../data/ermNotesData';

export type EntityType = 
  | 'mario'
  | 'goomba'
  | 'koopa'
  | 'koopa_shell'
  | 'piranha'
  | 'mushroom'
  | 'flower'
  | 'star'
  | 'coin_pickup'
  | 'fireball';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type?: 'sparkle' | 'debris' | 'smoke' | 'score';
  text?: string;
}

export interface BumpingBlock {
  x: number; // tile x
  y: number; // tile y
  offsetY: number;
  velocityY: number;
  tileType: number;
}

export interface GameEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  dead: boolean;
  deathTimer?: number;
  state?: string;
  animFrame: number;
  animTimer: number;
  shellSpeed?: number;
  // Specific to Mario or enemies
  squashed?: boolean;
}

export interface LevelData {
  world: string;
  name: string;
  topicTitle: string;
  topicId: 'topic1' | 'topic2' | 'topic3' | 'topic4' | 'topic6';
  backgroundColor: string;
  cloudColor?: string;
  groundTile: number;
  brickTile: number;
  theme: 'overworld' | 'underground' | 'athletic' | 'castle';
  mapWidth: number; // in tiles
  mapHeight: number; // in tiles
  tiles: number[][]; // [y][x]
  // Question block mappings: { "x,y": QuizQuestion }
  questionBlocks: Record<string, QuizQuestion>;
  // Knowledge gate position (tile X)
  knowledgeGate?: {
    x: number;
    y: number;
    question: QuizQuestion;
    opened: boolean;
  };
  enemies: {
    type: 'goomba' | 'koopa' | 'piranha';
    x: number; // pixel
    y: number; // pixel
  }[];
  flagpoleX: number; // tile x
  castleX: number; // tile x
}

export interface GameStats {
  score: number;
  coins: number;
  lives: number;
  world: string;
  time: number;
  questionsAnswered: number;
  correctAnswers: number;
  streak: number;
}
