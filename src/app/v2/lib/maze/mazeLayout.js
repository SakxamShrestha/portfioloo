import { V2_SECTIONS } from "../sections";
import { CELL, braidMaze, generateMaze } from "./generateMaze";

/**
 * Turns a raw maze into a playable board: gates for each section, a player
 * start, and a pellet on every remaining corridor cell.
 *
 * Gate anchors are expressed as fractions of the grid so the five sections
 * stay spread out regardless of the grid size, then snapped to the nearest
 * actual corridor cell. Hard-coding coordinates would silently misplace a
 * gate the moment the dimensions changed.
 */

/** Board dimensions. Both must be odd for the carving algorithm. */
export const BOARD = Object.freeze({
  COLUMNS: 29,
  ROWS: 17,
  /** Fixed so the layout is stable across visits and across renders. */
  SEED: 20261016,
  /** Extra wall openings, to create loops rather than a single tree route. */
  BRAID_OPENINGS: 14,
});

/**
 * Where each section's gate should sit, as a fraction of the board.
 *
 * Spread to the four corners plus bottom centre, keeping the middle clear for
 * the player's start so no gate is entered by accident on load.
 */
const GATE_ANCHORS = Object.freeze([
  Object.freeze({ columnFraction: 0.1, rowFraction: 0.12 }),
  Object.freeze({ columnFraction: 0.9, rowFraction: 0.12 }),
  Object.freeze({ columnFraction: 0.1, rowFraction: 0.88 }),
  Object.freeze({ columnFraction: 0.9, rowFraction: 0.88 }),
  Object.freeze({ columnFraction: 0.5, rowFraction: 0.88 }),
]);

/**
 * Find the corridor cell closest to a target position.
 *
 * @param {readonly string[][]} grid
 * @param {number} targetColumn
 * @param {number} targetRow
 * @param {ReadonlySet<string>} taken cells already assigned, as "column,row"
 * @returns {{ column: number, row: number }}
 */
function nearestCorridor(grid, targetColumn, targetRow, taken) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      if (grid[row][column] !== CELL.CORRIDOR) continue;
      if (taken.has(`${column},${row}`)) continue;

      // Squared distance: the square root would not change the ordering.
      const distance =
        (column - targetColumn) ** 2 + (row - targetRow) ** 2;

      if (distance < bestDistance) {
        bestDistance = distance;
        best = { column, row };
      }
    }
  }

  if (!best) throw new Error("nearestCorridor(): the maze has no free corridor");
  return best;
}

/**
 * Build the playable board.
 *
 * @param {object} [options]
 * @param {number} [options.seed]
 * @returns {Readonly<{
 *   grid: readonly string[][],
 *   columns: number,
 *   rows: number,
 *   gates: readonly object[],
 *   start: { column: number, row: number },
 *   pellets: readonly { column: number, row: number }[],
 * }>}
 */
export function buildBoard({ seed = BOARD.SEED } = {}) {
  const carved = generateMaze({
    columns: BOARD.COLUMNS,
    rows: BOARD.ROWS,
    seed,
  });
  const grid = braidMaze(carved.grid, {
    seed: seed + 1,
    openings: BOARD.BRAID_OPENINGS,
  });

  const taken = new Set();

  // The player starts dead centre, snapped to a corridor.
  const start = nearestCorridor(
    grid,
    Math.floor(BOARD.COLUMNS / 2),
    Math.floor(BOARD.ROWS / 2),
    taken,
  );
  taken.add(`${start.column},${start.row}`);

  const gates = V2_SECTIONS.map((section, index) => {
    const anchor = GATE_ANCHORS[index % GATE_ANCHORS.length];
    const cell = nearestCorridor(
      grid,
      Math.round(anchor.columnFraction * (BOARD.COLUMNS - 1)),
      Math.round(anchor.rowFraction * (BOARD.ROWS - 1)),
      taken,
    );
    taken.add(`${cell.column},${cell.row}`);

    return Object.freeze({
      id: section.href,
      label: section.label,
      href: section.href,
      column: cell.column,
      row: cell.row,
    });
  });

  // A pellet on every corridor cell that is not a gate or the start, so the
  // score reflects ground actually covered.
  const pellets = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid[row].length; column += 1) {
      if (grid[row][column] !== CELL.CORRIDOR) continue;
      if (taken.has(`${column},${row}`)) continue;
      pellets.push(Object.freeze({ column, row }));
    }
  }

  return Object.freeze({
    grid: Object.freeze(grid.map((row) => Object.freeze([...row]))),
    columns: BOARD.COLUMNS,
    rows: BOARD.ROWS,
    gates: Object.freeze(gates),
    start: Object.freeze(start),
    pellets: Object.freeze(pellets),
  });
}

/**
 * Whether a cell can be walked into.
 *
 * @param {readonly string[][]} grid
 * @param {number} column
 * @param {number} row
 * @returns {boolean}
 */
export function isWalkable(grid, column, row) {
  return grid[row]?.[column] === CELL.CORRIDOR;
}
