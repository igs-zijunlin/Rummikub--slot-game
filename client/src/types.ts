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

export interface SpinResult {
  grid: SlotTile[][]; // 5 reels × 3 rows
  winPositions: [number, number][]; // [reel, row] pairs
  winAmount: number;
}
