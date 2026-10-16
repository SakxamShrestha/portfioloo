import { vi } from "vitest";

/**
 * Minimal Web Audio stand-in.
 *
 * Records connections so tests can assert the graph was wired correctly --
 * a mis-wired audio graph is silent rather than loud, which makes it one of
 * the easier bugs to ship unnoticed.
 */

function createParam(initialValue) {
  return {
    value: initialValue,
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(function (target) {
      // Mirror the eventual outcome so assertions can read `.value`.
      this.value = target;
    }),
  };
}

function createNode(type, extra = {}) {
  return {
    type,
    connections: [],
    connect: vi.fn(function (destination) {
      this.connections.push(destination);
      return destination;
    }),
    disconnect: vi.fn(),
    ...extra,
  };
}

/**
 * @param {{ state?: string }} [options]
 */
export function createFakeAudioContext(options = {}) {
  const created = { oscillators: [], gains: [], filters: [], analysers: [] };

  const context = {
    state: options.state ?? "running",
    currentTime: 0,
    destination: createNode("destination"),
    resume: vi.fn(async function () {
      this.state = "running";
    }),
    close: vi.fn(async () => {}),

    createGain: vi.fn(() => {
      const node = createNode("gain", { gain: createParam(1) });
      created.gains.push(node);
      return node;
    }),

    createOscillator: vi.fn(() => {
      const node = createNode("oscillator", {
        frequency: createParam(0),
        detune: createParam(0),
        start: vi.fn(),
        stop: vi.fn(),
      });
      created.oscillators.push(node);
      return node;
    }),

    createBiquadFilter: vi.fn(() => {
      const node = createNode("biquad", { frequency: createParam(0) });
      created.filters.push(node);
      return node;
    }),

    createAnalyser: vi.fn(() => {
      const node = createNode("analyser", {
        fftSize: 2048,
        frequencyBinCount: 128,
        smoothingTimeConstant: 0,
        // Default to a mid-scale reading so level maths is observable.
        getByteFrequencyData: vi.fn((buffer) => buffer.fill(128)),
      });
      created.analysers.push(node);
      return node;
    }),
  };

  return { context, created };
}
