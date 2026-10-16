import { describe, expect, test } from "vitest";

import {
  CELL,
  braidMaze,
  createRandom,
  generateMaze,
} from "../maze/generateMaze";
import { BOARD, buildBoard, isWalkable } from "../maze/mazeLayout";
import { V2_SECTIONS } from "../sections";

/**
 * Flood-fill from the first corridor cell and count what it reaches.
 *
 * Connectivity is the property that matters most: an unreachable gate is a
 * section a visitor cannot open.
 */
function countReachable(grid) {
  const rows = grid.length;
  const columns = grid[0].length;

  let origin = null;
  for (let row = 0; row < rows && !origin; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (grid[row][column] === CELL.CORRIDOR) {
        origin = { column, row };
        break;
      }
    }
  }
  if (!origin) return { reached: 0, total: 0 };

  const seen = new Set([`${origin.column},${origin.row}`]);
  const queue = [origin];

  while (queue.length > 0) {
    const { column, row } = queue.pop();
    const neighbours = [
      { column: column + 1, row },
      { column: column - 1, row },
      { column, row: row + 1 },
      { column, row: row - 1 },
    ];

    for (const neighbour of neighbours) {
      const key = `${neighbour.column},${neighbour.row}`;
      if (seen.has(key)) continue;
      if (grid[neighbour.row]?.[neighbour.column] !== CELL.CORRIDOR) continue;
      seen.add(key);
      queue.push(neighbour);
    }
  }

  const total = grid.flat().filter((cell) => cell === CELL.CORRIDOR).length;
  return { reached: seen.size, total };
}

describe("createRandom", () => {
  test("produces the same sequence for the same seed", () => {
    // Server and client must generate an identical maze.
    const first = createRandom(42);
    const second = createRandom(42);

    const sequenceA = [first(), first(), first()];
    const sequenceB = [second(), second(), second()];

    expect(sequenceA).toEqual(sequenceB);
  });

  test("produces different sequences for different seeds", () => {
    const first = createRandom(1);
    const second = createRandom(2);

    expect(first()).not.toBe(second());
  });

  test("stays within the unit interval", () => {
    const random = createRandom(7);

    for (let draw = 0; draw < 200; draw += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("generateMaze", () => {
  test("returns a grid of the requested size", () => {
    // Arrange / Act
    const { grid } = generateMaze({ columns: 29, rows: 17, seed: 1 });

    // Assert
    expect(grid).toHaveLength(17);
    expect(grid[0]).toHaveLength(29);
  });

  test("encloses the maze in a wall border", () => {
    // A gap in the border would let the player walk off the board.
    const { grid } = generateMaze({ columns: 21, rows: 11, seed: 3 });
    const lastRow = grid.length - 1;
    const lastColumn = grid[0].length - 1;

    expect(grid[0].every((cell) => cell === CELL.WALL)).toBe(true);
    expect(grid[lastRow].every((cell) => cell === CELL.WALL)).toBe(true);
    expect(grid.every((row) => row[0] === CELL.WALL)).toBe(true);
    expect(grid.every((row) => row[lastColumn] === CELL.WALL)).toBe(true);
  });

  test("connects every corridor cell", () => {
    const { grid } = generateMaze({ columns: 29, rows: 17, seed: 9 });

    const { reached, total } = countReachable(grid);

    expect(reached).toBe(total);
  });

  test("stays connected across many seeds", () => {
    // One lucky seed proves nothing; the property must hold generally.
    for (let seed = 0; seed < 25; seed += 1) {
      const { grid } = generateMaze({ columns: 21, rows: 13, seed });
      const { reached, total } = countReachable(grid);
      expect(reached).toBe(total);
    }
  });

  test("is reproducible for a given seed", () => {
    const first = generateMaze({ columns: 21, rows: 11, seed: 5 });
    const second = generateMaze({ columns: 21, rows: 11, seed: 5 });

    expect(first.grid).toEqual(second.grid);
  });

  test("differs between seeds", () => {
    const first = generateMaze({ columns: 21, rows: 11, seed: 5 });
    const second = generateMaze({ columns: 21, rows: 11, seed: 6 });

    expect(first.grid).not.toEqual(second.grid);
  });

  test("rejects even dimensions", () => {
    // Corridors live on odd coordinates; an even grid cannot be carved.
    expect(() => generateMaze({ columns: 20, rows: 11, seed: 1 })).toThrow(
      RangeError,
    );
    expect(() => generateMaze({ columns: 21, rows: 10, seed: 1 })).toThrow(
      RangeError,
    );
  });

  test("rejects a grid too small to carve", () => {
    expect(() => generateMaze({ columns: 3, rows: 11, seed: 1 })).toThrow(
      RangeError,
    );
  });

  test("rejects a non-integer seed", () => {
    expect(() => generateMaze({ columns: 21, rows: 11, seed: 1.5 })).toThrow(
      TypeError,
    );
  });
});

describe("braidMaze", () => {
  test("leaves the input grid untouched", () => {
    const { grid } = generateMaze({ columns: 21, rows: 11, seed: 2 });
    const before = grid.map((row) => [...row]);

    braidMaze(grid, { seed: 2, openings: 10 });

    expect(grid).toEqual(before);
  });

  test("opens additional corridor cells", () => {
    const { grid } = generateMaze({ columns: 29, rows: 17, seed: 2 });
    const countCorridors = (target) =>
      target.flat().filter((cell) => cell === CELL.CORRIDOR).length;

    const braided = braidMaze(grid, { seed: 2, openings: 10 });

    expect(countCorridors(braided)).toBeGreaterThan(countCorridors(grid));
  });

  test("keeps the maze connected", () => {
    const { grid } = generateMaze({ columns: 29, rows: 17, seed: 4 });

    const braided = braidMaze(grid, { seed: 4, openings: 14 });
    const { reached, total } = countReachable(braided);

    expect(reached).toBe(total);
  });

  test("changes nothing when no openings are requested", () => {
    const { grid } = generateMaze({ columns: 21, rows: 11, seed: 8 });

    expect(braidMaze(grid, { seed: 8, openings: 0 })).toEqual(grid);
  });

  test("never opens the outer border", () => {
    const { grid } = generateMaze({ columns: 21, rows: 11, seed: 11 });

    const braided = braidMaze(grid, { seed: 11, openings: 500 });

    expect(braided[0].every((cell) => cell === CELL.WALL)).toBe(true);
    expect(braided.every((row) => row[0] === CELL.WALL)).toBe(true);
  });
});

describe("buildBoard", () => {
  test("places one gate per section", () => {
    // Act
    const board = buildBoard();

    // Assert
    expect(board.gates).toHaveLength(V2_SECTIONS.length);
    expect(board.gates.map((gate) => gate.href)).toEqual(
      V2_SECTIONS.map((section) => section.href),
    );
  });

  test("places every gate on a walkable cell", () => {
    const board = buildBoard();

    board.gates.forEach((gate) => {
      expect(isWalkable(board.grid, gate.column, gate.row)).toBe(true);
    });
  });

  test("makes every gate reachable from the player start", () => {
    // The whole navigation depends on this.
    const board = buildBoard();
    const { reached, total } = countReachable(board.grid);

    expect(reached).toBe(total);
    expect(isWalkable(board.grid, board.start.column, board.start.row)).toBe(
      true,
    );
  });

  test("gives every gate a distinct cell", () => {
    const board = buildBoard();
    const cells = board.gates.map((gate) => `${gate.column},${gate.row}`);

    expect(new Set(cells).size).toBe(cells.length);
  });

  test("keeps the start clear of every gate", () => {
    // Otherwise a visitor would be navigated away the instant the page loaded.
    const board = buildBoard();
    const startKey = `${board.start.column},${board.start.row}`;

    expect(board.gates.map((gate) => `${gate.column},${gate.row}`)).not.toContain(
      startKey,
    );
  });

  test("puts no pellet on a gate or on the start", () => {
    const board = buildBoard();
    const reserved = new Set([
      `${board.start.column},${board.start.row}`,
      ...board.gates.map((gate) => `${gate.column},${gate.row}`),
    ]);

    board.pellets.forEach((pellet) => {
      expect(reserved.has(`${pellet.column},${pellet.row}`)).toBe(false);
    });
  });

  test("puts a pellet on every other corridor cell", () => {
    const board = buildBoard();
    const corridors = board.grid
      .flat()
      .filter((cell) => cell === CELL.CORRIDOR).length;

    expect(board.pellets).toHaveLength(
      corridors - 1 - board.gates.length,
    );
  });

  test("is identical across calls", () => {
    // A portfolio must not reshuffle its own navigation between visits.
    expect(buildBoard()).toEqual(buildBoard());
  });

  test("uses the configured board dimensions", () => {
    const board = buildBoard();

    expect(board.columns).toBe(BOARD.COLUMNS);
    expect(board.rows).toBe(BOARD.ROWS);
  });

  test("returns a frozen board", () => {
    const board = buildBoard();

    expect(Object.isFrozen(board)).toBe(true);
    expect(Object.isFrozen(board.gates)).toBe(true);
  });
});

describe("isWalkable", () => {
  test("accepts a corridor cell", () => {
    expect(isWalkable([[CELL.CORRIDOR]], 0, 0)).toBe(true);
  });

  test("rejects a wall cell", () => {
    expect(isWalkable([[CELL.WALL]], 0, 0)).toBe(false);
  });

  test("rejects a cell outside the grid", () => {
    // Guards the player against walking off the board.
    expect(isWalkable([[CELL.CORRIDOR]], 5, 5)).toBe(false);
    expect(isWalkable([[CELL.CORRIDOR]], -1, 0)).toBe(false);
  });
});
