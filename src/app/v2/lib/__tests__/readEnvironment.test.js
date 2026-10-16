import { afterEach, describe, expect, test, vi } from "vitest";

import { readEnvironment } from "../capability";

/**
 * Tests for the browser probe behind the boot gate.
 *
 * Every branch here decides whether a visitor downloads several megabytes of
 * three.js, so each one is worth pinning down.
 */

/**
 * @param {object} options
 * @param {"ok"|"null"|"throw"} [options.webgl2] how the context request behaves
 */
function installBrowser(options = {}) {
  const {
    webgl2 = "ok",
    reducedMotion = false,
    saveData = undefined,
    innerWidth = 1440,
    // When false, navigator omits these keys entirely -- which is what a
    // privacy-hardened browser actually does. A default parameter cannot
    // express that, since passing undefined would just re-apply the default.
    reportsHardware = true,
  } = options;

  const loseContext = vi.fn();

  vi.stubGlobal("document", {
    createElement: vi.fn(() => ({
      getContext: vi.fn((kind) => {
        if (kind !== "webgl2") return null;
        if (webgl2 === "throw") throw new Error("blocked by privacy settings");
        if (webgl2 === "null") return null;
        return { getExtension: vi.fn(() => ({ loseContext })) };
      }),
    })),
  });

  vi.stubGlobal("window", {
    innerWidth,
    matchMedia: vi.fn(() => ({ matches: reducedMotion })),
  });

  vi.stubGlobal("navigator", {
    connection: saveData === undefined ? null : { saveData },
    ...(reportsHardware ? { deviceMemory: 8, hardwareConcurrency: 8 } : {}),
  });

  return { loseContext };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readEnvironment", () => {
  test("reports a capable desktop browser", () => {
    // Arrange
    installBrowser();

    // Act
    const environment = readEnvironment();

    // Assert
    expect(environment).toMatchObject({
      hasWebgl2: true,
      prefersReducedMotion: false,
      prefersSaveData: false,
      viewportWidth: 1440,
      deviceMemoryGb: 8,
      logicalCores: 8,
    });
  });

  test("returns a frozen snapshot", () => {
    installBrowser();

    expect(Object.isFrozen(readEnvironment())).toBe(true);
  });

  test("releases the probe context instead of leaking it", () => {
    // Browsers cap simultaneous WebGL contexts; the probe must not hold one.
    const { loseContext } = installBrowser();

    readEnvironment();

    expect(loseContext).toHaveBeenCalled();
  });

  test("reports no WebGL2 when the context request returns null", () => {
    installBrowser({ webgl2: "null" });

    expect(readEnvironment().hasWebgl2).toBe(false);
  });

  test("reports no WebGL2 when the context request throws", () => {
    // Privacy-hardened browsers throw rather than returning null.
    installBrowser({ webgl2: "throw" });

    expect(readEnvironment().hasWebgl2).toBe(false);
  });

  test("picks up a reduced-motion preference", () => {
    installBrowser({ reducedMotion: true });

    expect(readEnvironment().prefersReducedMotion).toBe(true);
  });

  test("picks up a data-saver connection", () => {
    installBrowser({ saveData: true });

    expect(readEnvironment().prefersSaveData).toBe(true);
  });

  test("treats a missing connection object as not data-saving", () => {
    installBrowser({ saveData: undefined });

    expect(readEnvironment().prefersSaveData).toBe(false);
  });

  test("reports null for memory and cores the browser withholds", () => {
    installBrowser({ reportsHardware: false });

    const environment = readEnvironment();

    expect(environment.deviceMemoryGb).toBeNull();
    expect(environment.logicalCores).toBeNull();
  });

  test("throws when called outside a browser", () => {
    // Guards against the probe being pulled into a server component.
    vi.stubGlobal("window", undefined);

    expect(() => readEnvironment()).toThrow(/browser environment/);
  });
});
