import type { SlotTile, SpinResult, TileColor } from './types';

const COLORS: TileColor[] = ['red', 'blue', 'yellow', 'black'];

function randomTile(): SlotTile {
  if (Math.random() < 0.05) return { color: 'joker', number: 0 };
  return { color: COLORS[Math.floor(Math.random() * 4)], number: Math.floor(Math.random() * 13) + 1 };
}

export function generateGrid(): SlotTile[][] {
  return Array.from({ length: 5 }, () => Array.from({ length: 3 }, randomTile));
}

export function mockSpin(bet: number): SpinResult {
  const grid = generateGrid();
  // Simple win: check if any row has 3+ same color
  const winPositions: [number, number][] = [];
  for (let row = 0; row < 3; row++) {
    const colors = grid.map(reel => reel[row].color);
    const first = colors[0];
    let count = 1;
    for (let i = 1; i < 5; i++) {
      if (colors[i] === first || colors[i] === 'joker') count++;
      else break;
    }
    if (count >= 3) {
      for (let i = 0; i < count; i++) winPositions.push([i, row]);
    }
  }
  const winAmount = winPositions.length > 0 ? bet * (winPositions.length * 2) : 0;
  return { grid, winPositions, winAmount };
}
