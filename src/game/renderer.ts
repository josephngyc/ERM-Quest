import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILES, COLOR_PALETTES } from './constants';
import { GameEntity, LevelData, Particle, BumpingBlock } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  public render(
    level: LevelData,
    cameraX: number,
    mario: GameEntity,
    marioState: 'small' | 'super' | 'fire',
    isInvincible: boolean,
    isStar: boolean,
    enemies: GameEntity[],
    items: GameEntity[],
    particles: Particle[],
    bumpingBlocks: BumpingBlock[],
    flagpoleY: number,
    globalTick: number
  ) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // 1. Draw Background Sky & Theme Scenery
    this.renderBackground(level, cameraX, globalTick);

    // 2. Draw Tiles
    ctx.save();
    ctx.translate(-cameraX, 0);

    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE) - 1);
    const endCol = Math.min(level.mapWidth, Math.ceil((cameraX + VIEWPORT_WIDTH) / TILE_SIZE) + 1);

    for (let y = 0; y < level.mapHeight; y++) {
      for (let x = startCol; x < endCol; x++) {
        const tile = level.tiles[y][x];
        if (tile === TILES.EMPTY) continue;

        // Check if this block is currently bumping
        const bumping = bumpingBlocks.find(b => b.x === x && b.y === y);
        const drawY = bumping ? y * TILE_SIZE + bumping.offsetY : y * TILE_SIZE;

        this.renderTile(tile, x * TILE_SIZE, drawY, level, globalTick);
      }
    }

    // 3. Draw Flagpole Flag
    const flagX = level.flagpoleX * TILE_SIZE;
    this.renderFlag(flagX, flagpoleY);

    // 4. Draw Items (Mushrooms, Flowers, Stars, Coins)
    items.forEach(item => {
      this.renderItem(item, globalTick);
    });

    // 5. Draw Enemies
    enemies.forEach(enemy => {
      this.renderEnemy(enemy, globalTick);
    });

    // 6. Draw Mario
    this.renderMario(mario, marioState, isInvincible, isStar, globalTick);

    // 7. Draw Particles (Debris, Sparks, Floating Text)
    this.renderParticles(particles);

    ctx.restore();
  }

  private renderBackground(level: LevelData, cameraX: number, tick: number) {
    const ctx = this.ctx;
    ctx.fillStyle = level.backgroundColor;
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    if (level.theme === 'overworld' || level.theme === 'athletic') {
      // Parallax distant hills
      ctx.fillStyle = level.theme === 'athletic' ? '#2563eb' : '#22c55e';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const hillX = (i * 260 - cameraX * 0.25) % (VIEWPORT_WIDTH + 300) - 100;
        ctx.arc(hillX + 80, 224, 70, Math.PI, 0, false);
      }
      ctx.fill();

      // Fluffy pixel clouds
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 10; i++) {
        const cloudX = (i * 180 + (tick * 0.1) - cameraX * 0.15) % (VIEWPORT_WIDTH + 200) - 80;
        const cloudY = 30 + (i % 3) * 22;
        this.renderFluffyCloud(cloudX, cloudY);
      }
    } else if (level.theme === 'castle') {
      // Castle fiery back wall pillars
      ctx.fillStyle = '#1c1917';
      for (let i = 0; i < 12; i++) {
        const colX = (i * 70 - cameraX * 0.4) % (VIEWPORT_WIDTH + 140) - 40;
        ctx.fillRect(colX, 20, 28, 204);
        ctx.fillStyle = '#292524';
        ctx.fillRect(colX + 4, 24, 20, 196);
        ctx.fillStyle = '#1c1917';
      }
    }
  }

  private renderFluffyCloud(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 8, 12, 0, Math.PI * 2);
    ctx.arc(x + 36, y + 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 6, y + 8, 34, 8);
  }

  private renderTile(tile: number, x: number, y: number, level: LevelData, tick: number) {
    const ctx = this.ctx;
    const pal = COLOR_PALETTES[level.theme] || COLOR_PALETTES.overworld;

    switch (tile) {
      case TILES.GROUND: {
        // Ground brick
        ctx.fillStyle = pal.ground;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Top lush grass strip
        ctx.fillStyle = pal.groundTop;
        ctx.fillRect(x, y, TILE_SIZE, 3);
        // Brick pixel line detail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(x, y + 8, TILE_SIZE, 1);
        ctx.fillRect(x + 8, y + 3, 1, 5);
        ctx.fillRect(x + 4, y + 9, 1, 7);
        ctx.fillRect(x + 12, y + 9, 1, 7);
        break;
      }
      case TILES.BRICK: {
        ctx.fillStyle = pal.brick;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#000000';
        // Mortar lines
        ctx.fillRect(x, y, TILE_SIZE, 1);
        ctx.fillRect(x, y + 8, TILE_SIZE, 1);
        ctx.fillRect(x, y + 15, TILE_SIZE, 1);
        ctx.fillRect(x + 8, y, 1, 8);
        ctx.fillRect(x + 4, y + 8, 1, 8);
        ctx.fillRect(x + 12, y + 8, 1, 8);
        // Highlights
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x + 1, y + 1, 6, 1);
        ctx.fillRect(x + 9, y + 1, 6, 1);
        ctx.fillRect(x + 5, y + 9, 6, 1);
        break;
      }
      case TILES.QUESTION: {
        // Classic animated pulsating Mario ? block
        const anim = Math.floor((tick / 14) % 4);
        ctx.fillStyle = anim === 3 ? '#e08020' : '#fc9838';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Dark bevel border
        ctx.fillStyle = '#804000';
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        // Corner bolts
        ctx.fillStyle = '#402000';
        ctx.fillRect(x + 1, y + 1, 1, 1);
        ctx.fillRect(x + 14, y + 1, 1, 1);
        ctx.fillRect(x + 1, y + 14, 1, 1);
        ctx.fillRect(x + 14, y + 14, 1, 1);

        // ? Mark
        ctx.fillStyle = '#ffffff';
        // Top arc of ?
        ctx.fillRect(x + 5, y + 3, 6, 2);
        ctx.fillRect(x + 9, y + 5, 2, 2);
        ctx.fillRect(x + 7, y + 7, 3, 2);
        // Dot
        ctx.fillRect(x + 7, y + 11, 2, 2);
        break;
      }
      case TILES.QUESTION_EMPTY: {
        // Brown spent block
        ctx.fillStyle = '#9c5c24';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#4a2800';
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        // Corner rivets
        ctx.fillRect(x + 2, y + 2, 2, 2);
        ctx.fillRect(x + 12, y + 2, 2, 2);
        ctx.fillRect(x + 2, y + 12, 2, 2);
        ctx.fillRect(x + 12, y + 12, 2, 2);
        break;
      }
      case TILES.HARD_BLOCK: {
        // Pyramid/indestructible block
        ctx.fillStyle = '#d07030';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, TILE_SIZE, 1);
        ctx.fillRect(x, y, 1, TILE_SIZE);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE);
        ctx.fillRect(x, y + TILE_SIZE - 1, TILE_SIZE, 1);
        break;
      }
      case TILES.PIPE_TOP_LEFT: {
        ctx.fillStyle = pal.pipe;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = pal.pipeShine;
        ctx.fillRect(x + 2, y, 3, TILE_SIZE);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE, TILE_SIZE);
        break;
      }
      case TILES.PIPE_TOP_RIGHT: {
        ctx.fillStyle = pal.pipe;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = pal.pipeDark;
        ctx.fillRect(x + 11, y, 4, TILE_SIZE);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(x, y + 0.5, TILE_SIZE - 0.5, TILE_SIZE);
        break;
      }
      case TILES.PIPE_BODY_LEFT: {
        ctx.fillStyle = pal.pipe;
        ctx.fillRect(x + 2, y, TILE_SIZE - 2, TILE_SIZE);
        ctx.fillStyle = pal.pipeShine;
        ctx.fillRect(x + 4, y, 3, TILE_SIZE);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2, y, 1, TILE_SIZE);
        break;
      }
      case TILES.PIPE_BODY_RIGHT: {
        ctx.fillStyle = pal.pipe;
        ctx.fillRect(x, y, TILE_SIZE - 2, TILE_SIZE);
        ctx.fillStyle = pal.pipeDark;
        ctx.fillRect(x + 9, y, 3, TILE_SIZE);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + TILE_SIZE - 3, y, 1, TILE_SIZE);
        break;
      }
      case TILES.FLAG_TOP: {
        // Gold ball at top of flagpole
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(x + 8, y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 7, y + 10, 2, 2);
        break;
      }
      case TILES.FLAG_POLE: {
        // Green pole
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 7, y, 2, TILE_SIZE);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(x + 7, y, 1, TILE_SIZE);
        break;
      }
      case TILES.CASTLE_BRICK: {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#451a03';
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        break;
      }
      case TILES.CASTLE_DOOR: {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        break;
      }
      case TILES.CASTLE_WINDOW: {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 4, y + 2, 8, 12);
        break;
      }
      case TILES.CASTLE_TOP: {
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x, y + 6, TILE_SIZE, 10);
        ctx.fillStyle = '#451a03';
        ctx.strokeRect(x + 0.5, y + 6.5, TILE_SIZE - 1, 9);
        break;
      }
      case TILES.PLATFORM_WOOD: {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(x, y, TILE_SIZE, 8);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x, y + 8, TILE_SIZE, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x, y, TILE_SIZE, 1);
        break;
      }
      case TILES.LAVA: {
        const glow = Math.sin(tick * 0.1) * 20;
        ctx.fillStyle = `rgb(${220 + glow}, 40, 10)`;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + ((tick * 2) % TILE_SIZE), y, 4, 2);
        break;
      }
      case TILES.COIN_IN_WORLD: {
        this.renderWorldCoin(x + 4, y + 3, tick);
        break;
      }
      case TILES.KNOWLEDGE_GATE: {
        // Runic glowing ERM Knowledge barrier!
        const pulse = Math.abs(Math.sin(tick * 0.08));
        ctx.fillStyle = `rgba(59, 130, 246, ${0.4 + pulse * 0.5})`;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#93c5fd';
        ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        // Central book/ERP key symbol
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 4, 8, 8);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 6, y + 6, 4, 4);
        break;
      }
    }
  }

  private renderWorldCoin(x: number, y: number, tick: number) {
    const ctx = this.ctx;
    const anim = Math.floor((tick / 8) % 4);
    const widthMap = [8, 6, 2, 6];
    const w = widthMap[anim];
    const offset = (8 - w) / 2;

    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + offset, y, w, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + offset + 1, y + 1, Math.max(1, w - 2), 2);
    ctx.fillStyle = '#ca8a04';
    ctx.strokeRect(x + offset + 0.5, y + 0.5, w - 1, 9);
  }

  private renderFlag(flagX: number, flagpoleY: number) {
    const ctx = this.ctx;
    // Classic triangular Mario flag attached to pole
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(flagX + 8, flagpoleY);
    ctx.lineTo(flagX + 8 - 14, flagpoleY + 7);
    ctx.lineTo(flagX + 8, flagpoleY + 14);
    ctx.closePath();
    ctx.fill();

    // White circle emblem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(flagX + 2, flagpoleY + 7, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMario(
    mario: GameEntity,
    marioState: 'small' | 'super' | 'fire',
    isInvincible: boolean,
    isStar: boolean,
    tick: number
  ) {
    const ctx = this.ctx;

    // Blink when invincible
    if (isInvincible && Math.floor(tick / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(mario.x + mario.width / 2, mario.y);

    if (mario.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const isLarge = marioState !== 'small';
    const height = isLarge ? 24 : 16;
    const halfW = 7;

    // Palette selection (Small Mario, Super Mario, Fire Mario, or Starman Rainbow!)
    let hatColor = '#dc2626';
    let shirtColor = '#dc2626';
    let overallsColor = '#2563eb';
    let skinColor = '#fdba74';
    let shoeColor = '#854d0e';

    if (isStar) {
      const rainbow = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
      hatColor = shirtColor = overallsColor = rainbow[Math.floor((tick / 3) % rainbow.length)];
    } else if (marioState === 'fire') {
      hatColor = '#ffffff';
      shirtColor = '#ffffff';
      overallsColor = '#dc2626';
    }

    // Walking animation cycle
    const isMoving = Math.abs(mario.vx) > 0.2;
    const isJumping = !mario.isGrounded;
    const walkFrame = isJumping ? 3 : isMoving ? Math.floor((tick / 6) % 3) : 0;

    if (!isLarge) {
      // --- SMALL MARIO (14 x 16) ---
      // Hat & Hair
      ctx.fillStyle = hatColor;
      ctx.fillRect(-halfW + 3, 0, 8, 3);
      ctx.fillRect(-halfW + 1, 2, 12, 2);

      // Face & Eye
      ctx.fillStyle = skinColor;
      ctx.fillRect(-halfW + 2, 4, 8, 4);
      // Eye
      ctx.fillStyle = '#000000';
      ctx.fillRect(-halfW + 7, 5, 1, 2);
      // Mustache
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-halfW + 6, 7, 5, 2);
      // Ear & Hair back
      ctx.fillRect(-halfW + 1, 4, 2, 3);

      // Shirt & Overalls
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-halfW + 3, 8, 7, 3);

      ctx.fillStyle = overallsColor;
      ctx.fillRect(-halfW + 3, 10, 7, 4);
      // Suspenders
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-halfW + 4, 11, 1, 1);
      ctx.fillRect(-halfW + 8, 11, 1, 1);

      // Legs / Shoes based on walk frame
      ctx.fillStyle = shoeColor;
      if (isJumping) {
        // Jump pose: feet kicking back
        ctx.fillRect(-halfW + 1, 12, 4, 4);
        ctx.fillRect(-halfW + 7, 14, 5, 2);
      } else if (walkFrame === 1) {
        ctx.fillRect(-halfW + 1, 14, 4, 2);
        ctx.fillRect(-halfW + 7, 13, 5, 3);
      } else if (walkFrame === 2) {
        ctx.fillRect(-halfW + 2, 13, 4, 3);
        ctx.fillRect(-halfW + 6, 14, 5, 2);
      } else {
        // Idle
        ctx.fillRect(-halfW + 2, 14, 4, 2);
        ctx.fillRect(-halfW + 7, 14, 4, 2);
      }
    } else {
      // --- SUPER / FIRE MARIO (14 x 24) ---
      // Hat
      ctx.fillStyle = hatColor;
      ctx.fillRect(-halfW + 3, 0, 9, 3);
      ctx.fillRect(-halfW + 1, 3, 13, 3);

      // Face
      ctx.fillStyle = skinColor;
      ctx.fillRect(-halfW + 2, 6, 9, 5);
      // Eye & Brow
      ctx.fillStyle = '#000000';
      ctx.fillRect(-halfW + 8, 7, 2, 2);
      // Mustache
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-halfW + 6, 10, 6, 2);
      ctx.fillRect(-halfW + 1, 6, 2, 4);

      // Shirt & Chest
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-halfW + 2, 11, 9, 4);
      ctx.fillRect(-halfW, 12, 3, 4); // Arm

      // Overalls Body
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-halfW + 2, 14, 9, 6);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-halfW + 4, 15, 1, 1);
      ctx.fillRect(-halfW + 8, 15, 1, 1);

      // Shoes
      ctx.fillStyle = shoeColor;
      if (isJumping) {
        ctx.fillRect(-halfW, 19, 5, 4);
        ctx.fillRect(-halfW + 7, 21, 6, 3);
      } else if (walkFrame === 1) {
        ctx.fillRect(-halfW + 1, 20, 5, 4);
        ctx.fillRect(-halfW + 7, 19, 5, 5);
      } else {
        ctx.fillRect(-halfW + 1, 21, 5, 3);
        ctx.fillRect(-halfW + 7, 21, 5, 3);
      }
    }

    ctx.restore();
  }

  private renderEnemy(enemy: GameEntity, tick: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.type === 'goomba') {
      if (enemy.squashed) {
        // Flattened Goomba pancake
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 10, 16, 6);
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(4, 11, 8, 3);
        // X eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(5, 12, 2, 1);
        ctx.fillRect(9, 12, 2, 1);
      } else {
        const step = Math.floor((tick / 8) % 2);
        // Goomba Mushroom Head
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(2, 0, 12, 3);
        ctx.fillRect(0, 3, 16, 6);

        // Face & Eyes
        ctx.fillStyle = '#ffedd5';
        ctx.fillRect(3, 8, 10, 5);
        // Angry slanted eyebrows & eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, 8, 2, 3);
        ctx.fillRect(10, 8, 2, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 8, 1, 2);
        ctx.fillRect(10, 8, 1, 2);

        // Feet waddling
        ctx.fillStyle = '#000000';
        if (step === 0) {
          ctx.fillRect(0, 13, 6, 3);
          ctx.fillRect(10, 13, 5, 2);
        } else {
          ctx.fillRect(1, 13, 5, 2);
          ctx.fillRect(10, 13, 6, 3);
        }
      }
    } else if (enemy.type === 'koopa') {
      const step = Math.floor((tick / 8) % 2);
      // Koopa Green Shell
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(2, 6, 12, 10);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(4, 8, 8, 6);

      // Yellow Head
      ctx.fillStyle = '#fde047';
      ctx.fillRect(10, 0, 6, 7);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(13, 3, 4, 3); // Beak
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, 1, 2, 2); // Eye

      // Feet
      ctx.fillStyle = '#ea580c';
      if (step === 0) {
        ctx.fillRect(2, 16, 5, 3);
        ctx.fillRect(9, 16, 5, 2);
      } else {
        ctx.fillRect(3, 16, 5, 2);
        ctx.fillRect(9, 16, 5, 3);
      }
    } else if (enemy.type === 'koopa_shell') {
      // Spinning Koopa Shell
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(2, 2, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillStyle = '#15803d';
      ctx.strokeRect(2.5, 2.5, 11, 11);
    }

    ctx.restore();
  }

  private renderItem(item: GameEntity, tick: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(item.x, item.y);

    if (item.type === 'mushroom') {
      // Super Mushroom
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(8, 7, 7, Math.PI, 0, false);
      ctx.fill();
      // White spots
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 2, 4, 4);
      ctx.fillRect(2, 6, 3, 3);
      ctx.fillRect(11, 6, 3, 3);
      // Stalk
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(4, 7, 8, 7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 8, 1, 3);
      ctx.fillRect(10, 8, 1, 3);
    } else if (item.type === 'flower') {
      // Fire Flower
      const petal = Math.floor((tick / 4) % 2) === 0 ? '#ef4444' : '#f59e0b';
      ctx.fillStyle = petal;
      ctx.beginPath();
      ctx.arc(8, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(7, 11, 2, 5);
      ctx.fillRect(4, 13, 8, 2); // Leaves
    } else if (item.type === 'star') {
      // Starman
      const rainbow = ['#facc15', '#38bdf8', '#4ade80', '#f43f5e'];
      ctx.fillStyle = rainbow[Math.floor((tick / 3) % rainbow.length)];
      ctx.beginPath();
      // Draw 5 point star
      ctx.arc(8, 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(5, 6, 1, 3);
      ctx.fillRect(10, 6, 1, 3);
    } else if (item.type === 'coin_pickup') {
      this.renderWorldCoin(4, 2, tick);
    } else if (item.type === 'fireball') {
      // Fireball projectile
      const pulse = Math.floor((tick / 3) % 3);
      ctx.fillStyle = pulse === 0 ? '#ef4444' : pulse === 1 ? '#f97316' : '#facc15';
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 3, 2, 2);
    }

    ctx.restore();
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'score' && p.text) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.restore();
    });
  }
}
