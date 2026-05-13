import { Howl, Howler } from 'howler';

const BASE = import.meta.env.BASE_URL;
const SFX_PATH = `${BASE}audio/sfx/`;
const BGM_PATH = `${BASE}audio/bgm/`;

const SFX_LIST = [
  'spin-start', 'reel-stop',
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
  private unlocked = false;

  preload(): void {
    for (const id of SFX_LIST) {
      this.sfx.set(id, new Howl({
        src: [`${SFX_PATH}${id}.mp3`],
        preload: true,
        volume: id === 'btn-click' || id === 'fall' ? 0.4 : 0.6,
        onloaderror: (_i, e) => console.warn(`[audio] SFX load error: ${id}`, e),
        onplayerror: (_i, e) => console.warn(`[audio] SFX play error: ${id}`, e),
      }));
    }
    for (const id of BGM_LIST) {
      this.bgm.set(id, new Howl({
        src: [`${BGM_PATH}${id}.mp3`],
        preload: true,
        html5: true,
        loop: true,
        volume: 0,
        onloaderror: (_i, e) => console.warn(`[audio] BGM load error: ${id}`, e),
        onplayerror: (_i, e) => console.warn(`[audio] BGM play error: ${id}`, e),
      }));
    }
    this.setupIOSUnlock();
  }

  /**
   * iOS Safari requires AudioContext to be resumed inside a user gesture.
   * This listens for the first touch/click and unlocks the audio context.
   */
  private setupIOSUnlock(): void {
    const unlock = () => {
      if (this.unlocked) return;
      // Resume Howler's AudioContext (Web Audio API)
      const ctx = Howler.ctx;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play a silent buffer to fully unlock iOS audio
      const silentSound = new Howl({
        src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwMHAAAAAAD/+1DEAAAB8ANoAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQbAAAA0gAAAAAA0gAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='],
        volume: 0,
        onend: () => silentSound.unload(),
      });
      silentSound.play();
      this.unlocked = true;
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('touchend', unlock, true);
      document.removeEventListener('click', unlock, true);
    };
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('touchend', unlock, true);
    document.addEventListener('click', unlock, true);
  }

  play(id: SfxId, opts?: { rate?: number; volume?: number; loop?: boolean }): void {
    if (this.muted) return;
    if (this.turboMode && !TURBO_ALLOWED.has(id)) return;
    const sound = this.sfx.get(id);
    if (!sound) return;
    if (opts?.loop) sound.loop(true);
    const playId = sound.play();
    if (opts?.rate) sound.rate(opts.rate, playId);
    if (opts?.volume !== undefined) sound.volume(opts.volume, playId);
  }

  stop(id: SfxId): void {
    const sound = this.sfx.get(id);
    if (!sound) return;
    sound.loop(false);
    sound.stop();
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
