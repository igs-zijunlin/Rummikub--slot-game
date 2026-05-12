import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import { TILE_W, TILE_H } from './tile';

const GAP = 8;
const CELL_W = TILE_W + GAP;
const CELL_H = TILE_H + GAP;

/** Elimination animation: tile flips, shatters into fragments + coin burst */
export async function playEliminateAnim(
  parent: Container,
  positions: [number, number][],
  tileContainers: Container[][],
): Promise<void> {
  const tl = gsap.timeline();

  for (const [reel, row] of positions) {
    const tile = tileContainers[reel]?.[row];
    if (!tile) continue;

    const x = tile.x + TILE_W / 2;
    const y = tile.y + TILE_H / 2;

    // Flip + shrink
    tl.to(tile.scale, { x: 0, duration: 0.15, ease: 'power2.in' }, 0);
    tl.to(tile, { alpha: 0, duration: 0.1 }, 0.15);

    // Spawn fragments
    for (let i = 0; i < 6; i++) {
      const frag = new Graphics();
      const size = 8 + Math.random() * 12;
      frag.rect(0, 0, size, size);
      frag.fill({ color: 0xffd700, alpha: 0.9 });
      frag.x = x;
      frag.y = y;
      frag.rotation = Math.random() * Math.PI;
      parent.addChild(frag);

      const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
      const dist = 40 + Math.random() * 60;
      tl.to(frag, {
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 30,
        alpha: 0,
        rotation: frag.rotation + Math.PI,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => frag.destroy(),
      }, 0.1);
    }

    // Coin burst particles
    for (let i = 0; i < 3; i++) {
      const coin = new Text({
        text: '🪙',
        style: { fontSize: 16 },
      });
      coin.x = x;
      coin.y = y;
      parent.addChild(coin);

      tl.to(coin, {
        x: x + (Math.random() - 0.5) * 80,
        y: y - 50 - Math.random() * 40,
        alpha: 0,
        duration: 0.4,
        ease: 'power1.out',
        onComplete: () => coin.destroy(),
      }, 0.05 * i);
    }
  }

  await tl.play();
}

/** Drop animation: tiles fall down to fill gaps, new tiles slide in from top with bounce */
export async function playDropAnim(
  tileContainers: Container[][],
  dropMap: { reel: number; from: number; to: number }[],
  newTiles: { reel: number; row: number; container: Container }[],
): Promise<void> {
  const tl = gsap.timeline();

  // Existing tiles drop down
  for (const { reel, from, to } of dropMap) {
    const tile = tileContainers[reel]?.[from];
    if (!tile) continue;
    const targetY = to * CELL_H;
    tl.to(tile, {
      y: targetY,
      duration: 0.25 + (to - from) * 0.05,
      ease: 'bounce.out',
    }, 0);
  }

  // New tiles slide in from above
  for (const { row, container } of newTiles) {
    const targetY = row * CELL_H;
    container.y = -CELL_H;
    tl.to(container, {
      y: targetY,
      duration: 0.3,
      ease: 'back.out(1.4)',
    }, 0.1);
  }

  await tl.play();
}

/** Chain multiplier UI: number scales up, screen shakes at 2+, background color at 4+ */
export async function playChainMultiplierAnim(
  parent: Container,
  multiplier: number,
  cascadeCount: number,
  shakeTarget: Container,
): Promise<void> {
  // Multiplier text popup
  const multText = new Text({
    text: `×${multiplier}`,
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 48,
      fontWeight: 'bold',
      fill: cascadeCount >= 4 ? 0xff4444 : 0xffd700,
      stroke: { color: 0x000000, width: 4 },
      dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.6 },
    },
  });
  multText.anchor.set(0.5);
  multText.x = parent.width / 2;
  multText.y = parent.height / 2;
  multText.scale.set(0);
  multText.alpha = 0;
  parent.addChild(multText);

  const tl = gsap.timeline();

  // Scale up
  tl.to(multText.scale, { x: 1.5, y: 1.5, duration: 0.2, ease: 'back.out(3)' }, 0);
  tl.to(multText, { alpha: 1, duration: 0.2 }, 0);
  tl.to(multText.scale, { x: 1, y: 1, duration: 0.15, ease: 'power2.out' }, 0.2);
  tl.to(multText, { alpha: 0, y: multText.y - 30, duration: 0.3, ease: 'power1.in' }, 0.4);
  tl.add(() => multText.destroy(), 0.7);

  // Screen shake at cascade 2+
  if (cascadeCount >= 2) {
    const intensity = Math.min(cascadeCount * 1.5, 8);
    const origX = shakeTarget.x;
    const origY = shakeTarget.y;
    for (let i = 0; i < 4; i++) {
      tl.to(shakeTarget, {
        x: origX + (Math.random() - 0.5) * intensity,
        y: origY + (Math.random() - 0.5) * intensity,
        duration: 0.04,
      }, 0.05 * i);
    }
    tl.to(shakeTarget, { x: origX, y: origY, duration: 0.05 }, 0.2);
  }

  await tl.play();
}

/** Background color overlay for cascade 4+ */
export function createCascadeOverlay(parent: Container, w: number, h: number): Graphics {
  const overlay = new Graphics();
  overlay.rect(0, 0, w, h);
  overlay.fill({ color: 0xff2200, alpha: 0 });
  parent.addChildAt(overlay, 0);
  return overlay;
}

export async function playCascadeBackground(overlay: Graphics, cascadeCount: number): Promise<void> {
  if (cascadeCount >= 4) {
    const alpha = Math.min((cascadeCount - 3) * 0.05, 0.15);
    await gsap.to(overlay, { alpha, duration: 0.3 });
  }
}

export async function resetCascadeBackground(overlay: Graphics): Promise<void> {
  await gsap.to(overlay, { alpha: 0, duration: 0.5 });
}

/** Golden Joker: slow-mo entrance with glow, sticky glow effect */
export function createGoldenJokerGlow(tile: Container): Container {
  const glow = new Graphics();
  const pad = 6;
  // Gold border
  glow.roundRect(-pad, -pad, TILE_W + pad * 2, TILE_H + pad * 2, 12);
  glow.stroke({ color: 0xffd700, width: 3, alpha: 0.9 });
  // Outer glow
  glow.roundRect(-pad - 2, -pad - 2, TILE_W + pad * 2 + 4, TILE_H + pad * 2 + 4, 14);
  glow.fill({ color: 0xffd700, alpha: 0.15 });
  tile.addChildAt(glow, 0);

  // Pulsing glow animation
  gsap.to(glow, {
    alpha: 0.5,
    duration: 0.8,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });

  return glow;
}

export async function playGoldenJokerEntrance(tile: Container): Promise<void> {
  const origScale = tile.scale.x;
  tile.scale.set(0);
  tile.alpha = 0;

  await gsap.timeline()
    .to(tile.scale, { x: origScale * 1.3, y: origScale * 1.3, duration: 0.4, ease: 'back.out(2)' })
    .to(tile, { alpha: 1, duration: 0.4 }, 0)
    .to(tile.scale, { x: origScale, y: origScale, duration: 0.2, ease: 'power2.out' });
}

export async function playGoldenJokerStickyEffect(tile: Container): Promise<void> {
  // Shield flash when surviving elimination
  const shield = new Graphics();
  shield.roundRect(-4, -4, TILE_W + 8, TILE_H + 8, 12);
  shield.fill({ color: 0xffd700, alpha: 0.4 });
  tile.addChild(shield);

  await gsap.timeline()
    .to(shield, { alpha: 0.8, duration: 0.15 })
    .to(shield, { alpha: 0, duration: 0.4, onComplete: () => shield.destroy() });
}
