import { Container, Graphics, Text } from 'pixi.js';

export class HUD {
  container = new Container();
  private balanceText!: Text;
  private betText!: Text;
  private winText!: Text;
  private spinBtn!: Container;
  private onSpin: () => void;

  balance = 10000;
  bet = 100;
  win = 0;

  constructor(onSpin: () => void) {
    this.onSpin = onSpin;
    this.buildUI();
  }

  private buildUI() {
    const style = { fontFamily: 'Arial, sans-serif', fontSize: 18, fill: 0xffffff };

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

    // Spin button
    this.spinBtn = new Container();
    this.spinBtn.y = 100;
    const btnBg = new Graphics();
    btnBg.roundRect(0, 0, 160, 50, 25);
    btnBg.fill(0xe91e63);
    this.spinBtn.addChild(btnBg);

    const btnText = new Text({
      text: '🎰 旋轉',
      style: { fontFamily: 'Arial, sans-serif', fontSize: 22, fontWeight: 'bold', fill: 0xffffff },
    });
    btnText.anchor.set(0.5);
    btnText.x = 80;
    btnText.y = 25;
    this.spinBtn.addChild(btnText);

    this.spinBtn.eventMode = 'static';
    this.spinBtn.cursor = 'pointer';
    this.spinBtn.on('pointerdown', () => this.onSpin());
    this.container.addChild(this.spinBtn);

    this.updateDisplay();
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
    this.balanceText.x = 10;
    this.betText.x = 10;
    this.winText.x = 10;
  }
}
