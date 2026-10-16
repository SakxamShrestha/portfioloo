/**
 * Maze generation.
 *
 * A seeded recursive-backtracker. Seeding matters for three reasons: the maze
 * must be identical on server and client or hydration mismatches, a portfolio
 * must not reshuffle its own navigation between visits, and an original layout
 * generated from a known seed cannot accidentally resemble anyone else's.
 *
 * The algorithm carves a spanning tree, so every corridor cell is reachable
 * from every other one by construction. No layout can trap a visitor.
 */

/** Cell kinds in the rasterised grid. */
export const CELL = Object.freeze({
  WALL: "#",
  CORRIDOR: ".",
});

/**
 * Deterministic 32-bit PRNG (mulberry32).
 *
 * Math.random cannot be seeded, and a maze that differed between the server
 * render and the client render would hydrate incorrectly.
 *
 * @param {number} seed
 * @returns {() => number} generator returning floats in [0, 1)
 */
export function createRandom(seed) {
  let state = seed >>> 0;

  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let drafted = Math.imul(state ^ (state >>> 15), 1 | state);
    drafted = (drafted + Math.imul(drafted ^ (drafted >>> 7), 61 | drafted)) ^ drafted;
    return ((drafted ^ (drafted >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle against a supplied generator. Returns a new array.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {() => number} random
 * @returns {T[]}
 */
function shuffled(items, random) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

/** The four orthogonal steps, in grid cells. */
const DIRECTIONS = Object.freeze([
  Object.freeze({ columnStep: 0, rowStep: -2 }),
  Object.freeze({ columnStep: 2, rowStep: 0 }),
  Object.freeze({ columnStep: 0, rowStep: 2 }),
  Object.freeze({ columnStep: -2, rowStep: 0 }),
]);

/**
 * Carve a maze into a wall-filled grid.
 *
 * Corridors sit on odd coordinates and walls on even ones, so both rasterised
 * grid dimensions must be odd. A 29x17 grid yields a 14x8 cell maze.
 *
 * @param {object} options
 * @param {number} options.columns odd integer >= 5
 * @param {number} options.rows    odd integer >= 5
 * @param {number} options.seed
 * @returns {{ grid: string[][], columns: number, rows: number }}
 */
export function generateMaze({ columns, rows, seed }) {
  if (!Number.isInteger(columns) || columns < 5 || columns % 2 === 0) {
    throw new RangeError("generateMaze(): columns must be an odd integer >= 5");
  }
  if (!Number.isInteger(rows) || rows < 5 || rows % 2 === 0) {
    throw new RangeError("generateMaze(): rows must be an odd integer >= 5");
  }
  if (!Number.isInteger(seed)) {
    throw new TypeError("generateMaze(): seed must be an integer");
  }

  const random = createRandom(seed);
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => CELL.WALL),
  );

  // Iterative rather than recursive: a large maze would otherwise risk the
  // call stack.
  const start = { column: 1, row: 1 };
  grid[start.row][start.column] = CELL.CORRIDOR;
  const stack = [start];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    let carved = false;

    for (const direction of shuffled(DIRECTIONS, random)) {
      const nextColumn = current.column + direction.columnStep;
      const nextRow = current.row + direction.rowStep;

      const isInside =
        nextColumn > 0 &&
        nextColumn < columns - 1 &&
        nextRow > 0 &&
        nextRow < rows - 1;

      if (!isInside || grid[nextRow][nextColumn] === CELL.CORRIDOR) continue;

      // Knock out the wall between the two cells, then the cell itself.
      grid[current.row + direction.rowStep / 2][
        current.column + direction.columnStep / 2
      ] = CELL.CORRIDOR;
      grid[nextRow][nextColumn] = CELL.CORRIDOR;

      stack.push({ column: nextColumn, row: nextRow });
      carved = true;
      break;
    }

    if (!carved) stack.pop();
  }

  return { grid, columns, rows };
}

/**
 * Open a handful of extra connections.
 *
 * A pure spanning tree has exactly one route between any two points, which
 * makes crossing it a chore rather than a place. Braiding a few walls open
 * creates loops, so a visitor heading for a gate is never forced to retrace
 * their steps.
 *
 * @param {readonly string[][]} grid
 * @param {object} options
 * @param {number} options.seed
 * @param {number} options.openings how many walls to remove
 * @returns {string[][]} a new grid; the input is not modified
 */
export function braidMaze(grid, { seed, openings }) {
  const random = createRandom(seed);
  const braided = grid.map((row) => [...row]);
  const rows = braided.length;
  const columns = braided[0].length;

  /** Interior walls with corridor on both opposing sides can be opened. */
  const candidates = [];
  for (let row = 1; row < rows - 1; row += 1) {
    for (let column = 1; column < columns - 1; column += 1) {
      if (braided[row][column] !== CELL.WALL) continue;

      const horizontal =
        braided[row][column - 1] === CELL.CORRIDOR &&
        braided[row][column + 1] === CELL.CORRIDOR;
      const vertical =
        braided[row - 1][column] === CELL.CORRIDOR &&
        braided[row + 1][column] === CELL.CORRIDOR;

      if (horizontal || vertical) candidates.push({ row, column });
    }
  }

  shuffled(candidates, random)
    .slice(0, Math.max(0, openings))
    .forEach(({ row, column }) => {
      braided[row][column] = CELL.CORRIDOR;
    });

  return braided;
}
