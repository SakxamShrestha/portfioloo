/**
 * Shared tuning values for the v2 immersive scene.
 *
 * Everything here is a deliberate knob. No magic numbers in the modules
 * that consume these.
 */

/** Rendering tiers chosen by the boot gate. */
export const TIER = Object.freeze({
  /** Full baked WebGL scene. */
  FULL: "full",
  /** Static DOM fallback: no WebGL, no animation, no audio. */
  FLAT: "flat",
});

/** Capability thresholds for tier selection. */
export const CAPABILITY = Object.freeze({
  /** Below this viewport width we never ship the 3D bundle. */
  MIN_VIEWPORT_WIDTH: 768,
  /** navigator.deviceMemory (GiB) below this is treated as low-end. */
  MIN_DEVICE_MEMORY_GB: 4,
  /** navigator.hardwareConcurrency below this is treated as low-end. */
  MIN_LOGICAL_CORES: 4,
});

/** Device-pixel-ratio ceiling. Retina at 3x on a full-screen canvas is wasted fill rate. */
export const MAX_PIXEL_RATIO = 2;

/** Audio engine defaults. */
export const AUDIO = Object.freeze({
  /** Master gain when unmuted. Deliberately quiet: this is ambience, not a track. */
  MASTER_GAIN: 0.18,
  /** Seconds for every gain ramp. Prevents click/pop artifacts on toggle. */
  RAMP_SECONDS: 0.4,
  /** FFT size for the analyser driving the VU meter. */
  FFT_SIZE: 256,
  /**
   * Lowpass cutoff (Hz).
   *
   * Higher than an ambient pad would want: square waves need their upper
   * harmonics to read as a cabinet rather than as a hum.
   */
  LOWPASS_HZ: 3200,
  /** localStorage key holding the persisted mute preference. */
  STORAGE_KEY: "v2:audio-enabled",
});

/**
 * Oscillator bank for the cabinet hum.
 *
 * Square and triangle waves rather than sines: a 1980s cabinet had a
 * programmable sound generator, not an analogue pad, and the square wave is
 * the sound of that hardware. Voiced as an open fifth with an octave above,
 * detuned a few cents so the voices beat slowly against each other instead of
 * sitting still like a test tone.
 */
export const DRONE_VOICES = Object.freeze([
  Object.freeze({ frequency: 55.0, type: "triangle", gain: 1.0, detune: 0 }),
  Object.freeze({ frequency: 82.5, type: "square", gain: 0.16, detune: 5 }),
  Object.freeze({ frequency: 110.0, type: "square", gain: 0.1, detune: -7 }),
  Object.freeze({ frequency: 220.0, type: "triangle", gain: 0.07, detune: 9 }),
]);

/** Camera framing for the scene. */
export const CAMERA = Object.freeze({
  POSITION: Object.freeze([0, 1.3, 4.2]),
  TARGET: Object.freeze([0, 0.8, 0]),
  FOV: 38,
  NEAR: 0.1,
  FAR: 60,
  /** How far pointer movement may swing the camera, in radians. */
  MAX_SWING_RAD: 0.12,
  /** Lerp factor per frame for camera easing. 0..1, lower is lazier. */
  EASE: 0.045,
});
