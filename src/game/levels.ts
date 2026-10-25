import { BUILTIN_QUESTIONS, QuizQuestion } from '../data/ermNotesData';
import { LevelData } from './types';
import { TILES } from './constants';

// Helper to create empty 2D tile matrix (height rows, width cols)
function createEmptyMap(width: number, height: number): number[][] {
  const map: number[][] = [];
  for (let y = 0; y < height; y++) {
    map.push(new Array(width).fill(TILES.EMPTY));
  }
  return map;
}

// Helper to add standard ground
function addGround(map: number[][], startX: number, endX: number, groundRow: number = 14) {
  for (let x = startX; x < endX; x++) {
    map[groundRow][x] = TILES.GROUND;
    map[groundRow + 1][x] = TILES.GROUND;
    map[groundRow + 2][x] = TILES.GROUND;
  }
}

// Helper to add pipe
function addPipe(map: number[][], x: number, height: number, groundRow: number = 14) {
  const topY = groundRow - height;
  map[topY][x] = TILES.PIPE_TOP_LEFT;
  map[topY][x + 1] = TILES.PIPE_TOP_RIGHT;
  for (let y = topY + 1; y < groundRow; y++) {
    map[y][x] = TILES.PIPE_BODY_LEFT;
    map[y][x + 1] = TILES.PIPE_BODY_RIGHT;
  }
}

// Helper to build Castle
function addCastle(map: number[][], startX: number, groundRow: number = 14) {
  // 5 tiles wide castle
  const castleHeight = 5;
  for (let y = groundRow - castleHeight; y < groundRow; y++) {
    for (let x = startX; x < startX + 5; x++) {
      map[y][x] = TILES.CASTLE_BRICK;
    }
  }
  // Battlements
  map[groundRow - castleHeight - 1][startX] = TILES.CASTLE_TOP;
  map[groundRow - castleHeight - 1][startX + 2] = TILES.CASTLE_TOP;
  map[groundRow - castleHeight - 1][startX + 4] = TILES.CASTLE_TOP;
  // Door
  map[groundRow - 1][startX + 2] = TILES.CASTLE_DOOR;
  map[groundRow - 2][startX + 2] = TILES.CASTLE_WINDOW;
}

// Helper to build Flagpole
function addFlagpole(map: number[][], x: number, groundRow: number = 14) {
  map[groundRow - 11][x] = TILES.FLAG_TOP;
  for (let y = groundRow - 10; y < groundRow; y++) {
    map[y][x] = TILES.FLAG_POLE;
  }
}

export function generateLevel1(): LevelData {
  const width = 140;
  const height = 17;
  const groundRow = 14;
  const tiles = createEmptyMap(width, height);

  // Ground with pits
  addGround(tiles, 0, 42, groundRow);
  // Pit at 42-44
  addGround(tiles, 45, 78, groundRow);
  // Pit at 78-80
  addGround(tiles, 81, 140, groundRow);

  // Scenery clouds & bushes
  const scenery = [
    { x: 4, y: 3, t: TILES.CLOUD_MID },
    { x: 18, y: 2, t: TILES.CLOUD_MID },
    { x: 38, y: 3, t: TILES.CLOUD_MID },
    { x: 60, y: 2, t: TILES.CLOUD_MID },
    { x: 92, y: 3, t: TILES.CLOUD_MID },
    { x: 8, y: 13, t: TILES.BUSH_MID },
    { x: 30, y: 13, t: TILES.BUSH_MID },
    { x: 66, y: 13, t: TILES.BUSH_MID },
  ];
  scenery.forEach(s => {
    tiles[s.y][s.x] = s.t;
  });

  // Level 1: Topic 1 ERM questions
  const qTopic1 = BUILTIN_QUESTIONS.filter(q => q.topicId === 'topic1');
  const questionBlocks: Record<string, QuizQuestion> = {};

  // Block group 1: x = 14, 16, 18, 20
  tiles[groundRow - 4][14] = TILES.BRICK;
  tiles[groundRow - 4][15] = TILES.QUESTION;
  questionBlocks['15,' + (groundRow - 4)] = qTopic1[0];

  tiles[groundRow - 4][16] = TILES.BRICK;
  tiles[groundRow - 4][17] = TILES.QUESTION;
  questionBlocks['17,' + (groundRow - 4)] = qTopic1[1];

  tiles[groundRow - 4][18] = TILES.BRICK;

  // First pipe at x = 24
  addPipe(tiles, 24, 2, groundRow);

  // Second pipe at x = 32
  addPipe(tiles, 32, 3, groundRow);

  // High question block over pipe
  tiles[groundRow - 7][33] = TILES.QUESTION;
  questionBlocks['33,' + (groundRow - 7)] = qTopic1[2];

  // Third pipe at x = 38
  addPipe(tiles, 38, 4, groundRow);

  // Post-pit 1 blocks: x = 50 - 58
  tiles[groundRow - 4][50] = TILES.BRICK;
  tiles[groundRow - 4][51] = TILES.QUESTION;
  questionBlocks['51,' + (groundRow - 4)] = qTopic1[3];
  tiles[groundRow - 4][52] = TILES.BRICK;

  // High platform blocks
  tiles[groundRow - 7][54] = TILES.BRICK;
  tiles[groundRow - 7][55] = TILES.QUESTION;
  questionBlocks['55,' + (groundRow - 7)] = qTopic1[4];
  tiles[groundRow - 7][56] = TILES.BRICK;

  // Stone pyramid staircase
  for (let step = 0; step < 4; step++) {
    for (let sy = groundRow - step - 1; sy < groundRow; sy++) {
      tiles[sy][70 + step] = TILES.HARD_BLOCK;
    }
  }

  // Knowledge gate at x = 90
  const knowledgeGateQ = qTopic1[5] || qTopic1[0];
  tiles[groundRow - 1][90] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 2][90] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 3][90] = TILES.KNOWLEDGE_GATE;

  // Question block just before knowledge gate
  tiles[groundRow - 4][86] = TILES.QUESTION;
  questionBlocks['86,' + (groundRow - 4)] = qTopic1[2];

  // Final stone staircase leading to flagpole
  for (let step = 0; step < 8; step++) {
    for (let sy = groundRow - step - 1; sy < groundRow; sy++) {
      tiles[sy][108 + step] = TILES.HARD_BLOCK;
    }
  }

  // Flagpole at x = 122
  addFlagpole(tiles, 122, groundRow);

  // Castle at x = 129
  addCastle(tiles, 129, groundRow);

  // Floating coins
  [15, 17, 28, 29, 53, 54, 87, 88].forEach(cx => {
    tiles[groundRow - 5][cx] = TILES.COIN_IN_WORLD;
  });

  return {
    world: 'World 1-1',
    name: 'ERM Grasslands',
    topicTitle: 'Topic 1: ERM Foundations & 3 Flows',
    topicId: 'topic1',
    backgroundColor: '#5c94fc',
    groundTile: TILES.GROUND,
    brickTile: TILES.BRICK,
    theme: 'overworld',
    mapWidth: width,
    mapHeight: height,
    tiles,
    questionBlocks,
    knowledgeGate: {
      x: 90,
      y: groundRow - 3,
      question: knowledgeGateQ,
      opened: false,
    },
    enemies: [
      { type: 'goomba', x: 20 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 28 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 48 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 62 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 65 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 96 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 102 * 16, y: (groundRow - 1) * 16 },
    ],
    flagpoleX: 122,
    castleX: 129,
  };
}

export function generateLevel2(): LevelData {
  const width = 145;
  const height = 17;
  const groundRow = 14;
  const tiles = createEmptyMap(width, height);

  // Underground ceiling & ground
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TILES.HARD_BLOCK; // Ceiling
    tiles[1][x] = TILES.HARD_BLOCK;
  }
  addGround(tiles, 0, 50, groundRow);
  addGround(tiles, 53, 90, groundRow);
  addGround(tiles, 93, 145, groundRow);

  // Topic 2 questions
  const qTopic2 = BUILTIN_QUESTIONS.filter(q => q.topicId === 'topic2');
  const questionBlocks: Record<string, QuizQuestion> = {};

  // Underground pipe entries
  addPipe(tiles, 10, 3, groundRow);
  addPipe(tiles, 18, 2, groundRow);

  // Process map styled blocks (diamond & rectangle formations!)
  // Rectangle block formation (Activity)
  tiles[groundRow - 4][24] = TILES.QUESTION;
  questionBlocks['24,' + (groundRow - 4)] = qTopic2[0];
  tiles[groundRow - 4][25] = TILES.BRICK;
  tiles[groundRow - 4][26] = TILES.BRICK;
  tiles[groundRow - 4][27] = TILES.QUESTION;
  questionBlocks['27,' + (groundRow - 4)] = qTopic2[1];

  // High diamond formation (Decision Point)
  tiles[groundRow - 7][36] = TILES.QUESTION;
  questionBlocks['36,' + (groundRow - 7)] = qTopic2[2];
  tiles[groundRow - 6][35] = TILES.BRICK;
  tiles[groundRow - 6][37] = TILES.BRICK;
  tiles[groundRow - 5][36] = TILES.BRICK;

  // Moving pipe obstacle
  addPipe(tiles, 44, 4, groundRow);

  // Middle section: Blockchain & IoT
  tiles[groundRow - 4][60] = TILES.QUESTION;
  questionBlocks['60,' + (groundRow - 4)] = qTopic2[3];
  tiles[groundRow - 4][63] = TILES.QUESTION;
  questionBlocks['63,' + (groundRow - 4)] = qTopic2[4];
  tiles[groundRow - 4][66] = TILES.QUESTION;
  questionBlocks['66,' + (groundRow - 4)] = qTopic2[5];

  // Elevated platform
  for (let x = 70; x < 78; x++) {
    tiles[groundRow - 5][x] = TILES.PLATFORM_WOOD;
    tiles[groundRow - 7][x] = TILES.COIN_IN_WORLD;
  }

  // Knowledge Gate at x = 98
  const gateQ = qTopic2[3] || qTopic2[0];
  tiles[groundRow - 1][98] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 2][98] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 3][98] = TILES.KNOWLEDGE_GATE;

  // Final stone stairs
  for (let step = 0; step < 7; step++) {
    for (let sy = groundRow - step - 1; sy < groundRow; sy++) {
      tiles[sy][115 + step] = TILES.HARD_BLOCK;
    }
  }

  addFlagpole(tiles, 128, groundRow);
  addCastle(tiles, 134, groundRow);

  return {
    world: 'World 1-2',
    name: 'Underground AI & Process Cavern',
    topicTitle: 'Topic 2: AI, ML, IoT & Process Maps',
    topicId: 'topic2',
    backgroundColor: '#0a0f1d',
    groundTile: TILES.HARD_BLOCK,
    brickTile: TILES.BRICK,
    theme: 'underground',
    mapWidth: width,
    mapHeight: height,
    tiles,
    questionBlocks,
    knowledgeGate: {
      x: 98,
      y: groundRow - 3,
      question: gateQ,
      opened: false,
    },
    enemies: [
      { type: 'goomba', x: 14 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 29 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 58 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 64 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 82 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 104 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 110 * 16, y: (groundRow - 1) * 16 },
    ],
    flagpoleX: 128,
    castleX: 134,
  };
}

export function generateLevel3(): LevelData {
  const width = 145;
  const height = 17;
  const groundRow = 14;
  const tiles = createEmptyMap(width, height);

  // Athletic mushroom platforms & floating islands
  addGround(tiles, 0, 24, groundRow);
  addGround(tiles, 30, 48, groundRow);
  addGround(tiles, 56, 75, groundRow);
  addGround(tiles, 82, 145, groundRow);

  // Sky athletic floating platforms
  const platforms = [
    { startX: 16, endX: 22, y: groundRow - 4 },
    { startX: 25, endX: 29, y: groundRow - 6 },
    { startX: 49, endX: 55, y: groundRow - 5 },
    { startX: 62, endX: 68, y: groundRow - 6 },
    { startX: 76, endX: 81, y: groundRow - 4 },
  ];

  platforms.forEach(p => {
    for (let x = p.startX; x < p.endX; x++) {
      tiles[p.y][x] = TILES.PLATFORM_WOOD;
    }
  });

  const qTopic3 = BUILTIN_QUESTIONS.filter(q => q.topicId === 'topic3');
  const questionBlocks: Record<string, QuizQuestion> = {};

  tiles[groundRow - 4][12] = TILES.QUESTION;
  questionBlocks['12,' + (groundRow - 4)] = qTopic3[0];

  tiles[groundRow - 7][19] = TILES.QUESTION;
  questionBlocks['19,' + (groundRow - 7)] = qTopic3[1];

  tiles[groundRow - 4][35] = TILES.QUESTION;
  questionBlocks['35,' + (groundRow - 4)] = qTopic3[2];

  tiles[groundRow - 4][42] = TILES.QUESTION;
  questionBlocks['42,' + (groundRow - 4)] = qTopic3[3];

  tiles[groundRow - 8][65] = TILES.QUESTION;
  questionBlocks['65,' + (groundRow - 8)] = qTopic3[4];

  tiles[groundRow - 4][70] = TILES.QUESTION;
  questionBlocks['70,' + (groundRow - 4)] = qTopic3[5];

  tiles[groundRow - 4][88] = TILES.QUESTION;
  questionBlocks['88,' + (groundRow - 4)] = qTopic3[6];

  // Knowledge gate at x = 96
  const gateQ = qTopic3[2] || qTopic3[0];
  tiles[groundRow - 1][96] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 2][96] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 3][96] = TILES.KNOWLEDGE_GATE;

  // Final stairs
  for (let step = 0; step < 7; step++) {
    for (let sy = groundRow - step - 1; sy < groundRow; sy++) {
      tiles[sy][114 + step] = TILES.HARD_BLOCK;
    }
  }

  addFlagpole(tiles, 126, groundRow);
  addCastle(tiles, 132, groundRow);

  return {
    world: 'World 1-3',
    name: 'Sales Order Cloud Heights',
    topicTitle: 'Topic 3: Sales Order Process & Fulfilment',
    topicId: 'topic3',
    backgroundColor: '#3b82f6',
    groundTile: TILES.GROUND,
    brickTile: TILES.BRICK,
    theme: 'athletic',
    mapWidth: width,
    mapHeight: height,
    tiles,
    questionBlocks,
    knowledgeGate: {
      x: 96,
      y: groundRow - 3,
      question: gateQ,
      opened: false,
    },
    enemies: [
      { type: 'koopa', x: 18 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 36 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 40 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 60 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 86 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 102 * 16, y: (groundRow - 1) * 16 },
    ],
    flagpoleX: 126,
    castleX: 132,
  };
}

export function generateLevel4(): LevelData {
  const width = 150;
  const height = 17;
  const groundRow = 14;
  const tiles = createEmptyMap(width, height);

  // Castle ceiling
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TILES.HARD_BLOCK;
    tiles[1][x] = TILES.HARD_BLOCK;
  }

  // Ground with lava pits
  addGround(tiles, 0, 36, groundRow);
  // Lava pit 36 - 40
  for (let lx = 36; lx < 40; lx++) {
    tiles[groundRow + 1][lx] = TILES.LAVA;
    tiles[groundRow + 2][lx] = TILES.LAVA;
  }
  addGround(tiles, 40, 75, groundRow);
  // Lava pit 75 - 79
  for (let lx = 75; lx < 79; lx++) {
    tiles[groundRow + 1][lx] = TILES.LAVA;
    tiles[groundRow + 2][lx] = TILES.LAVA;
  }
  addGround(tiles, 79, 150, groundRow);

  const qTopic4 = BUILTIN_QUESTIONS.filter(q => q.topicId === 'topic4' || q.topicId === 'topic6');
  const questionBlocks: Record<string, QuizQuestion> = {};

  // Castle blocks
  tiles[groundRow - 4][15] = TILES.QUESTION;
  questionBlocks['15,' + (groundRow - 4)] = qTopic4[0];
  tiles[groundRow - 4][16] = TILES.BRICK;
  tiles[groundRow - 4][17] = TILES.QUESTION;
  questionBlocks['17,' + (groundRow - 4)] = qTopic4[1];

  // Stepping stones over lava pit
  tiles[groundRow - 3][38] = TILES.HARD_BLOCK;

  // Middle castle hall (EOQ & ROP)
  tiles[groundRow - 4][48] = TILES.QUESTION;
  questionBlocks['48,' + (groundRow - 4)] = qTopic4[2];
  tiles[groundRow - 4][52] = TILES.QUESTION;
  questionBlocks['52,' + (groundRow - 4)] = qTopic4[3];
  tiles[groundRow - 4][56] = TILES.QUESTION;
  questionBlocks['56,' + (groundRow - 4)] = qTopic4[4];

  // High bridge
  for (let bx = 60; bx < 68; bx++) {
    tiles[groundRow - 5][bx] = TILES.PLATFORM_WOOD;
  }
  tiles[groundRow - 7][64] = TILES.QUESTION;
  questionBlocks['64,' + (groundRow - 7)] = qTopic4[5];

  // Post lava pit 2
  tiles[groundRow - 4][84] = TILES.QUESTION;
  questionBlocks['84,' + (groundRow - 4)] = qTopic4[6];
  tiles[groundRow - 4][90] = TILES.QUESTION;
  questionBlocks['90,' + (groundRow - 4)] = qTopic4[7];

  // Knowledge Gate (Final exam lock!) at x = 105
  const gateQ = qTopic4[3] || qTopic4[0];
  tiles[groundRow - 1][105] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 2][105] = TILES.KNOWLEDGE_GATE;
  tiles[groundRow - 3][105] = TILES.KNOWLEDGE_GATE;

  // Final Bowser's Enterprise Throne & Flag
  for (let step = 0; step < 6; step++) {
    for (let sy = groundRow - step - 1; sy < groundRow; sy++) {
      tiles[sy][122 + step] = TILES.HARD_BLOCK;
    }
  }

  addFlagpole(tiles, 134, groundRow);
  addCastle(tiles, 140, groundRow);

  return {
    world: 'World 1-4',
    name: "Bowser's Enterprise Castle",
    topicTitle: 'Topic 4 & 6: Inventory, EOQ, MRP & Scheduling',
    topicId: 'topic4',
    backgroundColor: '#0a0a0f',
    groundTile: TILES.CASTLE_BRICK,
    brickTile: TILES.CASTLE_BRICK,
    theme: 'castle',
    mapWidth: width,
    mapHeight: height,
    tiles,
    questionBlocks,
    knowledgeGate: {
      x: 105,
      y: groundRow - 3,
      question: gateQ,
      opened: false,
    },
    enemies: [
      { type: 'goomba', x: 22 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 28 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 45 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 54 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 86 * 16, y: (groundRow - 1) * 16 },
      { type: 'koopa', x: 96 * 16, y: (groundRow - 1) * 16 },
      { type: 'goomba', x: 114 * 16, y: (groundRow - 1) * 16 },
    ],
    flagpoleX: 134,
    castleX: 140,
  };
}

export function getLevel(worldIndex: number): LevelData {
  switch (worldIndex) {
    case 1:
      return generateLevel1();
    case 2:
      return generateLevel2();
    case 3:
      return generateLevel3();
    case 4:
      return generateLevel4();
    default:
      return generateLevel1();
  }
}
