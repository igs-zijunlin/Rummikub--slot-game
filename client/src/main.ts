import { Application, Graphics, Text } from 'pixi.js';
import { SlotMachine } from './slotMachine';
import { HUD } from './hud';
import { loadTileAssets } from './tile';
import { setForceFreeTrigger } from './mock';
import { FreeGameController } from './freeGameController';

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

    const result = await machine.spin(hud.bet);

    hud.win = result.winAmount;
    hud.balance += result.winAmount;
    hud.updateDisplay();

    // Check Free Game trigger
    if (result.scatterCount >= 3) {
      const fgWin = await fgController.run(hud.bet, result.scatterCount);
      hud.win += fgWin;
      hud.balance += fgWin;
      hud.updateDisplay();
    }

    hud.setEnabled(true);
  }, (turbo) => {
    machine.turboMode = turbo;
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

  // Responsive layout
  function resize() {
    const w = app.screen.width;
    const h = app.screen.height;
    const isPortrait = h > w;

    const machineW = machine.width;
    const machineH = machine.height;

    // Scale to fit
    const maxW = w * 0.85;
    const maxH = h * (isPortrait ? 0.45 : 0.55);
    const scale = Math.min(maxW / machineW, maxH / machineH, 1.5);

    machine.container.scale.set(scale);
    const scaledW = machineW * scale;
    const scaledH = machineH * scale;

    // Position title
    title.x = w / 2;
    title.y = isPortrait ? 20 : 10;
    title.style.fontSize = isPortrait ? 24 : 28;

    // Position machine centered
    const titleBottom = title.y + 50;
    machine.container.x = (w - scaledW) / 2;
    machine.container.y = titleBottom + (isPortrait ? 10 : 5);

    // Draw decorative gold frame around machine area
    const pad = 16;
    const fx = machine.container.x - pad;
    const fy = machine.container.y - pad;
    const fw = scaledW + pad * 2;
    const fh = scaledH + pad * 2;

    frame.clear();
    frame.roundRect(fx - 4, fy - 4, fw + 8, fh + 8, 14);
    frame.fill({ color: 0xffd700, alpha: 0.1 });
    frame.roundRect(fx, fy, fw, fh, 10);
    frame.fill({ color: 0x0a2e0a, alpha: 0.6 });
    frame.roundRect(fx, fy, fw, fh, 10);
    frame.stroke({ color: 0xffd700, width: 3, alpha: 0.8 });
    frame.roundRect(fx + 6, fy + 6, fw - 12, fh - 12, 6);
    frame.stroke({ color: 0xffd700, width: 1, alpha: 0.3 });

    // Position HUD below machine
    const hudY = machine.container.y + scaledH + 30;
    hud.container.x = (w - scaledW) / 2;
    hud.container.y = hudY;
    hud.layout(scaledW);

    // Free Game HUD & controller layout
    fgController.updateLayout(w, h, (w - scaledW) / 2, machine.container.y, scaledW);

    // Cheat button 右上角
    cheatBtn.x = w - 30;
    cheatBtn.y = 5;
  }

  resize();
  window.addEventListener('resize', resize);
}

main();
