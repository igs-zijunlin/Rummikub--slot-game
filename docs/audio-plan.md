# Rummikub Slot — 音效設計規劃文件

> **版本**：v1.0  
> **日期**：2026-05-12  
> **作者**：🎵 音效設計師  
> **狀態**：Draft — 待用戶審核

---

## 1. 概述

本文件規劃 Rummikub Slot Game 的完整音效系統，涵蓋 Base Game、Free Game、UI 互動及背景音樂。

### 1.1 技術方案

| 項目 | 選擇 |
|------|------|
| 音效引擎 | Howler.js（需新增依賴） |
| 音檔格式 | MP3（主要）+ OGG（備用） |
| 音檔位置 | `client/public/audio/sfx/` + `client/public/audio/bgm/` |
| 音效管理 | 新增 `client/src/audioManager.ts` 統一管理 |
| 授權要求 | 僅使用免費、無需署名的素材（Mixkit License / Pixabay License） |

### 1.2 設計原則

- **層次感**：連鎖音效逐步升調，營造興奮感
- **不干擾**：UI 音效輕柔短促，不搶主體
- **回饋即時**：每個玩家操作都有音效回饋
- **可控制**：提供音量調節與靜音開關

---

## 2. 完整音效清單

### 2.1 Base Game 音效

| # | 音效 ID | 觸發時機 | 風格描述 | 時長 | 優先級 |
|---|---------|----------|----------|------|--------|
| 1 | `sfx_spin_start` | 按下 Spin 按鈕 | 機械啟動聲，帶有輕微金屬質感的「咔嗒」+ 轉輪加速聲 | 0.5s | 高 |
| 2 | `sfx_reel_spin` | 轉輪轉動中 | 持續的轉輪滾動聲，循環播放，帶有輕微的「嗒嗒嗒」節奏 | Loop | 高 |
| 3 | `sfx_reel_stop` | 每個轉輪停止 | 清脆的「咚」聲，5 個轉輪依序停止時音調略有變化 | 0.2s | 高 |
| 4 | `sfx_win_small` | 小獎（< 5x bet） | 輕快的硬幣碰撞聲 + 短促上揚音效 | 1.0s | 高 |
| 5 | `sfx_win_medium` | 中獎（5-20x bet） | 明亮的鈴聲 + 硬幣傾瀉聲 | 2.0s | 高 |
| 6 | `sfx_win_big` | 大獎（> 20x bet） | 華麗的管弦樂短句 + 金幣雨聲 + 歡呼 | 3.0s | 中 |
| 7 | `sfx_scatter_land` | Scatter 符號落定 | 神秘的魔法音效，帶有金屬光芒感 | 0.8s | 高 |

### 2.2 Free Game 音效（規格文件 §8.3 對應）

| # | 音效 ID | 觸發時機 | 風格描述 | 時長 | 優先級 |
|---|---------|----------|----------|------|--------|
| 8 | `sfx_trigger` | Free Game 觸發（anim_trigger） | 華麗開場：管弦樂漸強 + 金光音效 + 「叮～」高音收尾。氣勢磅礴，讓玩家感受到大事件 | 2.0s | 高 |
| 9 | `sfx_break` | 牌面消去（anim_tile_break） | 清脆碎裂聲：陶瓷/玻璃碎裂 + 輕微回響。短促有力，不拖泥帶水 | 0.4s | 高 |
| 10 | `sfx_fall` | 牌面落下（anim_tile_fall） | 輕柔落地聲：木質「咚」+ 輕微彈跳。溫和不刺耳 | 0.3s | 高 |
| 11 | `sfx_cascade_1` | 第 1 次連鎖 | 基礎音調 C4：清脆的木琴/鐵琴單音 + 輕微迴響 | 0.5s | 高 |
| 12 | `sfx_cascade_2` | 第 2 次連鎖 | 升半音 C#4：同音色但音調上升，加入輕微和弦 | 0.5s | 高 |
| 13 | `sfx_cascade_3` | 第 3 次連鎖 | 升半音 D4：音色更明亮，加入短促琶音 | 0.5s | 高 |
| 14 | `sfx_cascade_4` | 第 4 次連鎖 | 升半音 D#4：加入弦樂墊底，氣勢漸強 | 0.6s | 高 |
| 15 | `sfx_cascade_5` | 第 5+ 次連鎖 | 高潮音效 E4：完整和弦 + 閃光音效 + BGM 切換觸發 | 0.8s | 高 |
| 16 | `sfx_golden_joker` | 黃金 Joker 出現/留存（anim_golden_joker_stay） | 金屬光芒音：明亮的金屬共鳴 + 魔法粒子聲 + 持續的微光音效 | 0.6s | 高 |
| 17 | `sfx_perfect` | 完美拉密/完美刻子觸發 | 成就達成：短促的銅管 fanfare + 閃光 + 「Perfect!」感的上揚音階 | 1.0-1.2s | 中 |
| 18 | `sfx_run8` | 8 連順達成（anim_run8_complete） | 煙火 + 歡呼：煙火爆裂聲 + 群眾歡呼 + 勝利號角 | 2.0s | 中 |
| 19 | `sfx_summary` | 結算畫面（anim_summary） | 金幣計數音：快速的「叮叮叮」硬幣計數聲，隨數字跳動加速 | 3.0s (loop) | 高 |
| 20 | `sfx_retrigger` | Re-trigger 觸發（anim_retrigger） | 驚喜音效：上揚的琶音 + 閃光 + 短促歡呼 | 1.5s | 中 |
| 21 | `sfx_mult_up` | 倍率提升（anim_mult_up） | 力量提升：低→高的 power-up 音效 + 震動感 | 0.5s | 高 |

### 2.3 UI 音效

| # | 音效 ID | 觸發時機 | 風格描述 | 時長 | 優先級 |
|---|---------|----------|----------|------|--------|
| 22 | `sfx_btn_click` | 任何按鈕點擊 | 輕柔的「咔」聲，帶有微弱的電子質感 | 0.1s | 高 |
| 23 | `sfx_btn_hover` | 按鈕 hover（可選） | 極輕的「嘀」聲 | 0.05s | 低 |
| 24 | `sfx_bet_change` | 調整下注金額 | 短促的「嗶」聲，上調升音/下調降音 | 0.15s | 中 |
| 25 | `sfx_balance_up` | 餘額增加 | 輕快的硬幣聲 + 微弱的「叮」 | 0.3s | 中 |
| 26 | `sfx_balance_down` | 餘額減少（扣注） | 輕柔的「咻」聲，不帶負面感 | 0.2s | 低 |
| 27 | `sfx_turbo_toggle` | Turbo 模式切換 | 短促的切換聲，帶有速度感 | 0.2s | 低 |

### 2.4 背景音樂（BGM）

| # | 音效 ID | 播放場景 | 風格描述 | 時長 | 優先級 |
|---|---------|----------|----------|------|--------|
| 28 | `bgm_base` | Base Game 主畫面 | 輕鬆愉快的電子爵士風，中等節奏（~110 BPM），帶有輕微的賭場氛圍。使用合成器 + 輕鼓點 + 偶爾的鋼琴點綴。音量適中不搶注意力 | 60-120s loop | 高 |
| 29 | `bgm_free_normal` | Free Game 一般狀態 | 緊張刺激的電子音樂，節奏加快（~130 BPM），帶有期待感。合成器主導 + 鼓點加強 + 偶爾的弦樂墊底 | 60-90s loop | 高 |
| 30 | `bgm_free_intense` | Free Game 連鎖 5+ 時 | 高潮版本：在 bgm_free_normal 基礎上加入更強的鼓點、更密集的合成器音色、上揚的旋律線。能量感爆棚 | 60-90s loop | 中 |

---

## 3. 音效時序對照表（與動畫同步）

| 動畫 ID | 動畫時長 | 對應音效 | 音效時長 | 同步說明 |
|---------|----------|----------|----------|----------|
| `anim_trigger` | 2.0s | `sfx_trigger` | 2.0s | 金光出現時起播 |
| `anim_tile_break` | 0.4s | `sfx_break` | 0.4s | 碎裂動畫開始時起播 |
| `anim_tile_fall` | 0.3s/格 | `sfx_fall` | 0.3s | 每格落下時觸發一次 |
| `anim_mult_up` | 0.5s | `sfx_mult_up` | 0.5s | 倍率數字放大時起播 |
| `anim_golden_joker_stay` | 0.6s | `sfx_golden_joker` | 0.6s | 護盾閃爍時起播 |
| `anim_perfect_rummikub` | 1.0s | `sfx_perfect` | 1.0s | 「PERFECT!」文字出現時起播 |
| `anim_perfect_group` | 1.2s | `sfx_perfect` | 1.2s | 4 張牌聚合時起播 |
| `anim_run8_complete` | 2.0s | `sfx_run8` | 2.0s | 進度條全亮時起播 |
| `anim_retrigger` | 1.5s | `sfx_retrigger` | 1.5s | 「+X SPINS!」彈出時起播 |
| `anim_summary` | 3.0s | `sfx_summary` | 3.0s loop | 數字跳動開始時起播 |

---

## 4. BGM 狀態切換邏輯

```
Base Game → [觸發 Free Game] → crossfade 1.0s → bgm_free_normal
bgm_free_normal → [連鎖 5+] → crossfade 0.5s → bgm_free_intense
bgm_free_intense → [回合結束無連鎖] → crossfade 0.5s → bgm_free_normal
bgm_free_normal → [Free Game 結束] → crossfade 1.5s → bgm_base
```

---

## 5. 免費素材來源推薦

### 5.1 素材庫授權說明

| 來源 | 授權 | 商用 | 署名要求 | 備註 |
|------|------|------|----------|------|
| **Mixkit** | Mixkit License | ✅ | ❌ 不需要 | 首選，品質高且免費 |
| **Pixabay** | Pixabay License | ✅ | ❌ 不需要 | 音樂 loop 選擇多 |
| **Freesound.org** | CC0 / CC-BY | ✅ | 視授權 | CC0 不需署名，CC-BY 需要 |

### 5.2 各音效建議素材

#### Base Game

| 音效 ID | 建議素材 | 來源 | 連結 |
|---------|----------|------|------|
| `sfx_spin_start` | "Arcade slot machine wheel" | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_reel_spin` | "Slot machine wheel" | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_reel_stop` | "Video game retro click" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_win_small` | "Winning a coin, video game" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_win_medium` | "Melodic bonus collect" | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_win_big` | "Slot machine win" | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_scatter_land` | "Unlock game notification" | Mixkit | https://mixkit.co/free-sound-effects/game/ |

#### Free Game

| 音效 ID | 建議素材 | 來源 | 連結 |
|---------|----------|------|------|
| `sfx_trigger` | "Medieval show fanfare announcement" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_break` | "Glass shatter 7" | Pixabay | https://pixabay.com/sound-effects/glass-shatter-7-95202/ |
| `sfx_fall` | "Game ball tap" (pitch down) | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_cascade_1~5` | "Arcade rising" (分段剪輯不同音高) | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_golden_joker` | "Casino bling achievement" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_perfect` | "Game level completed" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_run8` | "Crowd cheering" + "Fireworks" | Pixabay | https://pixabay.com/sound-effects/search/cheering/ |
| `sfx_summary` | "Coins handling" (loop) | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_retrigger` | "Bonus earned in video game" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_mult_up` | "Game experience level increased" | Mixkit | https://mixkit.co/free-sound-effects/game/ |

#### UI

| 音效 ID | 建議素材 | 來源 | 連結 |
|---------|----------|------|------|
| `sfx_btn_click` | "Quick positive video game notification interface" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_bet_change` | "Retro arcade casino notification" | Mixkit | https://mixkit.co/free-sound-effects/game/ |
| `sfx_balance_up` | "Magical coin win" | Mixkit | https://mixkit.co/free-sound-effects/slot-machine/ |
| `sfx_turbo_toggle` | "Extra bonus in a video game" | Mixkit | https://mixkit.co/free-sound-effects/game/ |

#### BGM

| 音效 ID | 建議素材 | 來源 | 連結 |
|---------|----------|------|------|
| `bgm_base` | "Game Music Loop 7" | Pixabay | https://pixabay.com/sound-effects/game-music-loop-7-145285/ |
| `bgm_free_normal` | Casino 風格 upbeat 音樂 | Pixabay | https://pixabay.com/music/search/casino/ |
| `bgm_free_intense` | Upbeat game music | Pixabay | https://pixabay.com/music/upbeat-game-music-202227/ |

---

## 6. 連鎖升調音效設計方案

連鎖音效是本遊戲的核心聽覺體驗，需要特別設計：

### 6.1 方案 A：單一素材 pitch shift（推薦）

取 "Arcade rising" 素材，使用 Howler.js 的 `rate()` 功能即時調整播放速率：

```typescript
// 連鎖音效 pitch 對照
const CASCADE_RATES = {
  1: 1.0,    // C4 - 原始音高
  2: 1.059,  // C#4 - 升半音
  3: 1.122,  // D4
  4: 1.189,  // D#4
  5: 1.260,  // E4
};
```

**優點**：只需 1 個音檔，節省載入時間  
**缺點**：高 pitch 可能略有失真

### 6.2 方案 B：預製 5 個獨立音檔

分別錄製/剪輯 5 個不同音高的音效檔案。

**優點**：音質最佳，可各自加入不同的裝飾音  
**缺點**：需要更多素材處理工作

### 6.3 建議

先用方案 A 快速實作，後續如有品質需求再升級為方案 B。

---

## 7. 音量層級設計

| 類別 | 預設音量 | 說明 |
|------|----------|------|
| BGM | 0.3 (30%) | 背景不搶主體 |
| SFX - 一般 | 0.6 (60%) | 按鈕、落下等 |
| SFX - 重要 | 0.8 (80%) | 中獎、連鎖、觸發 |
| SFX - 高潮 | 1.0 (100%) | 大獎、8 連順 |

---

## 8. 檔案結構規劃

```
client/public/audio/
├── sfx/
│   ├── spin-start.mp3
│   ├── reel-spin.mp3
│   ├── reel-stop.mp3
│   ├── win-small.mp3
│   ├── win-medium.mp3
│   ├── win-big.mp3
│   ├── scatter-land.mp3
│   ├── trigger.mp3
│   ├── break.mp3
│   ├── fall.mp3
│   ├── cascade.mp3          # 方案 A：單一檔案 pitch shift
│   ├── golden-joker.mp3
│   ├── perfect.mp3
│   ├── run8.mp3
│   ├── summary-coin.mp3
│   ├── retrigger.mp3
│   ├── mult-up.mp3
│   ├── btn-click.mp3
│   ├── bet-change.mp3
│   ├── balance-up.mp3
│   └── turbo-toggle.mp3
└── bgm/
    ├── base-game.mp3
    ├── free-game-normal.mp3
    └── free-game-intense.mp3
```

---

## 9. AudioManager 架構設計

```typescript
// client/src/audioManager.ts
import { Howl, Howler } from 'howler';

export class AudioManager {
  private sfx: Map<string, Howl> = new Map();
  private bgm: Map<string, Howl> = new Map();
  private currentBgm: string | null = null;
  private masterVolume = 1.0;
  private sfxVolume = 0.7;
  private bgmVolume = 0.3;
  private muted = false;

  async preload(): Promise<void> { /* 預載所有音效 */ }
  
  playSfx(id: string, options?: { rate?: number; volume?: number }): void { }
  
  playBgm(id: string, crossfadeDuration?: number): void { }
  
  stopBgm(fadeDuration?: number): void { }
  
  playCascade(level: number): void {
    // 根據連鎖等級調整 pitch
    const rate = [1.0, 1.059, 1.122, 1.189, 1.260][Math.min(level - 1, 4)];
    this.playSfx('cascade', { rate });
  }
  
  setMasterVolume(v: number): void { }
  setSfxVolume(v: number): void { }
  setBgmVolume(v: number): void { }
  toggleMute(): boolean { }
}

export const audio = new AudioManager();
```

---

## 10. 實作優先級

### Phase 1（MVP）— 核心體驗
1. `sfx_spin_start` / `sfx_reel_stop` — Spin 基本回饋
2. `sfx_break` / `sfx_fall` — 消去核心體驗
3. `sfx_cascade_1~5` — 連鎖升調（遊戲靈魂）
4. `sfx_trigger` — Free Game 觸發
5. `sfx_btn_click` — UI 基本回饋
6. `bgm_base` — 基礎背景音樂

### Phase 2 — 完整體驗
7. `sfx_win_small/medium/big` — 中獎分級
8. `sfx_golden_joker` — 黃金 Joker
9. `sfx_mult_up` — 倍率提升
10. `sfx_summary` — 結算計數
11. `bgm_free_normal` — Free Game BGM

### Phase 3 — 錦上添花
12. `sfx_perfect` / `sfx_run8` — 特殊成就
13. `sfx_retrigger` — Re-trigger
14. `bgm_free_intense` — 高潮 BGM
15. 其餘 UI 音效

---

## 11. 待確認事項

- [ ] 連鎖音效採用方案 A（pitch shift）還是方案 B（獨立檔案）？
- [ ] 是否需要音量設定 UI（滑桿/靜音按鈕）？
- [ ] BGM 是否需要在首次互動後才播放（瀏覽器 autoplay 限制）？
- [ ] 是否需要 Turbo 模式下縮短/跳過部分音效？
- [ ] 音效素材是否需要進一步後製（EQ、壓縮、正規化）？

---

*文件結束 — 待用戶審核確認後開始下載素材並整合*
