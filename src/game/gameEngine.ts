import { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILES, PHYSICS } from './constants';
import { GameEntity, LevelData, Particle, BumpingBlock } from './types';
import { QuizQuestion } from '../data/ermNotesData';
import { sound } from '../audio/soundEffects';

export interface GameEngineEvents {
  onQuestionTrigger: (question: QuizQuestion, isGate: boolean, blockCoord?: string) => void;
  onLevelComplete: (stats: { timeBonus: number; finalScore: number }) => void;
  onGameOver: () => void;
  onCoinCollected: (count: number) => void;
  onLifeLost: (remainingLives: number) => void;
  onScoreAdded: (pts: number) => void;
}

export class GameEngine {
  public mario: GameEntity;
  public level: LevelData;
  public cameraX: number = 0;
  public marioState: 'small' | 'super' | 'fire' = 'small';
  public isInvincible: boolean = false;
  public invincibleTimer: number = 0;
  public isStar: boolean = false;
  public starTimer: number = 0;

  public enemies: GameEntity[] = [];
  public items: GameEntity[] = [];
  public particles: Particle[] = [];
  public bumpingBlocks: BumpingBlock[] = [];

  // Flagpole sequence state
  public flagpoleState: 'none' | 'sliding' | 'walking_to_castle' | 'completed' = 'none';
  public flagpoleY: number = 0;

  // Mario physics trackers
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private jumpHoldTimer: number = 0;
  private isJumping: boolean = false;
  private isDeadAnimation: boolean = false;
  private deadTimer: number = 0;

  // Input states
  public keys: Record<string, boolean> = {};
  public justPressedKeys: Record<string, boolean> = {};

  // Hitstop freeze (milliseconds)
  private hitstopTimer: number = 0;

  // Event callbacks
  private events: GameEngineEvents;

  // Global simulation tick
  public globalTick: number = 0;

  constructor(level: LevelData, events: GameEngineEvents) {
    this.level = level;
    this.events = events;

    this.mario = {
      id: 'mario',
      type: 'mario',
      x: 32,
      y: 160,
      vx: 0,
      vy: 0,
      width: 12,
      height: 16,
      facing: 'right',
      isGrounded: false,
      dead: false,
      animFrame: 0,
      animTimer: 0,
    };

    this.flagpoleY = (14 - 10) * TILE_SIZE;
    this.initEnemies();
  }

  public initEnemies() {
    this.enemies = this.level.enemies.map((e, idx) => ({
      id: `enemy-${idx}`,
      type: e.type,
      x: e.x,
      y: e.y,
      vx: -0.6,
      vy: 0,
      width: 14,
      height: 16,
      facing: 'left',
      isGrounded: false,
      dead: false,
      animFrame: 0,
      animTimer: 0,
    }));
  }

  public resetMarioPosition() {
    this.mario.x = 32;
    this.mario.y = 160;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.mario.dead = false;
    this.isDeadAnimation = false;
    this.deadTimer = 0;
    this.mario.isGrounded = false;
    this.cameraX = 0;
    this.flagpoleState = 'none';
    this.flagpoleY = (14 - 10) * TILE_SIZE;
  }

  public handleKeyDown(code: string) {
    if (!this.keys[code]) {
      this.justPressedKeys[code] = true;
    }
    this.keys[code] = true;
  }

  public handleKeyUp(code: string) {
    this.keys[code] = false;
    this.justPressedKeys[code] = false;
  }

  public clearInputs() {
    this.keys = {};
    this.justPressedKeys = {};
  }

  public update(dt: number) {
    this.globalTick++;

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt * 1000;
      return;
    }

    // Mario Death animation
    if (this.isDeadAnimation) {
      this.deadTimer += dt;
      this.mario.y += this.mario.vy;
      this.mario.vy += PHYSICS.GRAVITY * 0.9;
      if (this.deadTimer > 2.0) {
        this.events.onLifeLost(0);
      }
      return;
    }

    // Flagpole cutscene sequence
    if (this.flagpoleState === 'sliding') {
      const bottomY = (14 - 1) * TILE_SIZE - this.mario.height;
      if (this.mario.y < bottomY) {
        this.mario.y += 2.5;
        this.flagpoleY = Math.min(this.flagpoleY + 2.5, (14 - 2) * TILE_SIZE);
      } else {
        this.flagpoleState = 'walking_to_castle';
        this.mario.facing = 'right';
        sound.playVictoryFanfare();
      }
      return;
    }

    if (this.flagpoleState === 'walking_to_castle') {
      const castleDoorX = (this.level.castleX + 2) * TILE_SIZE + 4;
      if (this.mario.x < castleDoorX) {
        this.mario.x += 1.2;
        this.mario.vx = 1.2;
      } else {
        this.flagpoleState = 'completed';
        this.events.onLevelComplete({
          timeBonus: 500,
          finalScore: 1000,
        });
      }
      return;
    }

    // Invincibility timers
    if (this.isInvincible) {
      this.invincibleTimer--;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }
    if (this.isStar) {
      this.starTimer--;
      if (this.starTimer <= 0) {
        this.isStar = false;
      }
    }

    // Update Mario Physics & Input
    this.updateMario(dt);

    // Update Bumping Blocks
    this.updateBumpingBlocks();

    // Update Items
    this.updateItems();

    // Update Enemies
    this.updateEnemies();

    // Update Particles
    this.updateParticles();

    // Update Camera (smooth horizontal scrolling)
    const targetCameraX = Math.max(0, this.mario.x - VIEWPORT_WIDTH * 0.38);
    const maxCameraX = this.level.mapWidth * TILE_SIZE - VIEWPORT_WIDTH;
    this.cameraX = Math.min(Math.max(this.cameraX, targetCameraX), maxCameraX);

    // Reset edge-triggered inputs for the next frame
    this.justPressedKeys = {};
  }

  private updateMario(dt: number) {
    const m = this.mario;
    const isSuper = this.marioState !== 'small';
    m.height = isSuper ? 22 : 15;

    // Movement Inputs
    const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const right = this.keys['KeyD'] || this.keys['ArrowRight'];
    const run = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    const jumpPressed = this.justPressedKeys['Space'] || this.justPressedKeys['KeyW'] || this.justPressedKeys['ArrowUp'];
    const jumpHeld = this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp'];
    const fireAction = this.justPressedKeys['KeyF'] || this.justPressedKeys['KeyE'];

    // Jump Buffering
    if (jumpPressed) {
      this.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer--;
    }

    // Coyote Time
    if (m.isGrounded) {
      this.coyoteTimer = PHYSICS.COYOTE_TIME;
      this.isJumping = false;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    // Horizontal Acceleration
    const maxSpeed = run ? PHYSICS.MAX_RUN_SPEED : PHYSICS.MAX_WALK_SPEED;
    const accel = run ? PHYSICS.RUN_ACCEL : PHYSICS.WALK_ACCEL;

    if (left && !right) {
      m.vx -= accel;
      m.facing = 'left';
    } else if (right && !left) {
      m.vx += accel;
      m.facing = 'right';
    } else {
      m.vx *= PHYSICS.FRICTION;
      if (Math.abs(m.vx) < 0.05) m.vx = 0;
    }

    // Clamp speed
    m.vx = Math.max(-maxSpeed, Math.min(maxSpeed, m.vx));

    // Jump Execution
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && !this.isJumping) {
      m.vy = isSuper ? PHYSICS.SUPER_JUMP_FORCE : PHYSICS.JUMP_FORCE;
      m.isGrounded = false;
      this.isJumping = true;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.jumpHoldTimer = 12;
      sound.playJump(isSuper);

      // Dust particle
      this.spawnSmoke(m.x + m.width / 2, m.y + m.height);
    }

    // Variable jump height: cut jump short if released early
    if (this.isJumping && jumpHeld && this.jumpHoldTimer > 0) {
      m.vy -= 0.15;
      this.jumpHoldTimer--;
    }

    // Gravity
    m.vy += PHYSICS.GRAVITY;
    m.vy = Math.min(m.vy, PHYSICS.MAX_FALL_SPEED);

    // Fireball shooting (Fire Mario)
    if (fireAction && this.marioState === 'fire') {
      this.shootFireball();
    }

    // Move horizontally & test collisions
    m.x += m.vx;
    this.checkHorizontalCollisions(m);

    // Prevent moving backwards past the camera
    if (m.x < this.cameraX) {
      m.x = this.cameraX;
      m.vx = 0;
    }

    // Move vertically & test collisions
    m.y += m.vy;
    m.isGrounded = false;
    this.checkVerticalCollisions(m);

    // Check Flagpole trigger
    const flagTileX = this.level.flagpoleX * TILE_SIZE;
    if (
      this.flagpoleState === 'none' &&
      m.x + m.width >= flagTileX &&
      m.x <= flagTileX + 8 &&
      m.y <= 14 * TILE_SIZE
    ) {
      this.triggerFlagpole();
      return;
    }

    // Check Fall in Pit or Lava
    if (m.y > VIEWPORT_HEIGHT + 20) {
      this.killMario();
    }
  }

  private triggerFlagpole() {
    this.flagpoleState = 'sliding';
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.mario.x = this.level.flagpoleX * TILE_SIZE - 2;
    sound.playFlagpole();
    this.addFloatingText(this.mario.x, this.mario.y - 10, 'CLEAR! +5000');
    this.events.onScoreAdded(5000);
  }

  public killMario() {
    if (this.isDeadAnimation) return;
    this.mario.dead = true;
    this.isDeadAnimation = true;
    this.deadTimer = 0;
    this.mario.vy = -7.5;
    this.mario.vx = 0;
    sound.playGameOver();
  }

  public hurtMario() {
    if (this.isInvincible || this.isStar || this.isDeadAnimation) return;

    if (this.marioState === 'fire') {
      this.marioState = 'super';
      this.isInvincible = true;
      this.invincibleTimer = PHYSICS.INVINCIBLE_TIME;
      sound.playHurt();
      this.hitstop(50);
    } else if (this.marioState === 'super') {
      this.marioState = 'small';
      this.isInvincible = true;
      this.invincibleTimer = PHYSICS.INVINCIBLE_TIME;
      sound.playHurt();
      this.hitstop(50);
    } else {
      this.killMario();
    }
  }

  private checkHorizontalCollisions(m: GameEntity) {
    const leftTile = Math.floor(m.x / TILE_SIZE);
    const rightTile = Math.floor((m.x + m.width) / TILE_SIZE);
    const topTile = Math.floor(m.y / TILE_SIZE);
    const bottomTile = Math.floor((m.y + m.height - 1) / TILE_SIZE);

    for (let ty = topTile; ty <= bottomTile; ty++) {
      for (let tx = leftTile; tx <= rightTile; tx++) {
        if (this.isSolidTile(tx, ty)) {
          // Check if knowledge gate
          if (this.isKnowledgeGate(tx, ty)) {
            const gate = this.level.knowledgeGate;
            if (gate && !gate.opened) {
              m.vx = 0;
              m.x = tx * TILE_SIZE - m.width - 1;
              this.events.onQuestionTrigger(gate.question, true);
              return;
            }
          }

          if (m.vx > 0) {
            m.x = tx * TILE_SIZE - m.width;
            m.vx = 0;
          } else if (m.vx < 0) {
            m.x = (tx + 1) * TILE_SIZE;
            m.vx = 0;
          }
        }
      }
    }
  }

  private checkVerticalCollisions(m: GameEntity) {
    const leftTile = Math.floor(m.x / TILE_SIZE);
    const rightTile = Math.floor((m.x + m.width) / TILE_SIZE);
    const topTile = Math.floor(m.y / TILE_SIZE);
    const bottomTile = Math.floor((m.y + m.height) / TILE_SIZE);

    for (let ty = topTile; ty <= bottomTile; ty++) {
      for (let tx = leftTile; tx <= rightTile; tx++) {
        // Collect free world coins
        if (this.getTile(tx, ty) === TILES.COIN_IN_WORLD) {
          this.setTile(tx, ty, TILES.EMPTY);
          sound.playCoin();
          this.events.onCoinCollected(1);
          this.spawnSparkles(tx * TILE_SIZE + 8, ty * TILE_SIZE + 8);
          this.addFloatingText(tx * TILE_SIZE, ty * TILE_SIZE, '+100');
          this.events.onScoreAdded(100);
        }

        if (this.isSolidTile(tx, ty)) {
          // Check falling on top of solid
          if (m.vy >= 0 && m.y + m.height - m.vy <= ty * TILE_SIZE + 4) {
            m.y = ty * TILE_SIZE - m.height;
            m.vy = 0;
            m.isGrounded = true;
          }
          // Check hitting ceiling block from below!
          else if (m.vy < 0 && m.y - m.vy >= (ty + 1) * TILE_SIZE - 4) {
            m.y = (ty + 1) * TILE_SIZE;
            m.vy = 0;
            this.handleCeilingBlockHit(tx, ty);
          }
        }
      }
    }
  }

  private handleCeilingBlockHit(tx: number, ty: number) {
    const tile = this.getTile(tx, ty);
    const coord = `${tx},${ty}`;

    if (tile === TILES.QUESTION) {
      // Turn question block into spent block
      this.setTile(tx, ty, TILES.QUESTION_EMPTY);
      this.triggerBumpingBlock(tx, ty, TILES.QUESTION_EMPTY);
      sound.playBump();
      this.hitstop(30);

      // Check if this block holds an ERM question!
      const question = this.level.questionBlocks[coord];
      if (question) {
        sound.playQuestionPopup();
        this.events.onQuestionTrigger(question, false, coord);
      } else {
        // Normal coin block
        sound.playCoin();
        this.events.onCoinCollected(1);
        this.spawnCoinParticle(tx * TILE_SIZE + 4, (ty - 1) * TILE_SIZE);
      }
    } else if (tile === TILES.BRICK) {
      if (this.marioState !== 'small') {
        // Super/Fire Mario shatters brick!
        this.setTile(tx, ty, TILES.EMPTY);
        sound.playBlockBump();
        this.spawnBrickDebris(tx * TILE_SIZE, ty * TILE_SIZE);
        this.events.onScoreAdded(50);
        this.hitstop(20);
      } else {
        // Small Mario bumps brick
        this.triggerBumpingBlock(tx, ty, TILES.BRICK);
        sound.playBump();
      }
    }
  }

  public answerQuestionSuccess(isGate: boolean, blockCoord?: string) {
    sound.playCorrect();
    this.events.onScoreAdded(200);
    this.addFloatingText(this.mario.x, this.mario.y - 12, 'CORRECT! +200');

    if (isGate) {
      // Unlock knowledge gate!
      if (this.level.knowledgeGate) {
        this.level.knowledgeGate.opened = true;
        const gx = this.level.knowledgeGate.x;
        // Erase gate tiles
        for (let gy = this.level.knowledgeGate.y; gy <= 14; gy++) {
          if (this.getTile(gx, gy) === TILES.KNOWLEDGE_GATE) {
            this.setTile(gx, gy, TILES.EMPTY);
            this.spawnSparkles(gx * TILE_SIZE + 8, gy * TILE_SIZE + 8, '#60a5fa');
          }
        }
      }
    } else if (blockCoord) {
      // Spawn reward item from question block!
      const [bxStr, byStr] = blockCoord.split(',');
      const bx = parseInt(bxStr, 10);
      const by = parseInt(byStr, 10);

      // Random reward: Mushroom, Flower, or Star!
      const rand = Math.random();
      if (this.marioState === 'small') {
        this.spawnItem('mushroom', bx * TILE_SIZE, (by - 1) * TILE_SIZE);
      } else if (rand > 0.45) {
        this.spawnItem('flower', bx * TILE_SIZE, (by - 1) * TILE_SIZE);
      } else {
        this.spawnItem('star', bx * TILE_SIZE, (by - 1) * TILE_SIZE);
      }
    }
  }

  public answerQuestionFailure() {
    sound.playWrong();
    this.addFloatingText(this.mario.x, this.mario.y - 12, 'WRONG! REVIEW NOTE');
  }

  private triggerBumpingBlock(x: number, y: number, tileType: number) {
    this.bumpingBlocks.push({
      x,
      y,
      offsetY: 0,
      velocityY: -3.5,
      tileType,
    });
  }

  private updateBumpingBlocks() {
    for (let i = this.bumpingBlocks.length - 1; i >= 0; i--) {
      const b = this.bumpingBlocks[i];
      b.offsetY += b.velocityY;
      b.velocityY += 0.5;
      if (b.offsetY >= 0) {
        this.bumpingBlocks.splice(i, 1);
      }
    }
  }

  public spawnItem(type: 'mushroom' | 'flower' | 'star', x: number, y: number) {
    sound.playPowerUpSprout();
    this.items.push({
      id: `item-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      vx: type === 'flower' ? 0 : 1.0,
      vy: -2.0,
      width: 14,
      height: 14,
      facing: 'right',
      isGrounded: false,
      dead: false,
      animFrame: 0,
      animTimer: 0,
    });
  }

  private shootFireball() {
    sound.playFireball();
    const dir = this.mario.facing === 'right' ? 1 : -1;
    this.items.push({
      id: `fireball-${Date.now()}`,
      type: 'fireball',
      x: this.mario.x + (dir === 1 ? this.mario.width : -6),
      y: this.mario.y + 6,
      vx: dir * 4.2,
      vy: 1.5,
      width: 8,
      height: 8,
      facing: this.mario.facing,
      isGrounded: false,
      dead: false,
      animFrame: 0,
      animTimer: 0,
    });
  }

  private updateItems() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];

      if (it.type === 'flower') {
        // Stationary flower
      } else if (it.type === 'fireball') {
        it.x += it.vx;
        it.y += it.vy;
        it.vy += 0.28;

        // Bounce on solid floor
        const bottomTile = Math.floor((it.y + it.height) / TILE_SIZE);
        const colTile = Math.floor(it.x / TILE_SIZE);
        if (this.isSolidTile(colTile, bottomTile)) {
          it.y = bottomTile * TILE_SIZE - it.height;
          it.vy = -3.2; // Bounce
        }

        // Fireball hits enemies
        this.enemies.forEach(e => {
          if (!e.dead && this.checkAABB(it, e)) {
            e.dead = true;
            sound.playStomp();
            this.spawnSparkles(e.x + 8, e.y + 8, '#f97316');
            this.addFloatingText(e.x, e.y, '+200');
            this.events.onScoreAdded(200);
            it.dead = true;
          }
        });

        if (it.x > this.cameraX + VIEWPORT_WIDTH + 20 || it.x < this.cameraX - 20 || it.y > VIEWPORT_HEIGHT) {
          it.dead = true;
        }
      } else {
        // Mushroom / Star moving physics
        it.vy += PHYSICS.GRAVITY * 0.8;
        it.x += it.vx;

        // Horizontal wall collision
        const leftTile = Math.floor(it.x / TILE_SIZE);
        const rightTile = Math.floor((it.x + it.width) / TILE_SIZE);
        const midY = Math.floor((it.y + 7) / TILE_SIZE);

        if (it.vx > 0 && this.isSolidTile(rightTile, midY)) {
          it.vx = -it.vx;
        } else if (it.vx < 0 && this.isSolidTile(leftTile, midY)) {
          it.vx = -it.vx;
        }

        it.y += it.vy;
        const botTile = Math.floor((it.y + it.height) / TILE_SIZE);
        const centerTileX = Math.floor((it.x + 7) / TILE_SIZE);
        if (this.isSolidTile(centerTileX, botTile)) {
          it.y = botTile * TILE_SIZE - it.height;
          it.vy = it.type === 'star' ? -4.5 : 0;
          it.isGrounded = true;
        }
      }

      // Mario touches item
      if (!it.dead && this.checkAABB(this.mario, it)) {
        if (it.type === 'mushroom') {
          sound.playPowerUpCollect();
          if (this.marioState === 'small') {
            this.marioState = 'super';
          }
          this.events.onScoreAdded(1000);
          this.addFloatingText(it.x, it.y, 'SUPER! +1000');
          this.hitstop(30);
          it.dead = true;
        } else if (it.type === 'flower') {
          sound.playPowerUpCollect();
          this.marioState = 'fire';
          this.events.onScoreAdded(1000);
          this.addFloatingText(it.x, it.y, 'FIRE! +1000');
          this.hitstop(30);
          it.dead = true;
        } else if (it.type === 'star') {
          sound.playPowerUpCollect();
          this.isStar = true;
          this.starTimer = PHYSICS.STAR_TIME;
          this.events.onScoreAdded(1000);
          this.addFloatingText(it.x, it.y, 'STAR! +1000');
          it.dead = true;
        }
      }

      if (it.dead || it.y > VIEWPORT_HEIGHT + 20) {
        this.items.splice(i, 1);
      }
    }
  }

  private updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.dead) {
        if (e.deathTimer !== undefined) {
          e.deathTimer--;
          if (e.deathTimer <= 0) {
            this.enemies.splice(i, 1);
          }
        } else {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      // Only update if near camera
      if (e.x > this.cameraX + VIEWPORT_WIDTH + 40 || e.x < this.cameraX - 60) {
        continue;
      }

      // Gravity
      e.vy += PHYSICS.GRAVITY;
      e.y += e.vy;

      // Floor collision
      const botTile = Math.floor((e.y + e.height) / TILE_SIZE);
      const centerTileX = Math.floor((e.x + 7) / TILE_SIZE);
      if (this.isSolidTile(centerTileX, botTile)) {
        e.y = botTile * TILE_SIZE - e.height;
        e.vy = 0;
        e.isGrounded = true;
      }

      // Horizontal movement
      e.x += e.vx;
      const leftTile = Math.floor(e.x / TILE_SIZE);
      const rightTile = Math.floor((e.x + e.width) / TILE_SIZE);
      const midTileY = Math.floor((e.y + 8) / TILE_SIZE);

      if (e.vx > 0 && this.isSolidTile(rightTile, midTileY)) {
        e.vx = -Math.abs(e.vx);
        e.facing = 'left';
      } else if (e.vx < 0 && this.isSolidTile(leftTile, midTileY)) {
        e.vx = Math.abs(e.vx);
        e.facing = 'right';
      }

      // Enemy vs Enemy (shells wipe out enemies)
      if (e.type === 'koopa_shell' && Math.abs(e.vx) > 1.5) {
        this.enemies.forEach(other => {
          if (other !== e && !other.dead && this.checkAABB(e, other)) {
            other.dead = true;
            sound.playStomp();
            this.spawnSparkles(other.x, other.y);
            this.events.onScoreAdded(200);
          }
        });
      }

      // Mario vs Enemy collision
      if (this.checkAABB(this.mario, e)) {
        // If Mario has Star invincibility
        if (this.isStar) {
          e.dead = true;
          sound.playStomp();
          this.spawnSparkles(e.x, e.y, '#fde047');
          this.addFloatingText(e.x, e.y, '+200');
          this.events.onScoreAdded(200);
          continue;
        }

        // Mario stomps enemy from above!
        const isStomping = this.mario.vy > 0 && this.mario.y + this.mario.height - this.mario.vy <= e.y + 8;

        if (isStomping) {
          this.mario.vy = PHYSICS.BOUNCE_FORCE;
          sound.playStomp();
          this.hitstop(40);

          if (e.type === 'goomba') {
            e.squashed = true;
            e.dead = true;
            e.deathTimer = 18;
            this.addFloatingText(e.x, e.y, '+100');
            this.events.onScoreAdded(100);
          } else if (e.type === 'koopa') {
            // Turn Koopa into shell
            e.type = 'koopa_shell';
            e.vx = 0;
            this.addFloatingText(e.x, e.y, '+100');
            this.events.onScoreAdded(100);
          } else if (e.type === 'koopa_shell') {
            // Kick shell
            e.vx = this.mario.facing === 'right' ? 4.5 : -4.5;
            sound.playBump();
          }
        } else {
          // Mario touched enemy from side
          if (e.type === 'koopa_shell' && e.vx === 0) {
            // Kick stationary shell
            e.vx = this.mario.x < e.x ? 4.5 : -4.5;
            sound.playBump();
          } else {
            this.hurtMario();
          }
        }
      }
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.type === 'debris') {
        p.vy += 0.25; // Debris gravity
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private hitstop(ms: number) {
    this.hitstopTimer = ms;
  }

  public addFloatingText(x: number, y: number, text: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -0.6,
      life: 45,
      maxLife: 45,
      color: '#ffffff',
      size: 8,
      type: 'score',
      text,
    });
  }

  public spawnSparkles(x: number, y: number, color: string = '#facc15') {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 1.2 + Math.random() * 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 25,
        maxLife: 25,
        color,
        size: 3,
        type: 'sparkle',
      });
    }
  }

  public spawnSmoke(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() * 8 - 4),
        y: y - 2,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4,
        life: 18,
        maxLife: 18,
        color: 'rgba(255,255,255,0.7)',
        size: 4,
        type: 'smoke',
      });
    }
  }

  public spawnCoinParticle(x: number, y: number) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -3.5,
      life: 22,
      maxLife: 22,
      color: '#facc15',
      size: 6,
      type: 'debris',
    });
  }

  public spawnBrickDebris(x: number, y: number) {
    const velocities = [
      { vx: -1.8, vy: -4.5 },
      { vx: 1.8, vy: -4.5 },
      { vx: -1.2, vy: -2.8 },
      { vx: 1.2, vy: -2.8 },
    ];
    velocities.forEach(v => {
      this.particles.push({
        x: x + 4,
        y: y + 4,
        vx: v.vx,
        vy: v.vy,
        life: 30,
        maxLife: 30,
        color: '#b84418',
        size: 5,
        type: 'debris',
      });
    });
  }

  private checkAABB(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public getTile(tx: number, ty: number): number {
    if (ty < 0 || ty >= this.level.mapHeight || tx < 0 || tx >= this.level.mapWidth) {
      return TILES.EMPTY;
    }
    return this.level.tiles[ty][tx];
  }

  public setTile(tx: number, ty: number, val: number) {
    if (ty >= 0 && ty < this.level.mapHeight && tx >= 0 && tx < this.level.mapWidth) {
      this.level.tiles[ty][tx] = val;
    }
  }

  public isSolidTile(tx: number, ty: number): boolean {
    const tile = this.getTile(tx, ty);
    return (
      tile === TILES.GROUND ||
      tile === TILES.BRICK ||
      tile === TILES.QUESTION ||
      tile === TILES.QUESTION_EMPTY ||
      tile === TILES.HARD_BLOCK ||
      tile === TILES.PIPE_TOP_LEFT ||
      tile === TILES.PIPE_TOP_RIGHT ||
      tile === TILES.PIPE_BODY_LEFT ||
      tile === TILES.PIPE_BODY_RIGHT ||
      tile === TILES.CASTLE_BRICK ||
      tile === TILES.PLATFORM_WOOD ||
      tile === TILES.KNOWLEDGE_GATE
    );
  }

  public isKnowledgeGate(tx: number, ty: number): boolean {
    return this.getTile(tx, ty) === TILES.KNOWLEDGE_GATE;
  }
}
