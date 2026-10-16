"use client";

import { useEffect, useState } from "react";

import { detectCanvas2d } from "../../v2/lib/capability";
import styles from "../../styles/v2/experience.module.css";
import ArcadeCabinet from "./arcadeCabinet";
import FlatFallback from "./flatFallback";

/**
 * Entry point for /v2.
 *
 * The board is Canvas 2D, so unlike the baked 3D scene it runs essentially
 * everywhere, including on phones. That inverts the original tier plan: the
 * board is now the baseline experience rather than the enhancement, and the
 * WebGL cabinet described in docs/v2-blender-export-contract.md becomes a
 * later progressive layer on top of it.
 *
 * Only two things are decided here: whether a 2D canvas exists at all, and
 * whether the visitor has asked for less motion.
 */
export default function V2Experience() {
  // null means "not yet decided": the probes need browser APIs, so the first
  // paint is a neutral shell on both server and client.
  const [environment, setEnvironment] = useState(null);

  useEffect(() => {
    try {
      setEnvironment({
        hasCanvas2d: detectCanvas2d(),
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches,
      });
    } catch (error) {
      // Probing failed, so assume the most conservative environment rather
      // than rendering a board that may not work.
      console.warn("[v2] capability probe failed:", error);
      setEnvironment({ hasCanvas2d: false, reducedMotion: true });
    }
  }, []);

  if (environment === null) {
    return <div className={styles.shell} aria-busy="true" />;
  }

  if (!environment.hasCanvas2d) {
    return <FlatFallback reasons={["no-canvas"]} />;
  }

  return <ArcadeCabinet reducedMotion={environment.reducedMotion} />;
}
