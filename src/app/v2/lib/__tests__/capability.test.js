import { describe, expect, test } from "vitest";

import { FLAT_REASON, clampPixelRatio, selectTier } from "../capability";
import { TIER } from "../constants";

/** A snapshot that passes every gate, used as the base for each case. */
function capableEnvironment(overrides = {}) {
  return {
    hasWebgl2: true,
    prefersReducedMotion: false,
    prefersSaveData: false,
    viewportWidth: 1440,
    deviceMemoryGb: 8,
    logicalCores: 8,
    ...overrides,
  };
}

describe("selectTier", () => {
  test("returns the full tier when every capability check passes", () => {
    // Arrange
    const environment = capableEnvironment();

    // Act
    const decision = selectTier(environment);

    // Assert
    expect(decision.tier).toBe(TIER.FULL);
    expect(decision.reasons).toEqual([]);
  });

  test("routes to flat when WebGL2 is unavailable", () => {
    const decision = selectTier(capableEnvironment({ hasWebgl2: false }));

    expect(decision.tier).toBe(TIER.FLAT);
    expect(decision.reasons).toContain(FLAT_REASON.NO_WEBGL2);
  });

  test("routes to flat when the visitor prefers reduced motion", () => {
    const decision = selectTier(
      capableEnvironment({ prefersReducedMotion: true }),
    );

    expect(decision.tier).toBe(TIER.FLAT);
    expect(decision.reasons).toContain(FLAT_REASON.REDUCED_MOTION);
  });

  test("routes to flat when the connection is in data-saver mode", () => {
    const decision = selectTier(capableEnvironment({ prefersSaveData: true }));

    expect(decision.reasons).toContain(FLAT_REASON.SAVE_DATA);
  });

  test("routes to flat on a phone-width viewport", () => {
    const decision = selectTier(capableEnvironment({ viewportWidth: 390 }));

    expect(decision.tier).toBe(TIER.FLAT);
    expect(decision.reasons).toContain(FLAT_REASON.SMALL_VIEWPORT);
  });

  test("routes to flat when the device reports low memory", () => {
    const decision = selectTier(capableEnvironment({ deviceMemoryGb: 2 }));

    expect(decision.reasons).toContain(FLAT_REASON.LOW_MEMORY);
  });

  test("routes to flat when the device reports few cores", () => {
    const decision = selectTier(capableEnvironment({ logicalCores: 2 }));

    expect(decision.reasons).toContain(FLAT_REASON.FEW_CORES);
  });

  test("treats unreported memory and core count as capable", () => {
    // Privacy-hardened browsers withhold these. They must not be penalised.
    const decision = selectTier(
      capableEnvironment({ deviceMemoryGb: null, logicalCores: null }),
    );

    expect(decision.tier).toBe(TIER.FULL);
  });

  test("collects every failing reason rather than stopping at the first", () => {
    const decision = selectTier(
      capableEnvironment({
        hasWebgl2: false,
        viewportWidth: 320,
        logicalCores: 1,
      }),
    );

    expect(decision.reasons).toHaveLength(3);
  });

  test("throws when given no snapshot", () => {
    expect(() => selectTier(null)).toThrow(TypeError);
  });
});

describe("clampPixelRatio", () => {
  test("caps a 3x display at the configured maximum", () => {
    expect(clampPixelRatio(3, 2)).toBe(2);
  });

  test("leaves a ratio below the maximum untouched", () => {
    expect(clampPixelRatio(1.5, 2)).toBe(1.5);
  });

  test("falls back to 1 for a nonsensical ratio", () => {
    expect(clampPixelRatio(0, 2)).toBe(1);
    expect(clampPixelRatio(Number.NaN, 2)).toBe(1);
    expect(clampPixelRatio(-2, 2)).toBe(1);
  });
});
