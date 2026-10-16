import { describe, expect, test } from "vitest";

import {
  MANIFEST_VERSION,
  ManifestError,
  parseManifest,
  resolveAssetUrl,
} from "../manifest";

/** A minimal manifest that passes validation, used as the base for each case. */
function validManifest(overrides = {}) {
  return {
    version: MANIFEST_VERSION,
    name: "study",
    geometry: { url: "geo/study.glb" },
    textures: {
      albedo: "tex/study_albedo.jpg",
      irradiance: [{ key: "day", url: "tex/study_irr_day.jpg" }],
    },
    meshes: [{ name: "desk", uvChannel: 1 }],
    ...overrides,
  };
}

describe("parseManifest", () => {
  test("accepts a minimal valid manifest and returns a frozen copy", () => {
    // Arrange
    const raw = validManifest();

    // Act
    const manifest = parseManifest(raw);

    // Assert
    expect(manifest.name).toBe("study");
    expect(Object.isFrozen(manifest)).toBe(true);
  });

  test("returns a copy so later mutation of the input cannot affect it", () => {
    const raw = validManifest();
    const manifest = parseManifest(raw);

    raw.name = "mutated";

    expect(manifest.name).toBe("study");
  });

  test("rejects a non-object manifest", () => {
    expect(() => parseManifest("not json")).toThrow(ManifestError);
  });

  test("rejects a version this runtime does not understand", () => {
    expect(() => parseManifest(validManifest({ version: 99 }))).toThrow(
      /expected 1, received 99/,
    );
  });

  test("rejects an absolute texture path", () => {
    // An absolute path would escape the scene's own directory.
    const raw = validManifest({
      textures: {
        albedo: "/etc/passwd",
        irradiance: [{ key: "day", url: "tex/irr.jpg" }],
      },
    });

    expect(() => parseManifest(raw)).toThrow(/textures.albedo/);
  });

  test("rejects a parent-directory escape in a texture path", () => {
    const raw = validManifest({
      textures: {
        albedo: "../../secrets.jpg",
        irradiance: [{ key: "day", url: "tex/irr.jpg" }],
      },
    });

    expect(() => parseManifest(raw)).toThrow(/textures.albedo/);
  });

  test("rejects a cross-origin texture URL", () => {
    const raw = validManifest({
      textures: {
        albedo: "https://evil.example/pixel.jpg",
        irradiance: [{ key: "day", url: "tex/irr.jpg" }],
      },
    });

    expect(() => parseManifest(raw)).toThrow(/textures.albedo/);
  });

  test("rejects an empty irradiance array", () => {
    const raw = validManifest({
      textures: { albedo: "tex/a.jpg", irradiance: [] },
    });

    expect(() => parseManifest(raw)).toThrow(/non-empty array/);
  });

  test("rejects duplicate irradiance keys", () => {
    const raw = validManifest({
      textures: {
        albedo: "tex/a.jpg",
        irradiance: [
          { key: "day", url: "tex/day.jpg" },
          { key: "day", url: "tex/dusk.jpg" },
        ],
      },
    });

    expect(() => parseManifest(raw)).toThrow(/duplicate key "day"/);
  });

  test("rejects a mesh with a non-integer uv channel", () => {
    const raw = validManifest({ meshes: [{ name: "desk", uvChannel: 1.5 }] });

    expect(() => parseManifest(raw)).toThrow(/uvChannel/);
  });

  test("rejects a negative irradiance intensity", () => {
    const raw = validManifest({
      meshes: [{ name: "desk", uvChannel: 1, irradianceIntensity: -1 }],
    });

    expect(() => parseManifest(raw)).toThrow(/irradianceIntensity/);
  });

  test("accepts hotspots pointing at internal routes", () => {
    const raw = validManifest({
      hotspots: [
        { id: "projects", label: "Projects", position: [0, 1, 0], href: "/projects" },
      ],
    });

    expect(parseManifest(raw).hotspots).toHaveLength(1);
  });

  test("rejects a hotspot pointing at an external URL", () => {
    // An external href here would be an open redirect driven by the manifest.
    const raw = validManifest({
      hotspots: [
        {
          id: "x",
          label: "X",
          position: [0, 1, 0],
          href: "https://evil.example",
        },
      ],
    });

    expect(() => parseManifest(raw)).toThrow(/internal path/);
  });

  test("rejects duplicate hotspot ids", () => {
    const raw = validManifest({
      hotspots: [
        { id: "a", label: "A", position: [0, 0, 0], href: "/a" },
        { id: "a", label: "B", position: [1, 0, 0], href: "/b" },
      ],
    });

    expect(() => parseManifest(raw)).toThrow(/duplicate id "a"/);
  });

  test("rejects a malformed hotspot position", () => {
    const raw = validManifest({
      hotspots: [{ id: "a", label: "A", position: [0, 0], href: "/a" }],
    });

    expect(() => parseManifest(raw)).toThrow(/position/);
  });

  test("rejects an out-of-range camera field of view", () => {
    const raw = validManifest({
      camera: { position: [0, 1, 4], target: [0, 1, 0], fov: 0 },
    });

    expect(() => parseManifest(raw)).toThrow(/camera.fov/);
  });

  test("reports every problem in a single pass", () => {
    const raw = {
      version: 2,
      name: "",
      geometry: {},
      textures: { albedo: "/abs.jpg", irradiance: [] },
      meshes: "nope",
    };

    try {
      parseManifest(raw);
      expect.unreachable("parseManifest should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ManifestError);
      expect(error.problems.length).toBeGreaterThan(4);
    }
  });
});

describe("resolveAssetUrl", () => {
  test("joins a base directory and a relative asset path", () => {
    expect(resolveAssetUrl("/scene/study/", "tex/a.jpg")).toBe(
      "/scene/study/tex/a.jpg",
    );
  });

  test("tolerates a base directory without a trailing slash", () => {
    expect(resolveAssetUrl("/scene/study", "tex/a.jpg")).toBe(
      "/scene/study/tex/a.jpg",
    );
  });

  test("throws on an unsafe asset path", () => {
    expect(() => resolveAssetUrl("/scene/study/", "../../etc/passwd")).toThrow(
      TypeError,
    );
  });

  test("throws when the base URL is missing", () => {
    expect(() => resolveAssetUrl("", "tex/a.jpg")).toThrow(TypeError);
  });
});
