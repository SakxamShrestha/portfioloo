import { afterEach, describe, expect, test, vi } from "vitest";

import {
  computeLevel,
  readStoredPreference,
  writeStoredPreference,
} from "../audioEngine";
import { AUDIO } from "../constants";

/** Install a minimal localStorage on globalThis.window for one test. */
function stubStorage(store = new Map()) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
    },
  });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("computeLevel", () => {
  test("returns zero for silence", () => {
    expect(computeLevel(new Uint8Array(8))).toBe(0);
  });

  test("returns one for a full-scale signal", () => {
    expect(computeLevel(new Uint8Array(8).fill(255))).toBeCloseTo(1);
  });

  test("returns the root mean square, not the peak", () => {
    // Arrange: half the bins silent, half full scale.
    const bins = new Uint8Array([0, 0, 255, 255]);

    // Act
    const level = computeLevel(bins);

    // Assert: RMS of that set is sqrt(0.5), well below the 1.0 peak.
    expect(level).toBeCloseTo(Math.SQRT1_2);
  });

  test("returns zero for an empty buffer", () => {
    expect(computeLevel(new Uint8Array(0))).toBe(0);
  });

  test("returns zero when the buffer is absent", () => {
    expect(computeLevel(null)).toBe(0);
  });
});

describe("readStoredPreference", () => {
  test("defaults to off when nothing is stored", () => {
    // Sound must never begin on its own.
    stubStorage();

    expect(readStoredPreference()).toBe(false);
  });

  test("reads a previously enabled preference", () => {
    stubStorage(new Map([[AUDIO.STORAGE_KEY, "true"]]));

    expect(readStoredPreference()).toBe(true);
  });

  test("treats any non-true value as off", () => {
    stubStorage(new Map([[AUDIO.STORAGE_KEY, "yes"]]));

    expect(readStoredPreference()).toBe(false);
  });

  test("defaults to off when storage throws", () => {
    // Private mode and blocked site data both throw on access.
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("SecurityError");
        },
      },
    });

    expect(readStoredPreference()).toBe(false);
  });
});

describe("writeStoredPreference", () => {
  test("persists the enabled state as a string", () => {
    const store = stubStorage();

    writeStoredPreference(true);

    expect(store.get(AUDIO.STORAGE_KEY)).toBe("true");
  });

  test("swallows a storage failure rather than interrupting playback", () => {
    vi.stubGlobal("window", {
      localStorage: {
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });

    expect(() => writeStoredPreference(true)).not.toThrow();
  });
});
