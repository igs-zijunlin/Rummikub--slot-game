import { Application, Graphics, Text } from 'pixi.js';
import { SlotMachine } from './slotMachine';
import { HUD } from './hud';
import { loadTileAssets } from './tile';
import { setForceFreeTrigger } from './mock';
import { FreeGameController } from './freeGameController';
import { audio } from './audioManager';

declare const __COMMIT_HASH__: string;
declare const __BUILD_TIME__: string;

async function main() {
  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    resizeTo: window,
    antialias: true,
  });

  document.getElementById('app')!.appendChild(app.canvas);

  // Load assets
  await loadTileAssets();

  // Preload audio
  audio.preload();

  // Decorative gold frame
  const frame = new Graphics();
  app.stage.addChild(frame);

  // Title
  const title = new Text({
    text: '🀄 Rummikub Slot',
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 28,
      fontWeight: 'bold',
      fill: 0xffd700,
      dropShadow: { color: 0x000000, blur: 4, distance: 2, alpha: 0.5 },
    },
  });
  title.anchor.set(0.5, 0);
  app.stage.addChild(title);

  // Slot machine
  const machine = new SlotMachine();
  app.stage.addChild(machine.container);

  // Free Game controller
  const fgController = new FreeGameController(
    app.stage, machine.container, app.screen.width, app.screen.height
  );

  // HUD
  const hud = new HUD(async () => {
    if (machine.isSpinning) return;
    if (hud.balance < hud.bet) return;

    hud.balance -= hud.bet;
    hud.win = 0;
    hud.updateDisplay();
    hud.setEnabled(false);
    audio.play('btn-click');

    const result = await machine.spin(hud.bet);

    if (result.winAmount > 0) {
      const ratio = result.winAmount / hud.bet;
      if (ratio >= 20) audio.play('win-big');
      else if (ratio >= 5) audio.play('win-medium');
      else audio.play('win-small');
    }

    hud.win = result.winAmount;
    hud.balance += result.winAmount;
    hud.updateDisplay();

    // Check Free Game trigger
    if (result.scatterCount >= 3) {
      title.visible = false;
      const fgWin = await fgController.run(hud.bet, result.scatterCount);
      title.visible = true;
      hud.win += fgWin;
      hud.balance += fgWin;
      hud.updateDisplay();
      machine.refresh();
      audio.playBgm('base-game');
    }

    hud.setEnabled(true);
  }, (turbo) => {
    machine.turboMode = turbo;
    audio.setTurbo(turbo);
    audio.play('turbo-toggle');
  });
  app.stage.addChild(hud.container);

  // Cheat button (右上角，測試用)
  const cheatBtn = new Text({
    text: 'FG',
    style: { fontFamily: 'monospace', fontSize: 12, fill: 0x666666 },
  });
  cheatBtn.eventMode = 'static';
  cheatBtn.cursor = 'pointer';
  cheatBtn.on('pointerdown', () => {
    setForceFreeTrigger(true);
    cheatBtn.style.fill = 0xff4444;
    setTimeout(() => { cheatBtn.style.fill = 0x666666; }, 1000);
  });
  app.stage.addChild(cheatBtn);

  // Version info (左下角)
  const versionText = new Text({
    text: `v.${__COMMIT_HASH__} | ${__BUILD_TIME__}`,
    style: { fontFamily: 'monospace', fontSize: 10, fill: 0x555555 },
  });
  versionText.alpha = 0.6;
  app.stage.addChild(versionText);

  // Start BGM on first user interaction (browser autoplay policy)
  const startBgm = () => {
    audio.playBgm('base-game');
    document.removeEventListener('pointerdown', startBgm);
  };
  document.addEventListener('pointerdown', startBgm);

  // Responsive layout
  function resize() {
    const w = app.screen.width;
    const h = app.screen.height;
    const isPortrait = h > w;
    const isSmall = w < 400;

    const machineW = machine.width;
    const machineH = machine.height;

    // Scale to fit — more aggressive on small screens
    const maxW = w * (isSmall ? 0.95 : 0.85);
    const maxH = h * (isPortrait ? 0.40 : 0.50);
    const scale = Math.min(maxW / machineW, maxH / machineH, 1.5);

    machine.container.scale.set(scale);
    const scaledW = machineW * scale;
    const scaledH = machineH * scale;

    // Title — scale with screen
    const titleSize = Math.max(16, Math.min(isPortrait ? 22 : 26, w * 0.06));
    title.x = w / 2;
    title.y = isSmall ? 8 : (isPortrait ? 16 : 10);
    title.style.fontSize = titleSize;

    // Position machine centered
    const titleBottom = title.y + titleSize + 12;
    machine.container.x = (w - scaledW) / 2;
    machine.container.y = titleBottom;

    // Draw decorative gold frame
    const pad = isSmall ? 8 : 16;
    const fx = machine.container.x - pad;
    const fy = machine.container.y - pad;
    const fw = scaledW + pad * 2;
    const fh = scaledH + pad * 2;

    frame.clear();
    frame.roundRect(fx - 2, fy - 2, fw + 4, fh + 4, 12);
    frame.fill({ color: 0xffd700, alpha: 0.1 });
    frame.roundRect(fx, fy, fw, fh, 10);
    frame.fill({ color: 0x0a2e0a, alpha: 0.6 });
    frame.roundRect(fx, fy, fw, fh, 10);
    frame.stroke({ color: 0xffd700, width: 2, alpha: 0.8 });

    // Position HUD below machine
    const hudY = machine.container.y + scaledH + (isSmall ? 12 : 24);
    hud.container.x = (w - scaledW) / 2;
    hud.container.y = hudY;
    hud.layout(scaledW);

    // Free Game HUD & controller layout
    fgController.updateLayout(w, h, (w - scaledW) / 2, machine.container.y, scaledW);

    // Cheat button 右上角
    cheatBtn.x = w - 26;
    cheatBtn.y = 4;

    // Version info 左下角
    versionText.style.fontSize = isSmall ? 8 : 10;
    versionText.x = 4;
    versionText.y = h - 14;
  }

  resize();
  window.addEventListener('resize', resize);
}

main();
