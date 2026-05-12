import type { TileColor, Combo } from './types';

/** Free Game 常數 */
export const FG_TILE_NUMBER_MAX = 8;
export const FG_P_JOKER = 0.08;
export const FG_P_GOLDEN_JOKER = 0.05;
export const FG_P_SCATTER = 0.03;
export const FG_NEIGHBOR_BIAS = 0.30;
export const FG_BASE_WIN_FACTOR = 2;
export const FG_MAX_ROUNDS = 30;
export const MULT_TABLE = [1, 2, 3, 5, 8, 10] as const;
export const FREE_ROUNDS_BY_SCATTER: Record<number, number> = { 3: 8, 4: 12, 5: 15 };
export const RETRIGGER_BY_SCATTER: Record<number, number> = { 3: 5, 4: 8, 5: 10 };

const REELS = 5;
const ROWS = 3;
const COLORS: TileColor[] = ['red', 'blue', 'yellow', 'black'];

export type TileKind = 'normal' | 'joker' | 'golden_joker' | 'scatter';

export interface FGTile {
  color: TileColor | 'joker';
  number: number;
  kind: TileKind;
}

export interface FGState {
  roundsRemaining: number;
  roundsTotal: number;
  cascadeCount: number;
  currentMultiplier: number;
  roundWin: number;
  totalWin: number;
  goldenJokerPositions: [number, number][];
}

export interface CascadeStep {
  grid: FGTile[][];
  combos: Combo[];
  winPositions: [number, number][];
  cascadeCount: number;
  multiplier: number;
  stepWin: number;
  eliminatedPositions: [number, number][];
  dropMap: { reel: number; from: number; to: number }[];
  newTilePositions: [number, number][];
  newGrid: FGTile[][];
}

export interface FGRoundResult {
  initialGrid: FGTile[][];
  cascadeSteps: CascadeStep[];
  scatterCount: number;
  retriggerRounds: number;
  roundWin: number;
}

export interface FGResult {
  rounds: FGRoundResult[];
  totalWin: number;
  totalRounds: number;
}

// --- Tile Generation ---

function rand(): number {
  return Math.random();
}

function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomFGTile(includeScatter: boolean): FGTile {
  const r = rand();
  let threshold = 0;

  if (includeScatter) {
    threshold += FG_P_SCATTER;
    if (r < threshold) return { color: 'joker', number: 0, kind: 'scatter' };
  }

  threshold += FG_P_GOLDEN_JOKER;
  if (r < threshold) return { color: 'joker', number: 0, kind: 'golden_joker' };

  threshold += FG_P_JOKER;
  if (r < threshold) return { color: 'joker', number: 0, kind: 'joker' };

  return { color: COLORS[randInt(4)], number: randInt(FG_TILE_NUMBER_MAX) + 1, kind: 'normal' };
}

export function generateFGGrid(includeScatter: boolean): FGTile[][] {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => randomFGTile(includeScatter))
  );
}

function getNeighborNumbers(grid: FGTile[][], col: number, row: number): number[] {
  const nums: number[] = [];
  for (const [dc, dr] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nc = col + dc, nr = row + dr;
    if (nc >= 0 && nc < REELS && nr >= 0 && nr < ROWS) {
      const t = grid[nc]?.[nr];
      if (t && t.kind === 'normal' && t.number > 0) nums.push(t.number);
    }
  }
  return nums;
}

function generateFillTile(neighbors: number[]): FGTile {
  const r = rand();
  let threshold = FG_P_GOLDEN_JOKER;
  if (r < threshold) return { color: 'joker', number: 0, kind: 'golden_joker' };
  threshold += FG_P_JOKER;
  if (r < threshold) return { color: 'joker', number: 0, kind: 'joker' };

  const color = COLORS[randInt(4)];
  let number: number;
  if (neighbors.length > 0 && rand() < FG_NEIGHBOR_BIAS) {
    const base = neighbors[randInt(neighbors.length)];
    const candidates = [base - 1, base, base + 1].filter(n => n >= 1 && n <= FG_TILE_NUMBER_MAX);
    number = candidates[randInt(candidates.length)];
  } else {
    number = randInt(FG_TILE_NUMBER_MAX) + 1;
  }
  return { color, number, kind: 'normal' };
}

// --- Evaluation ---

function evaluateFGGrid(grid: FGTile[][]): { combos: Combo[]; winPositions: [number, number][] } {
  const combos: Combo[] = [];
  const usedPositions = new Set<string>();

  for (let row = 0; row < ROWS; row++) {
    const tiles = grid.map(reel => reel[row]);

    // Check GROUP: same number, different colors
    let foundCombo = false;
    for (let start = 0; start <= 2 && !foundCombo; start++) {
      const group: [number, number][] = [];
      const usedColors = new Set<string>();
      let targetNum = -1;
      let jokerUsed = false;

      for (let i = start; i < REELS; i++) {
        const t = tiles[i];
        const key = `${i},${row}`;
        if (usedPositions.has(key)) break;

        if (t.kind === 'joker' || t.kind === 'golden_joker') {
          if (jokerUsed) break;
          jokerUsed = true;
          group.push([i, row]);
        } else if (t.kind === 'scatter') {
          break;
        } else if (targetNum === -1) {
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
        group.forEach(([c, r]) => usedPositions.add(`${c},${r}`));
        foundCombo = true;
      }
    }

    // Check RUN: consecutive numbers, same color
    if (!foundCombo) {
      for (let start = 0; start <= 2; start++) {
        const startTile = tiles[start];
        if (startTile.kind !== 'normal') continue;
        const runColor = startTile.color;
        let expectedNum = startTile.number;
        const run: [number, number][] = [[start, row]];
        let jokerUsed = false;

        for (let i = start + 1; i < REELS; i++) {
          const key = `${i},${row}`;
          if (usedPositions.has(key)) break;
          expectedNum++;
          const t = tiles[i];
          if (t.kind === 'normal' && t.color === runColor && t.number === expectedNum) {
            run.push([i, row]);
          } else if ((t.kind === 'joker' || t.kind === 'golden_joker') && !jokerUsed) {
            jokerUsed = true;
            run.push([i, row]);
          } else {
            break;
          }
        }
        if (run.length >= 3) {
          combos.push({ type: 'run', positions: run });
          run.forEach(([c, r]) => usedPositions.add(`${c},${r}`));
          break;
        }
      }
    }
  }

  const winPositions = combos.flatMap(c => c.positions);
  return { combos, winPositions };
}

// --- Cascade Drop ---

function cascadeDrop(
  grid: FGTile[][],
  eliminatedPositions: Set<string>,
  goldenJokerPositions: Set<string>,
): { newGrid: FGTile[][]; dropMap: { reel: number; from: number; to: number }[]; newTilePositions: [number, number][] } {
  const newGrid: FGTile[][] = [];
  const dropMap: { reel: number; from: number; to: number }[] = [];
  const newTilePositions: [number, number][] = [];

  for (let col = 0; col < REELS; col++) {
    const column: (FGTile | null)[] = new Array(ROWS).fill(null);
    const surviving: FGTile[] = [];
    const goldenSlots = new Map<number, FGTile>();

    for (let row = 0; row < ROWS; row++) {
      const key = `${col},${row}`;
      if (goldenJokerPositions.has(key)) {
        goldenSlots.set(row, grid[col][row]);
      } else if (!eliminatedPositions.has(key)) {
        surviving.push(grid[col][row]);
      }
    }

    // Place golden jokers at fixed positions
    for (const [row, tile] of goldenSlots) {
      column[row] = tile;
    }

    // Fill surviving tiles from bottom
    let survIdx = surviving.length - 1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (column[row] !== null) continue;
      if (survIdx >= 0) {
        column[row] = surviving[survIdx--];
        // Track drop movement
        const origRow = survIdx + 1; // approximate
        if (origRow !== row) {
          dropMap.push({ reel: col, from: origRow, to: row });
        }
      }
    }

    newGrid.push(column as FGTile[]);
  }

  // Fill empty positions with new tiles
  for (let col = 0; col < REELS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (newGrid[col][row] === null) {
        const neighbors = getNeighborNumbers(newGrid as FGTile[][], col, row);
        newGrid[col][row] = generateFillTile(neighbors);
        newTilePositions.push([col, row]);
      }
    }
  }

  return { newGrid: newGrid as FGTile[][], dropMap, newTilePositions };
}

// --- Scatter Helpers ---

export function countScatters(grid: FGTile[][]): number {
  let count = 0;
  for (let col = 0; col < REELS; col++)
    for (let row = 0; row < ROWS; row++)
      if (grid[col][row].kind === 'scatter') count++;
  return count;
}

function removeScatters(grid: FGTile[][]): FGTile[][] {
  const scatterPos = new Set<string>();
  for (let col = 0; col < REELS; col++)
    for (let row = 0; row < ROWS; row++)
      if (grid[col][row].kind === 'scatter') scatterPos.add(`${col},${row}`);
  if (scatterPos.size === 0) return grid;
  return cascadeDrop(grid, scatterPos, new Set()).newGrid;
}

// --- Main Engine ---

export function checkFreeGameTrigger(scatterCount: number): { triggered: boolean; rounds: number; initialMult: number } {
  if (scatterCount < 3) return { triggered: false, rounds: 0, initialMult: 1 };
  const key = Math.min(scatterCount, 5);
  return { triggered: true, rounds: FREE_ROUNDS_BY_SCATTER[key], initialMult: key === 5 ? 2 : 1 };
}

function getMultiplier(cascadeCount: number): number {
  const idx = Math.min(cascadeCount - 1, MULT_TABLE.length - 1);
  return idx >= 0 ? MULT_TABLE[idx] : 1;
}

export function executeFreeGame(bet: number, initialRounds: number): FGResult {
  const state: FGState = {
    roundsRemaining: initialRounds,
    roundsTotal: initialRounds,
    cascadeCount: 0,
    currentMultiplier: 1,
    roundWin: 0,
    totalWin: 0,
    goldenJokerPositions: [],
  };

  const rounds: FGRoundResult[] = [];

  while (state.roundsRemaining > 0) {
    state.roundsRemaining--;
    rounds.push(executeRound(state, bet));
  }

  return { rounds, totalWin: state.totalWin, totalRounds: rounds.length };
}

function executeRound(state: FGState, bet: number): FGRoundResult {
  state.cascadeCount = 0;
  state.roundWin = 0;
  state.goldenJokerPositions = [];

  let grid = generateFGGrid(true);
  const initialGrid = grid.map(col => [...col]);

  // Scatter check
  const scatterCount = countScatters(grid);
  let retriggerRounds = 0;
  if (scatterCount >= 3) {
    const key = Math.min(scatterCount, 5);
    retriggerRounds = RETRIGGER_BY_SCATTER[key];
    state.roundsRemaining = Math.min(state.roundsRemaining + retriggerRounds, FG_MAX_ROUNDS);
    state.roundsTotal += retriggerRounds;
  }

  grid = removeScatters(grid);

  // Cascade loop
  const cascadeSteps: CascadeStep[] = [];

  while (true) {
    const { combos, winPositions } = evaluateFGGrid(grid);
    if (combos.length === 0) break;

    state.cascadeCount++;
    const multiplier = getMultiplier(state.cascadeCount);
    const stepWin = winPositions.length * FG_BASE_WIN_FACTOR * bet * multiplier;
    state.roundWin += stepWin;

    // Determine eliminated positions (exclude golden joker)
    const eliminatedSet = new Set<string>();
    const eliminatedPositions: [number, number][] = [];
    const goldenSet = new Set<string>();

    for (const [col, row] of winPositions) {
      if (grid[col][row].kind === 'golden_joker') {
        goldenSet.add(`${col},${row}`);
      } else {
        eliminatedSet.add(`${col},${row}`);
        eliminatedPositions.push([col, row]);
      }
    }

    // Also track all golden jokers on grid
    for (let c = 0; c < REELS; c++)
      for (let r = 0; r < ROWS; r++)
        if (grid[c][r].kind === 'golden_joker') goldenSet.add(`${c},${r}`);

    const { newGrid, dropMap, newTilePositions } = cascadeDrop(grid, eliminatedSet, goldenSet);

    cascadeSteps.push({
      grid: grid.map(col => [...col]),
      combos,
      winPositions,
      cascadeCount: state.cascadeCount,
      multiplier,
      stepWin,
      eliminatedPositions,
      dropMap,
      newTilePositions,
      newGrid,
    });

    grid = newGrid;
  }

  state.totalWin += state.roundWin;

  return { initialGrid, cascadeSteps, scatterCount, retriggerRounds, roundWin: state.roundWin };
}
