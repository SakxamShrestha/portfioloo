import { CELL } from "./generateMaze";

/**
 * Canvas drawing for the board.
 *
 * Kept apart from the React component so the drawing can be reasoned about on
 * its own, and so the component holds nothing but state and input.
 *
 * Colours are read from the element's own computed CSS custom properties
 * rather than hard-coded, so the palette lives in exactly one place
 * (tokens.css) and the canvas cannot drift away from the rest of the page.
 */

/** Fraction of a cell the corridor wall inset occupies. */
const WALL_INSET = 0.12;

/** Pellet radius as a fraction of a cell. */
const PELLET_RADIUS = 0.085;

/** Player mark size as a fraction of a cell. */
const PLAYER_SIZE = 0.72;

/** Gate chamber corner radius, in cell fractions. */
const GATE_RADIUS = 0.22;

/**
 * Read the palette off the mounted element.
 *
 * @param {HTMLElement} element
 * @returns {Readonly<object>}
 */
export function readPalette(element) {
  const computed = window.getComputedStyle(element);
  const token = (name, fallback) =>
    computed.getPropertyValue(name).trim() || fallback;

  return Object.freeze({
    void: token("--void", "#05060b"),
    wall: token("--wall", "#2b3fd9"),
    wallGlow: token("--wall-glow", "#5b6bff"),
    pellet: token("--pellet", "#f2e8c9"),
    pelletDim: token("--pellet-dim", "#8d8773"),
    player: token("--player", "#ffc21c"),
    displayFont: token("--font-display", "monospace"),
  });
}

/**
 * Size the backing store to the device pixel ratio.
 *
 * Without this the maze renders soft on every retina screen, which on a
 * pixel-grid aesthetic is the one thing that cannot be forgiven.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} cssWidth
 * @param {number} cssHeight
 * @param {number} pixelRatio
 * @returns {CanvasRenderingContext2D}
 */
export function prepareCanvas(canvas, cssWidth, cssHeight, pixelRatio) {
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("prepareCanvas(): 2D context unavailable");

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return context;
}

/**
 * Whether a grid cell is a wall, treating off-grid as wall.
 *
 * Off-grid counting as solid is what lets the border draw a closed edge.
 */
function isWall(grid, column, row) {
  return grid[row]?.[column] !== CELL.CORRIDOR;
}

/**
 * Draw the maze walls.
 *
 * Each wall cell is drawn as a block that extends toward its wall neighbours,
 * so runs of wall read as continuous corridor edges rather than a field of
 * separate tiles.
 */
function drawWalls(context, board, cellSize, palette) {
  context.save();
  context.fillStyle = palette.wall;
  context.shadowColor = palette.wallGlow;
  context.shadowBlur = cellSize * 0.5;

  const inset = cellSize * WALL_INSET;

  for (let row = 0; row < board.rows; row += 1) {
    for (let column = 0; column < board.columns; column += 1) {
      if (!isWall(board.grid, column, row)) continue;

      // Extend into neighbouring wall cells to close the seams between them.
      const left = isWall(board.grid, column - 1, row) ? 0 : inset;
      const right = isWall(board.grid, column + 1, row) ? 0 : inset;
      const top = isWall(board.grid, column, row - 1) ? 0 : inset;
      const bottom = isWall(board.grid, column, row + 1) ? 0 : inset;

      context.fillRect(
        column * cellSize + left,
        row * cellSize + top,
        cellSize - left - right,
        cellSize - top - bottom,
      );
    }
  }

  context.restore();
}

function drawPellets(context, pellets, eaten, cellSize, palette) {
  context.save();
  context.fillStyle = palette.pelletDim;

  const radius = cellSize * PELLET_RADIUS;

  pellets.forEach((pellet) => {
    if (eaten.has(`${pellet.column},${pellet.row}`)) return;

    context.beginPath();
    context.arc(
      (pellet.column + 0.5) * cellSize,
      (pellet.row + 0.5) * cellSize,
      radius,
      0,
      Math.PI * 2,
    );
    context.fill();
  });

  context.restore();
}

/**
 * Draw the section gates.
 *
 * A gate is a chamber with the section name set in the display face. The
 * label is drawn into the canvas for atmosphere only -- the real, focusable
 * links live in the DOM beside the board, so navigation never depends on
 * reading pixels.
 */
function drawGates(context, gates, cellSize, palette, activeGateId) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";

  gates.forEach((gate) => {
    const centerX = (gate.column + 0.5) * cellSize;
    const centerY = (gate.row + 0.5) * cellSize;
    const isActive = gate.id === activeGateId;

    context.save();
    context.beginPath();
    context.roundRect(
      centerX - cellSize * 0.42,
      centerY - cellSize * 0.42,
      cellSize * 0.84,
      cellSize * 0.84,
      cellSize * GATE_RADIUS,
    );
    context.strokeStyle = isActive ? palette.player : palette.pellet;
    context.lineWidth = Math.max(1, cellSize * 0.07);
    context.shadowColor = isActive ? palette.player : palette.pellet;
    context.shadowBlur = cellSize * (isActive ? 0.8 : 0.3);
    context.stroke();
    context.restore();

    context.fillStyle = isActive ? palette.player : palette.pellet;
    context.font = `${Math.round(cellSize * 0.42)}px ${palette.displayFont}`;
    context.fillText(gate.label, centerX, centerY + cellSize * 0.95);
  });

  context.restore();
}

/**
 * Draw the player: an amber chevron pointing the way it is travelling.
 *
 * A chevron rather than a disc, both because it is this project's own mark
 * and because it shows heading, which a disc cannot.
 */
function drawPlayer(context, position, facing, cellSize, palette) {
  const centerX = (position.column + 0.5) * cellSize;
  const centerY = (position.row + 0.5) * cellSize;
  const size = cellSize * PLAYER_SIZE;

  // Screen-space angle of the current heading.
  const angle = Math.atan2(facing.row, facing.column);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);

  context.fillStyle = palette.player;
  context.shadowColor = palette.player;
  context.shadowBlur = cellSize * 0.7;

  context.beginPath();
  context.moveTo(size * 0.5, 0);
  context.lineTo(-size * 0.35, -size * 0.42);
  context.lineTo(-size * 0.12, 0);
  context.lineTo(-size * 0.35, size * 0.42);
  context.closePath();
  context.fill();

  context.restore();
}

/**
 * Draw one frame.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {object} frame
 */
export function drawBoard(context, frame) {
  const { board, cellSize, palette, eaten, position, facing, activeGateId } = frame;

  context.fillStyle = palette.void;
  context.fillRect(0, 0, board.columns * cellSize, board.rows * cellSize);

  drawWalls(context, board, cellSize, palette);
  drawPellets(context, board.pellets, eaten, cellSize, palette);
  drawGates(context, board.gates, cellSize, palette, activeGateId);
  drawPlayer(context, position, facing, cellSize, palette);
}
