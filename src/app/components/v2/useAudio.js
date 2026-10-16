"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createAudioEngine,
  readStoredPreference,
  writeStoredPreference,
} from "../../v2/lib/audioEngine";

/**
 * React binding for the audio engine.
 *
 * Holds the engine in a ref so it survives re-renders, and exposes a plain
 * state surface the HUD can render from. The stored preference is read but
 * never auto-applied: resuming sound without a gesture is both blocked by
 * browsers and unpleasant. It only pre-selects what the toggle will do.
 */
export default function useAudio() {
  const engineRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  const [wasPreviouslyEnabled, setWasPreviouslyEnabled] = useState(false);

  useEffect(() => {
    setWasPreviouslyEnabled(readStoredPreference());

    engineRef.current = createAudioEngine();
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const toggle = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const next = !enabled;

    try {
      await engine.setEnabled(next);
      setEnabled(next);
      setError(false);
      writeStoredPreference(next);
    } catch {
      // The engine already logged the cause. Surface it in the UI and leave
      // the toggle in the off position rather than lying about state.
      setEnabled(false);
      setError(true);
    }
  }, [enabled]);

  const readLevel = useCallback(() => engineRef.current?.readLevel() ?? 0, []);

  return { enabled, error, toggle, readLevel, wasPreviouslyEnabled };
}
