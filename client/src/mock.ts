import type { SlotTile, SpinResult, TileColor, Combo } from './types';

const COLORS: TileColor[] = ['red', 'blue', 'yellow', 'black'];

/** 作弊 flag：下一次 spin 強制觸發 Free Game */
export let forceFreeTrigger = false;
export function setForceFreeTrigger(val: boolean) { forceFreeTrigger = val; }

function randomTile(): SlotTile {
  if (Math.random() < 0.05) return { color: 'joker', number: 0 };
  return { color: COLORS[Math.floor(Math.random() * 4)], number: Math.floor(Math.random() * 13) + 1 };
}

export function generateGrid(): SlotTile[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, randomTile));
}

export function mockSpin(bet: number): SpinResult {
  const grid = generateGrid();

  // 作弊模式：強制在 3 個位置放入 scatter（用 joker 代替顯示）
  if (forceFreeTrigger) {
    forceFreeTrigger = false;
    const scatterPositions: [number, number][] = [[0, 0], [2, 1], [4, 2]];
    for (const [reel, row] of scatterPositions) {
      grid[reel][row] = { color: 'joker', number: 0 };
    }
  }
  const combos: Combo[] = [];

  for (let row = 0; row < 3; row++) {
    const tiles = grid.map(reel => reel[row]);

    // Check for GROUP: 3+ consecutive reels with same number, different colors, max 1 joker
    let foundCombo = false;
    for (let start = 0; start <= 2 && !foundCombo; start++) {
      const group: [number, number][] = [];
      const usedColors = new Set<string>();
      let targetNum = -1;
      let jokerUsed = false;

      for (let i = start; i < 5; i++) {
        const t = tiles[i];
        if (t.color === 'joker') {
          if (jokerUsed) break; // max 1 joker
          jokerUsed = true;
          group.push([i, row]);
        } else if (targetNum === -1) {
          // First real tile sets the target number
          targetNum = t.number;
          usedColors.add(t.color);
          group.push([i, row]);
        } else if (t.number === targetNum && !usedColors.has(t.color)) {
          usedColors.add(t.color);
          group.push([i, row]);
        } else {
          break;
        }
      }
      if (group.length >= 3 && targetNum !== -1) {
        combos.push({ type: 'group', positions: group });
        foundCombo = true;
      }
    }

    // Check for RUN: 3+ consecutive reels with consecutive numbers, same color, max 1 joker
    if (!foundCombo) {
      for (let start = 0; start <= 2; start++) {
        const startTile = tiles[start];
        if (startTile.color === 'joker') continue;
        const runColor = startTile.color;
        let expectedNum = startTile.number;
        const run: [number, number][] = [[start, row]];
        let jokerUsed = false;

        for (let i = start + 1; i < 5; i++) {
          expectedNum++;
          const t = tiles[i];
          if (t.color === runColor && t.number === expectedNum) {
            run.push([i, row]);
          } else if (t.color === 'joker' && !jokerUsed) {
            jokerUsed = true;
            run.push([i, row]);
          } else {
            break;
          }
        }
        if (run.length >= 3) {
          combos.push({ type: 'run', positions: run });
          break;
        }
      }
    }
  }

  const winPositions = combos.flatMap(c => c.positions);
  const winAmount = combos.length > 0 ? bet * (winPositions.length * 2) : 0;
  return { grid, combos, winPositions, winAmount };
}
