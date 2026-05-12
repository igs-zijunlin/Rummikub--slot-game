import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import type { SlotTile } from './types';

const COLOR_MAP: Record<string, number> = {
  red: 0xdc3545,
  blue: 0x1565c0,
  yellow: 0xf57c00,
  black: 0x212121,
};

export const TILE_W = 90;
export const TILE_H = 120;

// Pre-load joker texture
const jokerTexture = Texture.from('/joker-face.svg');

export function createTileSprite(tile: SlotTile): Container {
  const container = new Container();

  // Shadow layer (3D depth)
  const shadow = new Graphics();
  shadow.roundRect(3, 4, TILE_W, TILE_H, 10);
  shadow.fill({ color: 0x000000, alpha: 0.35 });
  container.addChild(shadow);

  // Main tile body
  const bg = new Graphics();
  if (tile.color === 'joker') {
    bg.roundRect(0, 0, TILE_W, TILE_H, 10);
    bg.fill(0xfff8e1);
    bg.roundRect(0, 0, TILE_W, TILE_H, 10);
    bg.stroke({ color: 0xcccccc, width: 1.5 });
    bg.roundRect(2, 2, TILE_W - 4, 20, 8);
    bg.fill({ color: 0xffffff, alpha: 0.6 });
  } else {
    bg.roundRect(0, 0, TILE_W, TILE_H, 10);
    bg.fill(0xfefefe);
    bg.roundRect(2, 2, TILE_W - 4, 20, 8);
    bg.fill({ color: 0xffffff, alpha: 0.6 });
    bg.roundRect(0, 0, TILE_W, TILE_H, 10);
    bg.stroke({ color: 0xcccccc, width: 1.5 });
    bg.roundRect(8, 6, TILE_W - 16, 3, 2);
    bg.fill({ color: COLOR_MAP[tile.color], alpha: 0.7 });
  }
  container.addChild(bg);

  if (tile.color === 'joker') {
    // Joker face image
    const face = new Sprite(jokerTexture);
    const faceSize = 74;
    face.width = faceSize;
    face.height = faceSize;
    face.x = (TILE_W - faceSize) / 2;
    face.y = (TILE_H - faceSize) / 2;
    container.addChild(face);
  } else {
    // Number text
    const text = new Text({
      text: String(tile.number),
      style: {
        fontFamily: 'Georgia, serif',
        fontSize: 36,
        fontWeight: 'bold',
        fill: COLOR_MAP[tile.color],
        dropShadow: { color: 0x000000, blur: 1, distance: 1, alpha: 0.2 },
      },
    });
    text.anchor.set(0.5);
    text.x = TILE_W / 2;
    text.y = TILE_H / 2;
    container.addChild(text);

    // Corner numbers
    const cornerStyle = { fontFamily: 'Arial', fontSize: 11, fontWeight: 'bold' as const, fill: COLOR_MAP[tile.color] };
    const tl = new Text({ text: String(tile.number), style: cornerStyle });
    tl.x = 8; tl.y = 12;
    container.addChild(tl);
    const br = new Text({ text: String(tile.number), style: cornerStyle });
    br.anchor.set(1, 1);
    br.x = TILE_W - 8; br.y = TILE_H - 8;
    container.addChild(br);
  }

  return container;
}
