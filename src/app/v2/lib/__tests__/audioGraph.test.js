import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createAudioEngine } from "../audioEngine";
import { AUDIO, DRONE_VOICES } from "../constants";
import { createFakeAudioContext } from "./fakeAudioContext";

/**
 * Graph-level tests for the audio engine, against a recording stub.
 *
 * These cover the parts that only run inside a browser: lazy construction,
 * gain ramping, Safari's suspended-context quirk, and teardown.
 */

let fake;

function installAudioContext(options = {}) {
  fake = createFakeAudioContext(options);
  // A regular function, not an arrow: the engine calls it with `new`.
  vi.stubGlobal("window", {
    AudioContext: vi.fn(function () {
      return fake.context;
    }),
    localStorage: { getItem: () => null, setItem: () => {} },
  });
  return fake;
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createAudioEngine", () => {
  test("allocates nothing until audio is first enabled", () => {
    // Autoplay policy means construction must not touch Web Audio.
    installAudioContext();

    createAudioEngine();

    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  test("builds one oscillator per configured drone voice", async () => {
    // Arrange
    installAudioContext();
    const engine = createAudioEngine();

    // Act
    await engine.setEnabled(true);

    // Assert
    expect(fake.created.oscillators).toHaveLength(DRONE_VOICES.length);
  });

  test("starts every oscillator", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    fake.created.oscillators.forEach((oscillator) => {
      expect(oscillator.start).toHaveBeenCalled();
    });
  });

  test("configures each voice from the constants table", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    fake.created.oscillators.forEach((oscillator, index) => {
      expect(oscillator.frequency.value).toBe(DRONE_VOICES[index].frequency);
      expect(oscillator.detune.value).toBe(DRONE_VOICES[index].detune);
      expect(oscillator.type).toBe(DRONE_VOICES[index].type);
    });
  });

  test("routes the drone through a lowpass before the master gain", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    const [lowpass] = fake.created.filters;
    expect(lowpass.type).toBe("lowpass");
    expect(lowpass.frequency.value).toBe(AUDIO.LOWPASS_HZ);
    expect(lowpass.connections).toContain(fake.created.gains[0]);
  });

  test("terminates the graph at the destination via the analyser", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    const [analyser] = fake.created.analysers;
    expect(analyser.connections).toContain(fake.context.destination);
  });

  test("ramps the master gain up rather than stepping it", async () => {
    // A step produces an audible click.
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    const master = fake.created.gains[0];
    expect(master.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      AUDIO.MASTER_GAIN,
      AUDIO.RAMP_SECONDS,
    );
  });

  test("anchors the ramp to the current value to survive a fast double toggle", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);
    await engine.setEnabled(false);

    const master = fake.created.gains[0];
    expect(master.gain.cancelScheduledValues).toHaveBeenCalled();
    expect(master.gain.setValueAtTime).toHaveBeenCalled();
  });

  test("ramps to silence when disabled", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);
    await engine.setEnabled(false);

    expect(fake.created.gains[0].gain.value).toBe(0);
  });

  test("does not construct a context when disabled before ever being enabled", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(false);

    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  test("resumes a context that starts suspended", async () => {
    // Safari hands back a suspended context even inside a user gesture.
    installAudioContext({ state: "suspended" });
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    expect(fake.context.resume).toHaveBeenCalled();
  });

  test("reuses the context across repeated enables", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);
    await engine.setEnabled(false);
    await engine.setEnabled(true);

    expect(window.AudioContext).toHaveBeenCalledTimes(1);
    expect(fake.created.oscillators).toHaveLength(DRONE_VOICES.length);
  });

  test("throws and warns when Web Audio is unavailable", async () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
    const engine = createAudioEngine();

    await expect(engine.setEnabled(true)).rejects.toThrow(/Web Audio/);
    expect(console.warn).toHaveBeenCalled();
  });

  test("reports zero level before the graph exists", () => {
    installAudioContext();
    const engine = createAudioEngine();

    expect(engine.readLevel()).toBe(0);
  });

  test("reports a level from the analyser once running", async () => {
    installAudioContext();
    const engine = createAudioEngine();

    await engine.setEnabled(true);

    // The stub fills every bin with 128 of 255.
    expect(engine.readLevel()).toBeCloseTo(128 / 255, 2);
  });

  test("stops and disconnects every oscillator on dispose", async () => {
    installAudioContext();
    const engine = createAudioEngine();
    await engine.setEnabled(true);

    engine.dispose();

    fake.created.oscillators.forEach((oscillator) => {
      expect(oscillator.stop).toHaveBeenCalled();
      expect(oscillator.disconnect).toHaveBeenCalled();
    });
  });

  test("closes the context on dispose", async () => {
    installAudioContext();
    const engine = createAudioEngine();
    await engine.setEnabled(true);

    engine.dispose();

    expect(fake.context.close).toHaveBeenCalled();
  });

  test("ignores a second dispose", async () => {
    installAudioContext();
    const engine = createAudioEngine();
    await engine.setEnabled(true);

    engine.dispose();
    engine.dispose();

    expect(fake.context.close).toHaveBeenCalledTimes(1);
  });

  test("ignores enable attempts after dispose", async () => {
    installAudioContext();
    const engine = createAudioEngine();
    engine.dispose();

    await engine.setEnabled(true);

    expect(window.AudioContext).not.toHaveBeenCalled();
  });

  test("survives an oscillator that throws on stop", async () => {
    installAudioContext();
    const engine = createAudioEngine();
    await engine.setEnabled(true);
    fake.created.oscillators[0].stop.mockImplementation(() => {
      throw new Error("InvalidStateError");
    });

    expect(() => engine.dispose()).not.toThrow();
  });
});
