import { Container, Graphics, Text } from 'pixi.js';
import type { SlotTile } from './types';

const COLOR_MAP: Record<string, number> = {
  red: 0xdc3545,
  blue: 0x0d6efd,
  yellow: 0xffc107,
  black: 0x343a40,
};

export const TILE_W = 90;
export const TILE_H = 120;

export function createTileSprite(tile: SlotTile): Container {
  const container = new Container();

  const bg = new Graphics();
  if (tile.color === 'joker') {
    bg.roundRect(0, 0, TILE_W, TILE_H, 8);
    bg.fill(0x9b59b6);
    bg.roundRect(2, 2, TILE_W - 4, TILE_H - 4, 6);
    bg.fill(0xe91e63);
  } else {
    bg.roundRect(0, 0, TILE_W, TILE_H, 8);
    bg.fill(COLOR_MAP[tile.color]);
    // Inner border
    bg.roundRect(3, 3, TILE_W - 6, TILE_H - 6, 6);
    bg.fill({ color: 0xffffff, alpha: 0.15 });
  }
  container.addChild(bg);

  const label = tile.color === 'joker' ? 'W' : String(tile.number);
  const text = new Text({
    text: label,
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: tile.color === 'joker' ? 36 : 32,
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: { color: 0x000000, blur: 2, distance: 1 },
    },
  });
  text.anchor.set(0.5);
  text.x = TILE_W / 2;
  text.y = TILE_H / 2;
  container.addChild(text);

  if (tile.color === 'joker') {
    const jokerLabel = new Text({
      text: 'JOKER',
      style: { fontFamily: 'Arial', fontSize: 12, fontWeight: 'bold', fill: 0xffd700 },
    });
    jokerLabel.anchor.set(0.5);
    jokerLabel.x = TILE_W / 2;
    jokerLabel.y = TILE_H - 16;
    container.addChild(jokerLabel);
  }

  return container;
}
