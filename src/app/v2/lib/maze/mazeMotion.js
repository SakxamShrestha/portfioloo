import { isWalkable } from "./mazeLayout";

/**
 * Player movement.
 *
 * Classic arcade handling: the player keeps travelling in the facing
 * direction until a wall stops them, and a turn requested mid-corridor is
 * queued and applied on arrival at the next cell. That queue is what makes
 * the controls feel responsive instead of demanding frame-perfect timing at
 * each junction.
 *
 * Every function here returns new state. Nothing is mutated, so the renderer
 * can hold a previous frame's state for interpolation without being surprised.
 */

/** Cells traversed per second. */
export const PLAYER_SPEED = 5.5;

/** The four headings, plus the resting state. */
export const DIRECTION = Object.freeze({
  NONE: Object.freeze({ column: 0, row: 0 }),
  UP: Object.freeze({ column: 0, row: -1 }),
  DOWN: Object.freeze({ column: 0, row: 1 }),
  LEFT: Object.freeze({ column: -1, row: 0 }),
  RIGHT: Object.freeze({ column: 1, row: 0 }),
});

/**
 * Create the initial player state.
 *
 * @param {{ column: number, row: number }} start
 * @returns {Readonly<object>}
 */
export function createPlayer(start) {
  return Object.freeze({
    column: start.column,
    row: start.row,
    /** Progress toward the next cell, 0..1. */
    progress: 0,
    direction: DIRECTION.NONE,
    queued: DIRECTION.NONE,
    /** Last non-resting heading, so the mark keeps facing somewhere. */
    facing: DIRECTION.RIGHT,
  });
}

function isResting(direction) {
  return direction.column === 0 && direction.row === 0;
}

/**
 * Queue a turn. Applied at the next cell boundary, or immediately if resting.
 *
 * @param {Readonly<object>} player
 * @param {Readonly<{column: number, row: number}>} direction
 * @returns {Readonly<object>}
 */
export function queueDirection(player, direction) {
  return Object.freeze({ ...player, queued: direction });
}

/**
 * Advance the player by one frame.
 *
 * @param {Readonly<object>} player
 * @param {readonly string[][]} grid
 * @param {number} deltaSeconds
 * @returns {Readonly<object>} the next state
 */
export function stepPlayer(player, grid, deltaSeconds) {
  const canGo = (direction) =>
    !isResting(direction) &&
    isWalkable(grid, player.column + direction.column, player.row + direction.row);

  // At rest: a queued direction starts movement if it is not into a wall.
  if (isResting(player.direction)) {
    if (!canGo(player.queued)) {
      return player.queued === DIRECTION.NONE
        ? player
        : Object.freeze({ ...player, queued: DIRECTION.NONE });
    }

    return Object.freeze({
      ...player,
      direction: player.queued,
      facing: player.queued,
      queued: DIRECTION.NONE,
      progress: 0,
    });
  }

  const progress = player.progress + PLAYER_SPEED * deltaSeconds;

  // Still crossing the current cell.
  if (progress < 1) {
    return Object.freeze({ ...player, progress });
  }

  // Arrived. Land on the next cell, then decide where to go from here.
  const column = player.column + player.direction.column;
  const row = player.row + player.direction.row;
  const landed = { ...player, column, row, progress: 0 };

  // A queued turn wins if it is open from the cell just landed on.
  if (isWalkableFrom(grid, landed, player.queued)) {
    return Object.freeze({
      ...landed,
      direction: player.queued,
      facing: player.queued,
      queued: DIRECTION.NONE,
    });
  }

  // Otherwise carry straight on, if the corridor continues.
  if (isWalkableFrom(grid, landed, player.direction)) {
    return Object.freeze({ ...landed, queued: DIRECTION.NONE });
  }

  // Wall ahead: stop, keeping the queued turn for the next frame.
  return Object.freeze({ ...landed, direction: DIRECTION.NONE });
}

/**
 * Whether a direction is open from a given cell.
 *
 * @param {readonly string[][]} grid
 * @param {{ column: number, row: number }} cell
 * @param {{ column: number, row: number }} direction
 * @returns {boolean}
 */
function isWalkableFrom(grid, cell, direction) {
  if (isResting(direction)) return false;
  return isWalkable(grid, cell.column + direction.column, cell.row + direction.row);
}

/**
 * The player's position in fractional cell coordinates, for rendering.
 *
 * @param {Readonly<object>} player
 * @returns {{ column: number, row: number }}
 */
export function playerPosition(player) {
  return {
    column: player.column + player.direction.column * player.progress,
    row: player.row + player.direction.row * player.progress,
  };
}

/**
 * Map a keyboard key to a direction.
 *
 * Arrows and WASD both, because a visitor will try whichever they already use.
 *
 * @param {string} key the KeyboardEvent key value
 * @returns {Readonly<{column: number, row: number}>|null}
 */
export function directionForKey(key) {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return DIRECTION.UP;
    case "ArrowDown":
    case "s":
    case "S":
      return DIRECTION.DOWN;
    case "ArrowLeft":
    case "a":
    case "A":
      return DIRECTION.LEFT;
    case "ArrowRight":
    case "d":
    case "D":
      return DIRECTION.RIGHT;
    default:
      return null;
  }
}

/**
 * Map a swipe to a direction, ignoring drags too short to be deliberate.
 *
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {number} threshold minimum distance in pixels
 * @returns {Readonly<{column: number, row: number}>|null}
 */
export function directionForSwipe(deltaX, deltaY, threshold) {
  if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return null;

  // The dominant axis wins, so a slightly diagonal swipe still works.
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
  }
  return deltaY > 0 ? DIRECTION.DOWN : DIRECTION.UP;
}
