import { Howl, Howler } from 'howler';

const SFX_PATH = '/audio/sfx/';
const BGM_PATH = '/audio/bgm/';

const SFX_LIST = [
  'spin-start', 'reel-spin', 'reel-stop',
  'win-small', 'win-medium', 'win-big',
  'scatter-land', 'trigger', 'break', 'fall',
  'cascade', 'golden-joker', 'perfect', 'run8',
  'summary-coin', 'retrigger', 'mult-up',
  'btn-click', 'bet-change', 'balance-up', 'turbo-toggle',
] as const;

const BGM_LIST = ['base-game', 'free-game-normal', 'free-game-intense'] as const;

type SfxId = typeof SFX_LIST[number];
type BgmId = typeof BGM_LIST[number];

// Cascade pitch rates: C4 → C#4 → D4 → D#4 → E4
const CASCADE_RATES = [1.0, 1.059, 1.122, 1.189, 1.260];

// Turbo mode: only play these critical sounds
const TURBO_ALLOWED: Set<SfxId> = new Set([
  'trigger', 'win-small', 'win-medium', 'win-big',
  'summary-coin', 'run8', 'perfect',
]);

class AudioManager {
  private sfx = new Map<string, Howl>();
  private bgm = new Map<string, Howl>();
  private currentBgm: BgmId | null = null;
  private muted = false;
  private turboMode = false;

  preload(): void {
    for (const id of SFX_LIST) {
      this.sfx.set(id, new Howl({
        src: [`${SFX_PATH}${id}.mp3`],
        preload: true,
        volume: id === 'btn-click' || id === 'fall' ? 0.4 : 0.6,
      }));
    }
    for (const id of BGM_LIST) {
      this.bgm.set(id, new Howl({
        src: [`${BGM_PATH}${id}.mp3`],
        preload: true,
        loop: true,
        volume: 0,
      }));
    }
  }

  play(id: SfxId, opts?: { rate?: number; volume?: number }): void {
    if (this.muted) return;
    if (this.turboMode && !TURBO_ALLOWED.has(id)) return;
    const sound = this.sfx.get(id);
    if (!sound) return;
    const playId = sound.play();
    if (opts?.rate) sound.rate(opts.rate, playId);
    if (opts?.volume !== undefined) sound.volume(opts.volume, playId);
  }

  playCascade(level: number): void {
    const rate = CASCADE_RATES[Math.min(level - 1, 4)];
    this.play('cascade', { rate, volume: 0.7 + Math.min(level, 5) * 0.06 });
  }

  playBgm(id: BgmId, fadeDuration = 1.0): void {
    if (this.muted) return;
    if (this.currentBgm === id) return;
    // Fade out current
    if (this.currentBgm) {
      const old = this.bgm.get(this.currentBgm);
      if (old) old.fade(old.volume(), 0, fadeDuration * 1000);
    }
    // Fade in new
    const next = this.bgm.get(id);
    if (next) {
      if (!next.playing()) next.play();
      next.fade(next.volume(), 0.3, fadeDuration * 1000);
    }
    this.currentBgm = id;
  }

  stopBgm(fadeDuration = 1.0): void {
    if (this.currentBgm) {
      const cur = this.bgm.get(this.currentBgm);
      if (cur) {
        cur.fade(cur.volume(), 0, fadeDuration * 1000);
        setTimeout(() => cur.stop(), fadeDuration * 1000);
      }
      this.currentBgm = null;
    }
  }

  setTurbo(enabled: boolean): void {
    this.turboMode = enabled;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }
}

export const audio = new AudioManager();
