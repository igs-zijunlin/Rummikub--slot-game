import { Application, Text } from 'pixi.js';
import { SlotMachine } from './slotMachine';
import { HUD } from './hud';

async function main() {
  const app = new Application();
  await app.init({
    background: 0x1a1a2e,
    resizeTo: window,
    antialias: true,
  });

  document.getElementById('app')!.appendChild(app.canvas);

  // Title
  const title = new Text({
    text: '🀄 Rummikub Slot',
    style: { fontFamily: 'Arial, sans-serif', fontSize: 28, fontWeight: 'bold', fill: 0xffd700 },
  });
  title.anchor.set(0.5, 0);
  app.stage.addChild(title);

  // Slot machine
  const machine = new SlotMachine();
  app.stage.addChild(machine.container);

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
    hud.setEnabled(true);
  });
  app.stage.addChild(hud.container);

  // Responsive layout
  function resize() {
    const w = app.screen.width;
    const h = app.screen.height;
    const isPortrait = h > w;

    const machineW = machine.width;
    const machineH = machine.height;

    // Scale to fit
    const maxW = w * 0.9;
    const maxH = h * (isPortrait ? 0.5 : 0.6);
    const scale = Math.min(maxW / machineW, maxH / machineH, 1.5);

    machine.container.scale.set(scale);
    const scaledW = machineW * scale;
    const scaledH = machineH * scale;

    // Position title
    title.x = w / 2;
    title.y = isPortrait ? 20 : 10;
    title.style.fontSize = isPortrait ? 24 : 28;

    // Position machine centered
    const titleBottom = title.y + 40;
    machine.container.x = (w - scaledW) / 2;
    machine.container.y = titleBottom + (isPortrait ? 10 : 5);

    // Position HUD below machine
    const hudY = machine.container.y + scaledH + 20;
    hud.container.x = (w - scaledW) / 2;
    hud.container.y = hudY;
    hud.layout(scaledW);
  }

  resize();
  window.addEventListener('resize', resize);
}

main();
