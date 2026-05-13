import { Container, Graphics, Text } from 'pixi.js';
import gsap from 'gsap';

/** Free Game trigger screen: scatter collect → FREE GAME text → round count */
export async function playTriggerScreen(
  parent: Container,
  rounds: number,
  screenW: number,
  screenH: number,
): Promise<void> {
  const overlay = new Container();
  parent.addChild(overlay);

  // Dark backdrop
  const bg = new Graphics();
  bg.rect(0, 0, screenW, screenH);
  bg.fill({ color: 0x000000, alpha: 0 });
  overlay.addChild(bg);

  // FREE GAME text
  const freeText = new Text({
    text: '🎰 FREE GAME',
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 52,
      fontWeight: 'bold',
      fill: 0xffd700,
      stroke: { color: 0x8b0000, width: 5 },
      dropShadow: { color: 0x000000, blur: 8, distance: 4, alpha: 0.7 },
    },
  });
  freeText.anchor.set(0.5);
  freeText.x = screenW / 2;
  freeText.y = screenH / 2 - 30;
  freeText.scale.set(0);
  freeText.alpha = 0;
  overlay.addChild(freeText);

  // Round count text
  const roundText = new Text({
    text: `${rounds} 回合`,
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 32,
      fontWeight: 'bold',
      fill: 0xffffff,
      dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.5 },
    },
  });
  roundText.anchor.set(0.5);
  roundText.x = screenW / 2;
  roundText.y = screenH / 2 + 40;
  roundText.alpha = 0;
  overlay.addChild(roundText);

  // Gold burst particles
  const particles: Graphics[] = [];
  for (let i = 0; i < 12; i++) {
    const p = new Graphics();
    p.star(0, 0, 4, 8, 4);
    p.fill(0xffd700);
    p.x = screenW / 2;
    p.y = screenH / 2;
    p.alpha = 0;
    overlay.addChild(p);
    particles.push(p);
  }

  const tl = gsap.timeline();

  // Backdrop fade in
  tl.to(bg, { alpha: 0.7, duration: 0.3 }, 0);

  // Particles burst
  particles.forEach((p, i) => {
    const angle = (Math.PI * 2 * i) / 12;
    const dist = 120 + Math.random() * 60;
    tl.to(p, { alpha: 1, duration: 0.1 }, 0.2);
    tl.to(p, {
      x: screenW / 2 + Math.cos(angle) * dist,
      y: screenH / 2 + Math.sin(angle) * dist,
      alpha: 0,
      rotation: Math.PI,
      duration: 0.6,
      ease: 'power2.out',
    }, 0.3);
  });

  // FREE GAME text entrance
  tl.to(freeText.scale, { x: 1.2, y: 1.2, duration: 0.3, ease: 'back.out(3)' }, 0.2);
  tl.to(freeText, { alpha: 1, duration: 0.3 }, 0.2);
  tl.to(freeText.scale, { x: 1, y: 1, duration: 0.2, ease: 'power2.out' }, 0.5);

  // Round count
  tl.to(roundText, { alpha: 1, duration: 0.3 }, 0.6);

  // Hold then fade out
  tl.to(overlay, { alpha: 0, duration: 0.4, delay: 1.0, onComplete: () => overlay.destroy() });

  await tl.play();
}

/** Free Game HUD: remaining rounds, current multiplier, accumulated winnings */
export class FreeGameHUD {
  container = new Container();
  private roundsText: Text;
  private multiplierText: Text;
  private winText: Text;
  private bgGraphics: Graphics;

  constructor() {
    this.bgGraphics = new Graphics();
    this.container.addChild(this.bgGraphics);

    this.roundsText = new Text({
      text: '',
      style: { fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 'bold', fill: 0xffffff },
    });
    this.roundsText.x = 10;
    this.roundsText.y = 6;
    this.container.addChild(this.roundsText);

    this.multiplierText = new Text({
      text: '',
      style: { fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 'bold', fill: 0xffd700 },
    });
    this.multiplierText.x = 160;
    this.multiplierText.y = 6;
    this.container.addChild(this.multiplierText);

    this.winText = new Text({
      text: '',
      style: { fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 'bold', fill: 0x44ff44 },
    });
    this.winText.x = 300;
    this.winText.y = 6;
    this.container.addChild(this.winText);

    this.container.visible = false;
  }

  show() {
    this.container.visible = true;
    this.container.alpha = 0;
    gsap.to(this.container, { alpha: 1, duration: 0.3 });
  }

  hide() {
    gsap.to(this.container, { alpha: 0, duration: 0.3, onComplete: () => { this.container.visible = false; } });
  }

  update(roundsRemaining: number, roundsTotal: number, multiplier: number, totalWin: number) {
    this.roundsText.text = `🎲 ${roundsRemaining}/${roundsTotal}`;
    this.multiplierText.text = `⚡ ×${multiplier}`;
    this.winText.text = `💰 ${totalWin}`;
  }

  layout(width: number) {
    const s = Math.min(width / 490, 1);
    const fontSize = Math.max(11, Math.round(14 * s));
    const h = Math.max(24, Math.round(30 * s));

    this.bgGraphics.clear();
    this.bgGraphics.roundRect(0, 0, width, h, 5);
    this.bgGraphics.fill({ color: 0x1a0033, alpha: 0.8 });
    this.bgGraphics.roundRect(0, 0, width, h, 5);
    this.bgGraphics.stroke({ color: 0xffd700, width: 1.5, alpha: 0.6 });

    this.roundsText.style.fontSize = fontSize;
    this.multiplierText.style.fontSize = fontSize;
    this.winText.style.fontSize = fontSize;

    const third = width / 3;
    const textY = (h - fontSize) / 2;
    this.roundsText.x = 6;
    this.roundsText.y = textY;
    this.multiplierText.x = third + 6;
    this.multiplierText.y = textY;
    this.winText.x = third * 2 + 6;
    this.winText.y = textY;
  }
}

/** Settlement screen: number counting up total winnings */
export async function playSettlementScreen(
  parent: Container,
  totalWin: number,
  bet: number,
  screenW: number,
  screenH: number,
): Promise<void> {
  const overlay = new Container();
  parent.addChild(overlay);

  // Dark backdrop
  const bg = new Graphics();
  bg.rect(0, 0, screenW, screenH);
  bg.fill({ color: 0x000000, alpha: 0 });
  overlay.addChild(bg);

  // Title
  const titleText = new Text({
    text: '🏆 FREE GAME 結算',
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xffd700,
      stroke: { color: 0x000000, width: 3 },
    },
  });
  titleText.anchor.set(0.5);
  titleText.x = screenW / 2;
  titleText.y = screenH / 2 - 50;
  titleText.alpha = 0;
  overlay.addChild(titleText);

  // Win amount (will count up)
  const winDisplay = new Text({
    text: '0',
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 56,
      fontWeight: 'bold',
      fill: 0x44ff44,
      stroke: { color: 0x000000, width: 4 },
      dropShadow: { color: 0x000000, blur: 6, distance: 3, alpha: 0.6 },
    },
  });
  winDisplay.anchor.set(0.5);
  winDisplay.x = screenW / 2;
  winDisplay.y = screenH / 2 + 20;
  winDisplay.alpha = 0;
  overlay.addChild(winDisplay);

  // Multiplier info
  const multInfo = new Text({
    text: `(${(totalWin / bet).toFixed(1)}x 下注額)`,
    style: { fontFamily: 'Georgia, serif', fontSize: 20, fill: 0xcccccc },
  });
  multInfo.anchor.set(0.5);
  multInfo.x = screenW / 2;
  multInfo.y = screenH / 2 + 70;
  multInfo.alpha = 0;
  overlay.addChild(multInfo);

  const tl = gsap.timeline();

  // Fade in
  tl.to(bg, { alpha: 0.8, duration: 0.3 }, 0);
  tl.to(titleText, { alpha: 1, duration: 0.3 }, 0.2);
  tl.to(winDisplay, { alpha: 1, duration: 0.2 }, 0.4);

  // Count up animation
  const counter = { val: 0 };
  tl.to(counter, {
    val: totalWin,
    duration: 2.0,
    ease: 'power2.out',
    onUpdate: () => { winDisplay.text = Math.floor(counter.val).toLocaleString(); },
  }, 0.5);

  // Show multiplier info
  tl.to(multInfo, { alpha: 1, duration: 0.3 }, 2.0);

  // Gold coin rain
  for (let i = 0; i < 8; i++) {
    const coin = new Text({ text: '🪙', style: { fontSize: 24 } });
    coin.x = Math.random() * screenW;
    coin.y = -30;
    coin.alpha = 0;
    overlay.addChild(coin);
    tl.to(coin, { alpha: 0.8, duration: 0.1 }, 0.5 + i * 0.15);
    tl.to(coin, {
      y: screenH + 30,
      rotation: Math.PI * 2,
      duration: 1.5 + Math.random(),
      ease: 'power1.in',
    }, 0.5 + i * 0.15);
  }

  // Hold then fade out
  tl.to(overlay, { alpha: 0, duration: 0.5, delay: 0.5, onComplete: () => overlay.destroy() });

  await tl.play();
}
