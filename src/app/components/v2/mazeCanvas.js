"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { buildBoard } from "../../v2/lib/maze/mazeLayout";
import {
  createPlayer,
  directionForKey,
  directionForSwipe,
  playerPosition,
  queueDirection,
  stepPlayer,
} from "../../v2/lib/maze/mazeMotion";
import {
  drawBoard,
  prepareCanvas,
  readPalette,
} from "../../v2/lib/maze/mazeRenderer";
import styles from "../../styles/v2/maze.module.css";

/**
 * The board.
 *
 * Keyboard or swipe moves the mark through the corridors; reaching a gate
 * opens that section. This is a faster, better-feeling way to navigate for
 * someone who wants to play with it -- and never the only way. The real links
 * sit in the DOM alongside, so nobody is required to drive a maze to read a
 * resume.
 */

/** Minimum swipe distance, in pixels, to count as deliberate. */
const SWIPE_THRESHOLD_PX = 24;

/** Largest delta we integrate in one frame; guards against tab-switch jumps. */
const MAX_FRAME_SECONDS = 1 / 20;

/** Pixel ratio ceiling. Past 2x the pixel grid gains nothing. */
const MAX_PIXEL_RATIO = 2;

export default function MazeCanvas({ onScore, onGateReached, reducedMotion }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  // Built once: the layout is seeded, so it must not be regenerated per render.
  const board = useMemo(() => buildBoard(), []);

  const stateRef = useRef({
    player: createPlayer(board.start),
    eaten: new Set(),
    palette: null,
    cellSize: 0,
    navigating: false,
  });

  const handleDirection = useCallback((direction) => {
    if (!direction) return;
    const state = stateRef.current;
    state.player = queueDirection(state.player, direction);
  }, []);

  /** Keyboard. Scroll keys are suppressed only when they drive the board. */
  useEffect(() => {
    function handleKeyDown(event) {
      const direction = directionForKey(event.key);
      if (!direction) return;
      event.preventDefault();
      handleDirection(direction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDirection]);

  /** Touch: a swipe anywhere on the board. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let origin = null;

    function handleStart(event) {
      const touch = event.changedTouches[0];
      origin = { x: touch.clientX, y: touch.clientY };
    }

    function handleEnd(event) {
      if (!origin) return;
      const touch = event.changedTouches[0];
      handleDirection(
        directionForSwipe(
          touch.clientX - origin.x,
          touch.clientY - origin.y,
          SWIPE_THRESHOLD_PX,
        ),
      );
      origin = null;
    }

    canvas.addEventListener("touchstart", handleStart, { passive: true });
    canvas.addEventListener("touchend", handleEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, [handleDirection]);

  /** Sizing, drawing and the frame loop. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const state = stateRef.current;
    state.palette = readPalette(canvas);

    let context = null;

    function resize() {
      const available = canvas.parentElement?.clientWidth ?? 0;
      if (available <= 0) return;

      // One cell size for both axes keeps the grid square.
      const cellSize = Math.floor(available / board.columns);
      state.cellSize = cellSize;

      context = prepareCanvas(
        canvas,
        cellSize * board.columns,
        cellSize * board.rows,
        Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO),
      );
    }

    function render() {
      if (!context || state.cellSize <= 0) return;

      drawBoard(context, {
        board,
        cellSize: state.cellSize,
        palette: state.palette,
        eaten: state.eaten,
        position: playerPosition(state.player),
        facing: state.player.facing,
        activeGateId: null,
      });
    }

    const observer = new ResizeObserver(() => {
      resize();
      render();
    });
    observer.observe(canvas.parentElement ?? canvas);
    resize();

    // Reduced motion: draw the board once and let the DOM links do the work.
    if (reducedMotion) {
      render();
      return () => observer.disconnect();
    }

    let previous = performance.now();

    function tick(now) {
      const delta = Math.min((now - previous) / 1000, MAX_FRAME_SECONDS);
      previous = now;

      state.player = stepPlayer(state.player, board.grid, delta);

      const cellKey = `${state.player.column},${state.player.row}`;

      // Pellets: counted on arrival at a cell, once.
      const pelletHere = board.pellets.some(
        (pellet) => `${pellet.column},${pellet.row}` === cellKey,
      );
      if (pelletHere && !state.eaten.has(cellKey)) {
        state.eaten.add(cellKey);
        onScore?.(state.eaten.size);
      }

      // Gates: navigate once, then stop driving the loop.
      const gate = board.gates.find(
        (candidate) => `${candidate.column},${candidate.row}` === cellKey,
      );
      if (gate && !state.navigating) {
        state.navigating = true;
        onGateReached?.(gate);
        router.push(gate.href);
      }

      render();
      frameRef.current = window.requestAnimationFrame(tick);
    }

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [board, onGateReached, onScore, reducedMotion, router]);

  return (
    <div className={styles.boardFrame}>
      <canvas
        ref={canvasRef}
        className={styles.board}
        // The board is decorative duplication of the links below it, so it is
        // hidden from assistive tech rather than described badly.
        aria-hidden="true"
      />
    </div>
  );
}
