import { AUDIO, DRONE_VOICES } from "./constants";

/**
 * Ambient audio engine.
 *
 * The drone is synthesised, not streamed: a handful of detuned oscillators
 * through a lowpass, which costs no bandwidth and never needs a licence.
 *
 * Browsers refuse to start an AudioContext without a user gesture, so nothing
 * here touches Web Audio until start() is called from a real interaction.
 * Audio nodes are inherently stateful; the controller surface around them is
 * not, and every exported helper below is pure.
 */

/**
 * Read the persisted audio preference.
 *
 * Defaults to off. Sound that begins on its own is hostile, and autoplay
 * policy would block it anyway.
 *
 * @returns {boolean}
 */
export function readStoredPreference() {
  try {
    return window.localStorage.getItem(AUDIO.STORAGE_KEY) === "true";
  } catch {
    // Private mode, blocked storage, or an embedded context. Default to silence.
    return false;
  }
}

/**
 * Persist the audio preference. Never throws: a failed write is not worth
 * interrupting playback over.
 *
 * @param {boolean} enabled
 */
export function writeStoredPreference(enabled) {
  try {
    window.localStorage.setItem(AUDIO.STORAGE_KEY, String(enabled));
  } catch {
    /* Preference will simply not survive this reload. */
  }
}

/**
 * Reduce a frequency-domain byte array to a single 0..1 level.
 *
 * Root-mean-square rather than peak, so the meter reads as loudness rather
 * than twitching on every transient.
 *
 * @param {Uint8Array} frequencyData values 0..255
 * @returns {number} level in 0..1
 */
export function computeLevel(frequencyData) {
  if (!frequencyData || frequencyData.length === 0) return 0;

  let sumOfSquares = 0;
  for (let index = 0; index < frequencyData.length; index += 1) {
    const normalized = frequencyData[index] / 255;
    sumOfSquares += normalized * normalized;
  }

  return Math.sqrt(sumOfSquares / frequencyData.length);
}

/**
 * Build the node graph. Called once, lazily, on first enable.
 *
 * @param {AudioContext} context
 * @returns {{ master: GainNode, analyser: AnalyserNode, voices: readonly OscillatorNode[] }}
 */
function buildGraph(context) {
  const master = context.createGain();
  master.gain.value = 0;

  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = AUDIO.LOWPASS_HZ;

  const analyser = context.createAnalyser();
  analyser.fftSize = AUDIO.FFT_SIZE;
  analyser.smoothingTimeConstant = 0.85;

  lowpass.connect(master);
  master.connect(analyser);
  analyser.connect(context.destination);

  const voices = DRONE_VOICES.map((voice) => {
    const oscillator = context.createOscillator();
    oscillator.type = voice.type;
    oscillator.frequency.value = voice.frequency;
    oscillator.detune.value = voice.detune;

    const voiceGain = context.createGain();
    voiceGain.gain.value = voice.gain;

    oscillator.connect(voiceGain);
    voiceGain.connect(lowpass);
    oscillator.start();

    return oscillator;
  });

  return { master, analyser, voices: Object.freeze(voices) };
}

/**
 * @typedef {object} AudioController
 * @property {(enabled: boolean) => Promise<void>} setEnabled
 * @property {() => number} readLevel
 * @property {() => void} dispose
 */

/**
 * Create the audio controller.
 *
 * Nothing is allocated until setEnabled(true) runs inside a user gesture.
 *
 * @returns {AudioController}
 */
export function createAudioEngine() {
  /** @type {AudioContext|null} */
  let context = null;
  /** @type {{ master: GainNode, analyser: AnalyserNode, voices: readonly OscillatorNode[] }|null} */
  let graph = null;
  /** @type {Uint8Array|null} */
  let frequencyBuffer = null;
  let disposed = false;

  function rampMasterTo(targetGain) {
    if (!context || !graph) return;
    const now = context.currentTime;
    // cancelScheduledValues + setValueAtTime anchors the ramp to the current
    // value; without the anchor a fast double-toggle produces a click.
    graph.master.gain.cancelScheduledValues(now);
    graph.master.gain.setValueAtTime(graph.master.gain.value, now);
    graph.master.gain.linearRampToValueAtTime(
      targetGain,
      now + AUDIO.RAMP_SECONDS,
    );
  }

  async function setEnabled(enabled) {
    if (disposed) return;

    if (!enabled) {
      rampMasterTo(0);
      // The context is left running: suspending it mid-ramp cuts the fade and
      // clicks. It is near-free once the master gain reaches zero.
      return;
    }

    try {
      if (!context) {
        const AudioContextConstructor =
          window.AudioContext ?? window.webkitAudioContext;
        if (!AudioContextConstructor) {
          throw new Error("Web Audio is unavailable in this browser");
        }
        context = new AudioContextConstructor();
        graph = buildGraph(context);
        frequencyBuffer = new Uint8Array(graph.analyser.frequencyBinCount);
      }

      // Safari starts contexts suspended even inside a gesture.
      if (context.state === "suspended") await context.resume();

      rampMasterTo(AUDIO.MASTER_GAIN);
    } catch (error) {
      // Audio is an enhancement. Report it, keep the scene running silently.
      console.warn("[v2] audio could not start:", error);
      throw error;
    }
  }

  function readLevel() {
    if (!graph || !frequencyBuffer) return 0;
    graph.analyser.getByteFrequencyData(frequencyBuffer);
    return computeLevel(frequencyBuffer);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;

    graph?.voices.forEach((oscillator) => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {
        /* Already stopped by a context teardown. */
      }
    });

    context?.close().catch(() => {
      /* Context already closed. */
    });

    context = null;
    graph = null;
    frequencyBuffer = null;
  }

  return Object.freeze({ setEnabled, readLevel, dispose });
}
