"use client";

import { useEffect, useRef } from "react";

import styles from "../../styles/v2/hud.module.css";

/**
 * Analyser-driven level meter.
 *
 * Reads the engine's RMS level each frame and draws it as a column of bars.
 * Drawn on a canvas rather than as animated DOM so it costs one paint instead
 * of a layout pass per frame.
 */

/** Number of segments in the meter. */
const SEGMENT_COUNT = 12;

/** Gap between segments, in device pixels at 1x. */
const SEGMENT_GAP_PX = 2;

/** Segment colours from floor to ceiling. */
const SEGMENT_COLOR_LOW = "#4f7a52";
const SEGMENT_COLOR_MID = "#ffb867";
const SEGMENT_COLOR_HIGH = "#e0683c";

/** Level above which a segment is tinted as "mid" / "high". */
const MID_THRESHOLD = 0.55;
const HIGH_THRESHOLD = 0.82;

function segmentColor(fraction) {
  if (fraction >= HIGH_THRESHOLD) return SEGMENT_COLOR_HIGH;
  if (fraction >= MID_THRESHOLD) return SEGMENT_COLOR_MID;
  return SEGMENT_COLOR_LOW;
}

/**
 * @param {object} props
 * @param {() => number} props.readLevel returns the current level, 0..1
 * @param {boolean} props.active         false parks the meter at zero
 */
export default function VuMeter({ readLevel, active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    let animationFrame = 0;
    // Smoothed level, so the meter falls gracefully rather than snapping.
    let displayedLevel = 0;

    function draw() {
      const { width, height } = canvas;
      const targetLevel = active ? readLevel() : 0;

      // Fast attack, slow release -- standard meter ballistics.
      const smoothing = targetLevel > displayedLevel ? 0.5 : 0.08;
      displayedLevel += (targetLevel - displayedLevel) * smoothing;

      context.clearRect(0, 0, width, height);

      const segmentHeight = (height - SEGMENT_GAP_PX * (SEGMENT_COUNT - 1)) / SEGMENT_COUNT;
      const litSegments = Math.round(displayedLevel * SEGMENT_COUNT);

      for (let index = 0; index < SEGMENT_COUNT; index += 1) {
        const fraction = (index + 1) / SEGMENT_COUNT;
        const isLit = index < litSegments;

        context.fillStyle = isLit ? segmentColor(fraction) : "rgba(255,255,255,0.07)";
        context.fillRect(
          0,
          height - (index + 1) * segmentHeight - index * SEGMENT_GAP_PX,
          width,
          segmentHeight,
        );
      }

      animationFrame = window.requestAnimationFrame(draw);
    }

    animationFrame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [readLevel, active]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.meter}
      width={10}
      height={64}
      aria-hidden="true"
    />
  );
}
