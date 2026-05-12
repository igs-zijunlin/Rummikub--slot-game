import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { Reel } from './reel';
import { TILE_W, TILE_H } from './tile';
import { generateGrid, mockSpin } from './mock';
import type { SpinResult } from './types';

const REELS = 5;
const ROWS = 3;
const GAP = 8;
const CELL_W = TILE_W + GAP;
const CELL_H = TILE_H + GAP;

export class SlotMachine {
  container = new Container();
  private reels: Reel[] = [];
  private spinning = false;
  private highlightGraphics: Graphics[] = [];
  turboMode = false;

  constructor() {
    // Create mask for reel area
    const maskW = REELS * CELL_W - GAP;
    const maskH = ROWS * CELL_H - GAP;
    const mask = new Graphics();
    mask.roundRect(0, 0, maskW, maskH, 4);
    mask.fill(0xffffff);
    this.container.addChild(mask);
    this.container.mask = mask;

    for (let i = 0; i < REELS; i++) {
      const reel = new Reel(i);
      reel.container.x = i * CELL_W;
      this.container.addChild(reel.container);
      this.reels.push(reel);
    }

    // Initial display
    const grid = generateGrid();
    this.reels.forEach((reel, i) => reel.setTiles(grid[i]));
  }

  get width() { return REELS * CELL_W - GAP; }
  get height() { return ROWS * CELL_H - GAP; }

  async spin(bet: number): Promise<SpinResult> {
    if (this.spinning) return { grid: [], combos: [], winPositions: [], winAmount: 0, scatterCount: 0 };
    this.spinning = true;
    this.clearHighlights();

    const result = mockSpin(bet);

    // Spin all reels with staggered delay
    await Promise.all(
      this.reels.map((reel, i) => reel.spin(result.grid[i], i, this.turboMode))
    );

    this.spinning = false;

    if (result.winPositions.length > 0) {
      this.showWinHighlight(result.winPositions);
    }

    return result;
  }

  private showWinHighlight(positions: [number, number][]) {
    for (const [reel, row] of positions) {
      const glow = new Graphics();
      glow.roundRect(
        reel * CELL_W - 3,
        row * CELL_H - 3,
        TILE_W + 6,
        TILE_H + 6,
        10
      );
      glow.fill({ color: 0xffd700, alpha: 0.4 });
      glow.stroke({ color: 0xffd700, width: 3, alpha: 0.9 });
      this.container.addChild(glow);
      this.highlightGraphics.push(glow);

      // Pulsing animation
      gsap.to(glow, {
        alpha: 0.3,
        duration: 0.25,
        yoyo: true,
        repeat: 3,
        ease: 'sine.inOut',
      });
    }
  }

  private clearHighlights() {
    this.highlightGraphics.forEach(g => {
      gsap.killTweensOf(g);
      g.destroy();
    });
    this.highlightGraphics = [];
  }

  get isSpinning() { return this.spinning; }

  /** Re-render current reel state (used after Free Game cleanup) */
  refresh() {
    const grid = generateGrid();
    this.reels.forEach((reel, i) => reel.setTiles(grid[i]));
  }
}
