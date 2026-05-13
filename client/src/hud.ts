import { Container, Graphics, Text } from 'pixi.js';

export class HUD {
  container = new Container();
  private balanceText!: Text;
  private betText!: Text;
  private winText!: Text;
  private spinBtn!: Container;
  private spinBtnBg!: Graphics;
  private spinBtnText!: Text;
  private turboBtn!: Container;
  private turboBtnBg!: Graphics;
  private turboBtnText!: Text;
  private onSpin: () => void;
  private onTurboToggle: (enabled: boolean) => void;

  balance = 10000;
  bet = 100;
  win = 0;
  turbo = false;

  constructor(onSpin: () => void, onTurboToggle: (enabled: boolean) => void) {
    this.onSpin = onSpin;
    this.onTurboToggle = onTurboToggle;
    this.buildUI();
  }

  private buildUI() {
    const style = { fontFamily: 'Georgia, serif', fontSize: 16, fill: 0xf5f5dc };

    this.balanceText = new Text({ text: '', style });
    this.container.addChild(this.balanceText);

    this.betText = new Text({ text: '', style });
    this.container.addChild(this.betText);

    this.winText = new Text({ text: '', style: { ...style, fill: 0xffd700 } });
    this.container.addChild(this.winText);

    // Spin button
    this.spinBtn = new Container();
    this.spinBtnBg = new Graphics();
    this.spinBtn.addChild(this.spinBtnBg);

    this.spinBtnText = new Text({
      text: '🎰 旋轉',
      style: { fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 'bold', fill: 0xffd700 },
    });
    this.spinBtnText.anchor.set(0.5);
    this.spinBtn.addChild(this.spinBtnText);

    this.spinBtn.eventMode = 'static';
    this.spinBtn.cursor = 'pointer';
    this.spinBtn.on('pointerdown', () => this.onSpin());
    this.container.addChild(this.spinBtn);

    // Turbo button
    this.turboBtn = new Container();
    this.turboBtnBg = new Graphics();
    this.turboBtn.addChild(this.turboBtnBg);

    this.turboBtnText = new Text({
      text: '⚡ 加速',
      style: { fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 'bold', fill: 0xcccccc },
    });
    this.turboBtnText.anchor.set(0.5);
    this.turboBtn.addChild(this.turboBtnText);

    this.turboBtn.eventMode = 'static';
    this.turboBtn.cursor = 'pointer';
    this.turboBtn.on('pointerdown', () => this.toggleTurbo());
    this.container.addChild(this.turboBtn);

    this.updateDisplay();
  }

  private toggleTurbo() {
    this.turbo = !this.turbo;
    this.turboBtnText.text = this.turbo ? '⚡ ON' : '⚡ 加速';
    this.turboBtnText.style.fill = this.turbo ? 0xffd700 : 0xcccccc;
    this.onTurboToggle(this.turbo);
  }

  updateDisplay() {
    this.balanceText.text = `💰 ${this.balance}`;
    this.betText.text = `🎯 ${this.bet}`;
    this.winText.text = this.win > 0 ? `🏆 +${this.win}` : '';
  }

  setEnabled(enabled: boolean) {
    this.spinBtn.alpha = enabled ? 1 : 0.5;
    this.spinBtn.eventMode = enabled ? 'static' : 'none';
  }

  layout(width: number) {
    // Scale factor based on available width (reference: 490px)
    const s = Math.min(width / 490, 1);
    const fontSize = Math.max(12, Math.round(16 * s));
    const btnW = Math.round(140 * s);
    const btnH = Math.round(44 * s);
    const turboBtnW = Math.round(80 * s);
    const turboBtnH = Math.round(34 * s);
    const lineH = Math.round(24 * s);

    // Text sizing
    this.balanceText.style.fontSize = fontSize;
    this.betText.style.fontSize = fontSize;
    this.winText.style.fontSize = fontSize;

    // Layout: info row on top, buttons below
    this.balanceText.x = 0;
    this.balanceText.y = 0;
    this.betText.x = Math.round(width * 0.35);
    this.betText.y = 0;
    this.winText.x = Math.round(width * 0.65);
    this.winText.y = 0;

    // Spin button
    const btnY = lineH + 8;
    this.spinBtn.x = (width - btnW) / 2;
    this.spinBtn.y = btnY;
    this.spinBtnBg.clear();
    this.spinBtnBg.roundRect(2, 2, btnW, btnH, btnH / 2);
    this.spinBtnBg.fill({ color: 0x000000, alpha: 0.3 });
    this.spinBtnBg.roundRect(0, 0, btnW, btnH, btnH / 2);
    this.spinBtnBg.fill(0xb71c1c);
    this.spinBtnBg.roundRect(0, 0, btnW, btnH, btnH / 2);
    this.spinBtnBg.stroke({ color: 0xffd700, width: 2 });
    this.spinBtnText.x = btnW / 2;
    this.spinBtnText.y = btnH / 2;
    this.spinBtnText.style.fontSize = Math.max(14, Math.round(20 * s));

    // Turbo button - right of spin
    this.turboBtn.x = this.spinBtn.x + btnW + 10;
    this.turboBtn.y = btnY + (btnH - turboBtnH) / 2;
    this.turboBtnBg.clear();
    this.turboBtnBg.roundRect(0, 0, turboBtnW, turboBtnH, turboBtnH / 2);
    this.turboBtnBg.fill(this.turbo ? 0xff6600 : 0x2e2e2e);
    this.turboBtnBg.roundRect(0, 0, turboBtnW, turboBtnH, turboBtnH / 2);
    this.turboBtnBg.stroke({ color: 0xffd700, width: 1.5, alpha: 0.6 });
    this.turboBtnText.x = turboBtnW / 2;
    this.turboBtnText.y = turboBtnH / 2;
    this.turboBtnText.style.fontSize = Math.max(10, Math.round(13 * s));
  }
}
