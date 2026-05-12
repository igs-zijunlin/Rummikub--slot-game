import { Container } from 'pixi.js';
import gsap from 'gsap';
import { createTileSprite, TILE_H } from './tile';
import type { SlotTile } from './types';
import { generateGrid } from './mock';

const GAP = 8;
const CELL_H = TILE_H + GAP;
const VISIBLE_ROWS = 3;

export class Reel {
  container = new Container();
  private strip = new Container();
  private tiles: Container[] = [];
  private spinning = false;

  constructor(public reelIndex: number) {
    this.container.addChild(this.strip);
  }

  setTiles(tiles: SlotTile[]) {
    this.strip.removeChildren();
    this.tiles = [];
    tiles.forEach((tile, i) => {
      const sprite = createTileSprite(tile);
      sprite.y = i * CELL_H;
      this.strip.addChild(sprite);
      this.tiles.push(sprite);
    });
  }

  async spin(finalTiles: SlotTile[], delay: number, turbo = false): Promise<void> {
    if (this.spinning) return;
    this.spinning = true;

    // Build extended strip: random tiles + final tiles at bottom
    const extendedCount = turbo ? 3 : 6;
    const randomTiles = generateGrid().flat();
    const allTiles = [...randomTiles.slice(0, extendedCount), ...finalTiles];

    this.strip.removeChildren();
    this.tiles = [];
    allTiles.forEach((tile, i) => {
      const sprite = createTileSprite(tile);
      sprite.y = i * CELL_H;
      this.strip.addChild(sprite);
      this.tiles.push(sprite);
    });

    // Start from top, animate to show final tiles at bottom
    this.strip.y = 0;
    const targetY = -(extendedCount * CELL_H);

    // Turbo: all reels finish within ~1s total (duration 0.15 + stagger 0.02)
    const duration = turbo ? 0.15 + delay * 0.02 : 0.4 + delay * 0.08;
    const stagger = turbo ? delay * 0.01 : delay * 0.06;

    await gsap.to(this.strip, {
      y: targetY,
      duration,
      ease: turbo ? 'power1.out' : 'power2.out',
      delay: stagger,
    });

    // Clean up: keep only final tiles, reset position
    this.setTiles(finalTiles);
    this.strip.y = 0;
    this.spinning = false;
  }

  get height() {
    return VISIBLE_ROWS * CELL_H - GAP;
  }
}
