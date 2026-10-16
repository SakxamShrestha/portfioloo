"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { V2_SECTIONS } from "../../v2/lib/sections";
import styles from "../../styles/v2/maze.module.css";
import AudioToggle from "./audioToggle";
import MazeCanvas from "./mazeCanvas";
import useAudio from "./useAudio";

/**
 * The /v2 hero: an arcade cabinet front.
 *
 * Status bar, board, then the controls and the real navigation. The score is
 * the count of corridor cells covered, which is the only number here that
 * means anything -- inventing a fake high score would be decoration dressed
 * up as information.
 */

/** Pad a score the way a cabinet would. */
function formatScore(value) {
  return String(value).padStart(4, "0");
}

export default function ArcadeCabinet({ reducedMotion = false }) {
  const [score, setScore] = useState(0);
  const audio = useAudio();

  const handleScore = useCallback((covered) => setScore(covered), []);

  return (
    <div className={styles.cabinet}>
      <header className={styles.status}>
        <h1 className={styles.name}>Sakxam Shrestha</h1>

        <div className={styles.scores}>
          <div className={styles.score}>
            <span className={styles.scoreLabel}>Covered</span>
            <span className={styles.scoreValue}>{formatScore(score)}</span>
          </div>
          <div className={styles.score}>
            <span className={styles.scoreLabel}>Sections</span>
            <span className={styles.scoreValueQuiet}>
              {formatScore(V2_SECTIONS.length)}
            </span>
          </div>
        </div>
      </header>

      <div className={`${styles.stage} ${reducedMotion ? "" : styles.wake}`}>
        <MazeCanvas onScore={handleScore} reducedMotion={reducedMotion} />
      </div>

      <footer className={styles.controls}>
        <p className={styles.hint}>
          {reducedMotion
            ? "Pick a section to open it."
            : "Arrow keys or WASD to move. Swipe on touch. Reach a gate to open it."}
        </p>

        <nav className={styles.links} aria-label="Portfolio sections">
          {V2_SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className={styles.link}>
              {section.label}
            </Link>
          ))}
        </nav>

        <AudioToggle
          enabled={audio.enabled}
          onToggle={audio.toggle}
          readLevel={audio.readLevel}
          error={audio.error}
        />
      </footer>
    </div>
  );
}
