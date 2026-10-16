import { CAPABILITY, TIER } from "./constants";

/**
 * Boot gate.
 *
 * The full scene is a large download and a sustained GPU cost. We decide once,
 * before any of it is fetched, whether this visitor should get it at all.
 * Everyone else gets the flat DOM version, which is the real site -- not a
 * degraded apology for one.
 *
 * Pure function over a plain snapshot so it is testable without a browser.
 */

/**
 * @typedef {object} EnvironmentSnapshot
 * @property {boolean} hasWebgl2        WebGL2 context was obtainable.
 * @property {boolean} prefersReducedMotion
 * @property {boolean} prefersSaveData  Client opted into data saving.
 * @property {number}  viewportWidth    CSS pixels.
 * @property {number|null} deviceMemoryGb navigator.deviceMemory, or null if unreported.
 * @property {number|null} logicalCores  navigator.hardwareConcurrency, or null if unreported.
 */

/**
 * Reasons a visitor was routed to the flat tier. Surfaced in the UI so the
 * choice is explainable rather than mysterious.
 */
export const FLAT_REASON = Object.freeze({
  NO_WEBGL2: "no-webgl2",
  REDUCED_MOTION: "reduced-motion",
  SAVE_DATA: "save-data",
  SMALL_VIEWPORT: "small-viewport",
  LOW_MEMORY: "low-memory",
  FEW_CORES: "few-cores",
});

/**
 * Probe for a usable 2D canvas context.
 *
 * The board needs only this, which is why it ships to phones and low-end
 * machines that the baked 3D scene would have excluded. Effectively universal,
 * but worth checking rather than assuming.
 *
 * @returns {boolean}
 */
export function detectCanvas2d() {
  try {
    return Boolean(document.createElement("canvas").getContext("2d"));
  } catch {
    return false;
  }
}

/**
 * Probe for a usable WebGL2 context without leaking the canvas.
 *
 * Reserved for the baked 3D cabinet described in the export contract; the
 * board itself does not need it.
 *
 * @returns {boolean}
 */
function detectWebgl2() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Release the context eagerly; we only wanted to know it was possible.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    // Some privacy-hardened browsers throw rather than return null.
    return false;
  }
}

/**
 * Read the current browser environment into a plain snapshot.
 *
 * @returns {EnvironmentSnapshot}
 */
export function readEnvironment() {
  if (typeof window === "undefined") {
    throw new Error("readEnvironment() requires a browser environment");
  }

  const connection = navigator.connection ?? null;

  return Object.freeze({
    hasCanvas2d: detectCanvas2d(),
    hasWebgl2: detectWebgl2(),
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    prefersSaveData: connection?.saveData === true,
    viewportWidth: window.innerWidth,
    deviceMemoryGb:
      typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null,
    logicalCores:
      typeof navigator.hardwareConcurrency === "number"
        ? navigator.hardwareConcurrency
        : null,
  });
}

/**
 * Decide the rendering tier from an environment snapshot.
 *
 * Unreported values (null) are treated as capable: we do not punish browsers
 * that decline to fingerprint themselves.
 *
 * @param {EnvironmentSnapshot} environment
 * @returns {{ tier: string, reasons: readonly string[] }}
 */
export function selectTier(environment) {
  if (!environment || typeof environment !== "object") {
    throw new TypeError("selectTier() requires an environment snapshot");
  }

  const reasons = [];

  if (!environment.hasWebgl2) reasons.push(FLAT_REASON.NO_WEBGL2);
  if (environment.prefersReducedMotion) reasons.push(FLAT_REASON.REDUCED_MOTION);
  if (environment.prefersSaveData) reasons.push(FLAT_REASON.SAVE_DATA);

  if (environment.viewportWidth < CAPABILITY.MIN_VIEWPORT_WIDTH) {
    reasons.push(FLAT_REASON.SMALL_VIEWPORT);
  }
  if (
    environment.deviceMemoryGb !== null &&
    environment.deviceMemoryGb < CAPABILITY.MIN_DEVICE_MEMORY_GB
  ) {
    reasons.push(FLAT_REASON.LOW_MEMORY);
  }
  if (
    environment.logicalCores !== null &&
    environment.logicalCores < CAPABILITY.MIN_LOGICAL_CORES
  ) {
    reasons.push(FLAT_REASON.FEW_CORES);
  }

  return Object.freeze({
    tier: reasons.length === 0 ? TIER.FULL : TIER.FLAT,
    reasons: Object.freeze(reasons),
  });
}

/**
 * Clamp the device pixel ratio so a full-screen canvas does not render at 3x.
 *
 * @param {number} devicePixelRatio
 * @param {number} maximum
 * @returns {number}
 */
export function clampPixelRatio(devicePixelRatio, maximum) {
  if (!Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) return 1;
  return Math.min(devicePixelRatio, maximum);
}
