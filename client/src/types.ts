export type TileColor = 'red' | 'blue' | 'yellow' | 'black';

export interface Tile {
  color: TileColor;
  number: number;
}

export interface JokerTile {
  color: 'joker';
  number: 0;
}

export type SlotTile = Tile | JokerTile;

export interface Combo {
  type: 'group' | 'run';
  positions: [number, number][]; // [reel, row] pairs
}

export interface SpinResult {
  grid: SlotTile[][]; // 5 reels × 3 rows
  combos: Combo[];
  winPositions: [number, number][]; // flattened from combos for highlight
  winAmount: number;
  scatterCount: number;
}
