import { Container } from 'pixi.js';
import gsap from 'gsap';
import {
  executeFreeGame, checkFreeGameTrigger, MULT_TABLE,
  type FGResult, type FGRoundResult, type CascadeStep, type FGTile,
} from './freeGameEngine';
import {
  playEliminateAnim, playDropAnim, playChainMultiplierAnim,
  createCascadeOverlay, playCascadeBackground, resetCascadeBackground,
  createGoldenJokerGlow, playGoldenJokerEntrance, playGoldenJokerStickyEffect,
} from './freeGameAnims';
import { playTriggerScreen, FreeGameHUD, playSettlementScreen } from './freeGameUI';
import { createFGTileSprite, TILE_W, TILE_H } from './tile';

const GAP = 8;
const CELL_W = TILE_W + GAP;
const CELL_H = TILE_H + GAP;
const REELS = 5;
const ROWS = 3;

export class FreeGameController {
  private parent: Container;
  private machineContainer: Container;
  private hud: FreeGameHUD;
  private screenW: number;
  private screenH: number;
  private cascadeOverlay: import('pixi.js').Graphics | null = null;
  private tileContainers: Container[][] = [];

  constructor(parent: Container, machineContainer: Container, screenW: number, screenH: number) {
    this.parent = parent;
    this.machineContainer = machineContainer;
    this.screenW = screenW;
    this.screenH = screenH;
    this.hud = new FreeGameHUD();
    this.parent.addChild(this.hud.container);
  }

  updateLayout(screenW: number, screenH: number, hudX: number, hudY: number, hudW: number) {
    this.screenW = screenW;
    this.screenH = screenH;
    this.hud.container.x = hudX;
    this.hud.container.y = hudY - 36;
    this.hud.layout(hudW);
  }

  /** Run the full Free Game sequence. Returns total winnings. */
  async run(bet: number, scatterCount: number): Promise<number> {
    const trigger = checkFreeGameTrigger(scatterCount);
    if (!trigger.triggered) return 0;

    // Show trigger screen
    await playTriggerScreen(this.parent, trigger.rounds, this.screenW, this.screenH);

    // Execute engine (pre-compute all rounds)
    const result = executeFreeGame(bet, trigger.rounds);

    // Show HUD
    this.hud.show();

    // Create cascade overlay
    this.cascadeOverlay = createCascadeOverlay(this.parent, this.screenW, this.screenH);

    // Play each round with animations
    let roundsPlayed = 0;
    for (const round of result.rounds) {
      roundsPlayed++;
      const remaining = result.totalRounds - roundsPlayed;
      await this.playRound(round, bet, remaining, result.totalRounds, result);
    }

    // Reset overlay
    if (this.cascadeOverlay) {
      await resetCascadeBackground(this.cascadeOverlay);
      this.cascadeOverlay.destroy();
      this.cascadeOverlay = null;
    }

    // Clean up all FG tile sprites
    this.cleanup();

    // Hide HUD
    this.hud.hide();

    // Settlement screen
    await playSettlementScreen(this.parent, result.totalWin, bet, this.screenW, this.screenH);

    return result.totalWin;
  }

  private async playRound(
    round: FGRoundResult,
    bet: number,
    roundsRemaining: number,
    roundsTotal: number,
    result: FGResult,
  ): Promise<void> {
    // Display initial grid
    this.renderGrid(round.initialGrid);
    await this.delay(0.4);

    // Update HUD
    this.hud.update(roundsRemaining + 1, roundsTotal, 1, result.totalWin - round.roundWin);

    // Play cascade steps
    let cumulativeWin = result.totalWin - round.roundWin;
    for (const step of round.cascadeSteps) {
      // Highlight winning positions
      await this.delay(0.2);

      // Play elimination animation
      await playEliminateAnim(this.machineContainer, step.eliminatedPositions, this.tileContainers);

      // Golden joker sticky effect
      for (const [col, row] of step.winPositions) {
        if (step.grid[col][row].kind === 'golden_joker') {
          const tile = this.tileContainers[col]?.[row];
          if (tile) await playGoldenJokerStickyEffect(tile);
        }
      }

      // Play chain multiplier animation
      await playChainMultiplierAnim(
        this.parent, step.multiplier, step.cascadeCount, this.machineContainer
      );

      // Background effect for cascade 4+
      if (this.cascadeOverlay) {
        await playCascadeBackground(this.cascadeOverlay, step.cascadeCount);
      }

      // Render new grid after drop
      this.renderGrid(step.newGrid);

      // Play drop animation for new tiles
      for (const [col, row] of step.newTilePositions) {
        const tile = this.tileContainers[col]?.[row];
        if (tile) {
          const targetY = tile.y;
          tile.y = -CELL_H;
          gsap.to(tile, { y: targetY, duration: 0.3, ease: 'back.out(1.4)' });
        }
      }
      await this.delay(0.35);

      // Golden joker entrance for newly appeared golden jokers
      for (const [col, row] of step.newTilePositions) {
        if (step.newGrid[col][row].kind === 'golden_joker') {
          const tile = this.tileContainers[col]?.[row];
          if (tile) {
            createGoldenJokerGlow(tile);
            await playGoldenJokerEntrance(tile);
          }
        }
      }

      // Update HUD
      cumulativeWin += step.stepWin;
      this.hud.update(roundsRemaining, roundsTotal, step.multiplier, cumulativeWin);

      await this.delay(0.2);
    }

    // Brief pause between rounds
    await this.delay(0.5);
  }

  private renderGrid(grid: FGTile[][]) {
    // Clear existing tiles from machine container
    for (const col of this.tileContainers) {
      for (const tile of col) {
        tile.destroy();
      }
    }
    this.tileContainers = [];

    for (let col = 0; col < REELS; col++) {
      const colContainers: Container[] = [];
      for (let row = 0; row < ROWS; row++) {
        const sprite = createFGTileSprite(grid[col][row]);
        sprite.x = col * CELL_W;
        sprite.y = row * CELL_H;
        this.machineContainer.addChild(sprite);
        colContainers.push(sprite);
      }
      this.tileContainers.push(colContainers);
    }
  }

  private cleanup() {
    for (const col of this.tileContainers) {
      for (const tile of col) {
        tile.destroy();
      }
    }
    this.tileContainers = [];
  }

  private delay(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }
}
