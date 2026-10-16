"use client";

import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

import styles from "../../styles/v2/hud.module.css";
import VuMeter from "./vuMeter";

/**
 * Ambience control.
 *
 * Always visible and always off by default. Autoplay policy forbids starting
 * without a gesture, and starting unbidden would be rude even if it did not.
 */
export default function AudioToggle({ enabled, onToggle, readLevel, error }) {
  return (
    <div className={styles.audioCluster}>
      <VuMeter readLevel={readLevel} active={enabled} />
      <button
        type="button"
        className={styles.audioButton}
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Mute ambience" : "Play ambience"}
      >
        {enabled ? <FaVolumeUp aria-hidden="true" /> : <FaVolumeMute aria-hidden="true" />}
        <span className={styles.audioLabel}>
          {enabled ? "Ambience on" : "Ambience off"}
        </span>
      </button>
      {error ? (
        <p className={styles.audioError} role="status">
          Audio unavailable in this browser.
        </p>
      ) : null}
    </div>
  );
}
