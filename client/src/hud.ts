import { Container, Graphics, Text } from 'pixi.js';

export class HUD {
  container = new Container();
  private balanceText!: Text;
  private betText!: Text;
  private winText!: Text;
  private spinBtn!: Container;
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
    const style = { fontFamily: 'Georgia, serif', fontSize: 18, fill: 0xf5f5dc };

    // Balance
    this.balanceText = new Text({ text: '', style });
    this.balanceText.y = 0;
    this.container.addChild(this.balanceText);

    // Bet
    this.betText = new Text({ text: '', style });
    this.betText.y = 30;
    this.container.addChild(this.betText);

    // Win
    this.winText = new Text({ text: '', style: { ...style, fontSize: 22, fill: 0xffd700 } });
    this.winText.y = 60;
    this.container.addChild(this.winText);

    // Spin button - casino gold style
    this.spinBtn = new Container();
    this.spinBtn.y = 100;
    const btnBg = new Graphics();
    // Shadow
    btnBg.roundRect(3, 3, 160, 50, 25);
    btnBg.fill({ color: 0x000000, alpha: 0.3 });
    // Button body
    btnBg.roundRect(0, 0, 160, 50, 25);
    btnBg.fill(0xb71c1c);
    // Gold border
    btnBg.roundRect(0, 0, 160, 50, 25);
    btnBg.stroke({ color: 0xffd700, width: 2 });
    // Top highlight
    btnBg.roundRect(4, 4, 152, 20, 20);
    btnBg.fill({ color: 0xffffff, alpha: 0.12 });
    this.spinBtn.addChild(btnBg);

    const btnText = new Text({
      text: '🎰 旋轉',
      style: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 'bold', fill: 0xffd700 },
    });
    btnText.anchor.set(0.5);
    btnText.x = 80;
    btnText.y = 25;
    this.spinBtn.addChild(btnText);

    this.spinBtn.eventMode = 'static';
    this.spinBtn.cursor = 'pointer';
    this.spinBtn.on('pointerdown', () => this.onSpin());
    this.container.addChild(this.spinBtn);

    // Turbo toggle button - casino style
    this.turboBtn = new Container();
    this.turboBtn.y = 160;
    this.turboBtnBg = new Graphics();
    this.turboBtnBg.roundRect(0, 0, 100, 40, 20);
    this.turboBtnBg.fill(0x2e2e2e);
    this.turboBtnBg.roundRect(0, 0, 100, 40, 20);
    this.turboBtnBg.stroke({ color: 0xffd700, width: 1.5, alpha: 0.6 });
    this.turboBtn.addChild(this.turboBtnBg);

    this.turboBtnText = new Text({
      text: '⚡ 加速',
      style: { fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 'bold', fill: 0xcccccc },
    });
    this.turboBtnText.anchor.set(0.5);
    this.turboBtnText.x = 50;
    this.turboBtnText.y = 20;
    this.turboBtn.addChild(this.turboBtnText);

    this.turboBtn.eventMode = 'static';
    this.turboBtn.cursor = 'pointer';
    this.turboBtn.on('pointerdown', () => this.toggleTurbo());
    this.container.addChild(this.turboBtn);

    this.updateDisplay();
  }

  private toggleTurbo() {
    this.turbo = !this.turbo;
    this.turboBtnBg.clear();
    this.turboBtnBg.roundRect(0, 0, 100, 40, 20);
    this.turboBtnBg.fill(this.turbo ? 0xff6600 : 0x2e2e2e);
    this.turboBtnBg.roundRect(0, 0, 100, 40, 20);
    this.turboBtnBg.stroke({ color: 0xffd700, width: 1.5, alpha: this.turbo ? 1 : 0.6 });
    this.turboBtnText.text = this.turbo ? '⚡ 加速 ON' : '⚡ 加速';
    this.turboBtnText.style.fill = this.turbo ? 0xffd700 : 0xcccccc;
    this.onTurboToggle(this.turbo);
  }

  updateDisplay() {
    this.balanceText.text = `💰 餘額：${this.balance}`;
    this.betText.text = `🎯 下注：${this.bet}`;
    this.winText.text = this.win > 0 ? `🏆 贏分：+${this.win}` : '';
  }

  setEnabled(enabled: boolean) {
    this.spinBtn.alpha = enabled ? 1 : 0.5;
    this.spinBtn.eventMode = enabled ? 'static' : 'none';
  }

  layout(width: number) {
    // Center the spin button
    this.spinBtn.x = (width - 160) / 2;
    // Turbo button to the right of spin button
    this.turboBtn.x = (width - 100) / 2;
    this.balanceText.x = 10;
    this.betText.x = 10;
    this.winText.x = 10;
  }
}
