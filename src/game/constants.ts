export const TILE_SIZE = 16;
export const VIEWPORT_WIDTH = 480;
export const VIEWPORT_HEIGHT = 270;

// Tile ID definitions
export const TILES = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  QUESTION_EMPTY: 4,
  PIPE_TOP_LEFT: 5,
  PIPE_TOP_RIGHT: 6,
  PIPE_BODY_LEFT: 7,
  PIPE_BODY_RIGHT: 8,
  HARD_BLOCK: 9, // Non-destructible stone / pyramid block
  CLOUD_LEFT: 10,
  CLOUD_MID: 11,
  CLOUD_RIGHT: 12,
  BUSH_LEFT: 13,
  BUSH_MID: 14,
  BUSH_RIGHT: 15,
  FLAG_POLE: 16,
  FLAG_TOP: 17,
  CASTLE_BRICK: 18,
  CASTLE_DOOR: 19,
  CASTLE_WINDOW: 20,
  CASTLE_TOP: 21,
  COIN_IN_WORLD: 22,
  KNOWLEDGE_GATE: 23,
  PLATFORM_WOOD: 24,
  LAVA: 25,
} as const;

// Physics constants tuned for classic snappy NES Mario feel
export const PHYSICS = {
  GRAVITY: 0.38,
  MAX_FALL_SPEED: 7.5,
  WALK_ACCEL: 0.18,
  RUN_ACCEL: 0.28,
  MAX_WALK_SPEED: 2.1,
  MAX_RUN_SPEED: 3.6,
  FRICTION: 0.85,
  AIR_RESISTANCE: 0.92,
  JUMP_FORCE: -6.4,
  SUPER_JUMP_FORCE: -6.9,
  BOUNCE_FORCE: -5.0,
  COYOTE_TIME: 6, // frames
  JUMP_BUFFER: 6, // frames
  INVINCIBLE_TIME: 120, // frames
  STAR_TIME: 600, // frames (~10 seconds)
};

export const COLOR_PALETTES = {
  overworld: {
    sky: '#5c94fc',
    ground: '#c84c0c',
    groundTop: '#00a800',
    brick: '#b84418',
    question: '#fc9838',
    pipe: '#00a800',
    pipeShine: '#80d010',
    pipeDark: '#005000',
  },
  underground: {
    sky: '#000000',
    ground: '#008088',
    groundTop: '#00a8b8',
    brick: '#008088',
    question: '#fc9838',
    pipe: '#008088',
    pipeShine: '#40c0c8',
    pipeDark: '#004048',
  },
  athletic: {
    sky: '#6888fc',
    ground: '#e45c10',
    groundTop: '#fcb040',
    brick: '#e45c10',
    question: '#fc9838',
    pipe: '#00a800',
    pipeShine: '#80d010',
    pipeDark: '#005000',
  },
  castle: {
    sky: '#000000',
    ground: '#d82800',
    groundTop: '#fc9838',
    brick: '#9c4a00',
    question: '#fc9838',
    pipe: '#888888',
    pipeShine: '#cccccc',
    pipeDark: '#444444',
  },
};
