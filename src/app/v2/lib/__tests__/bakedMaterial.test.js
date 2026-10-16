import { describe, expect, test } from "vitest";
import { SRGBColorSpace, Texture } from "three";

import {
  configureBakedTexture,
  createBakedMaterial,
  stepBlend,
} from "../bakedMaterial";

describe("configureBakedTexture", () => {
  test("flags the texture as sRGB-encoded", () => {
    // Baked atlases are authored in sRGB; mislabelling them washes the scene out.
    const texture = configureBakedTexture(new Texture());

    expect(texture.colorSpace).toBe(SRGBColorSpace);
  });

  test("disables flipY to match glTF UV orientation", () => {
    const texture = configureBakedTexture(new Texture());

    expect(texture.flipY).toBe(false);
  });

  test("throws when given no texture", () => {
    expect(() => configureBakedTexture(null)).toThrow(TypeError);
  });
});

describe("createBakedMaterial", () => {
  test("binds the supplied atlases to shader uniforms", () => {
    // Arrange
    const albedo = new Texture();
    const irradianceA = new Texture();
    const irradianceB = new Texture();

    // Act
    const material = createBakedMaterial({ albedo, irradianceA, irradianceB });

    // Assert
    expect(material.uniforms.uAlbedo.value).toBe(albedo);
    expect(material.uniforms.uIrradianceA.value).toBe(irradianceA);
    expect(material.uniforms.uIrradianceB.value).toBe(irradianceB);
  });

  test("falls back to the primary atlas when no second one is given", () => {
    const irradianceA = new Texture();
    const material = createBakedMaterial({ albedo: new Texture(), irradianceA });

    expect(material.uniforms.uIrradianceB.value).toBe(irradianceA);
  });

  test("starts fully on the primary atlas", () => {
    const material = createBakedMaterial({
      albedo: new Texture(),
      irradianceA: new Texture(),
    });

    expect(material.uniforms.uBlend.value).toBe(0);
  });

  test("applies the requested irradiance intensity", () => {
    const material = createBakedMaterial({
      albedo: new Texture(),
      irradianceA: new Texture(),
      intensity: 1.4,
    });

    expect(material.uniforms.uIntensity.value).toBeCloseTo(1.4);
  });

  test("declares the uv1 attribute the baked shader reads", () => {
    const material = createBakedMaterial({
      albedo: new Texture(),
      irradianceA: new Texture(),
    });

    expect(material.vertexShader).toContain("attribute vec2 uv1");
  });

  test("throws when the albedo atlas is missing", () => {
    expect(() =>
      createBakedMaterial({ irradianceA: new Texture() }),
    ).toThrow(/albedo/);
  });

  test("throws when the irradiance atlas is missing", () => {
    expect(() => createBakedMaterial({ albedo: new Texture() })).toThrow(
      /irradianceA/,
    );
  });

  test("rejects a negative intensity", () => {
    expect(() =>
      createBakedMaterial({
        albedo: new Texture(),
        irradianceA: new Texture(),
        intensity: -1,
      }),
    ).toThrow(RangeError);
  });
});

describe("stepBlend", () => {
  test("advances toward the target by one frame's worth of progress", () => {
    // Arrange: a 2s crossfade, one 16ms frame.
    // Act
    const next = stepBlend(0, 1, 0.016, 2);

    // Assert
    expect(next).toBeCloseTo(0.008);
  });

  test("snaps to the target once it is within a single step", () => {
    expect(stepBlend(0.999, 1, 0.016, 2)).toBe(1);
  });

  test("steps downward when the target is below the current value", () => {
    expect(stepBlend(1, 0, 0.016, 2)).toBeCloseTo(0.992);
  });

  test("reaches the target at the same time regardless of framerate", () => {
    // 60Hz for 1s versus 144Hz for 1s must land in the same place.
    const sixtyHertz = Array.from({ length: 60 }).reduce(
      (blend) => stepBlend(blend, 1, 1 / 60, 2),
      0,
    );
    const highRefresh = Array.from({ length: 144 }).reduce(
      (blend) => stepBlend(blend, 1, 1 / 144, 2),
      0,
    );

    expect(sixtyHertz).toBeCloseTo(highRefresh, 5);
  });

  test("jumps straight to the target for a zero duration", () => {
    expect(stepBlend(0, 1, 0.016, 0)).toBe(1);
  });

  test("never returns a value outside 0..1", () => {
    expect(stepBlend(0.5, 1, 10, 2)).toBe(1);
    expect(stepBlend(0.5, 0, 10, 2)).toBe(0);
  });
});
