import {
  Color,
  NoBlending,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
} from "three";

/**
 * Baked-lighting material.
 *
 * There are no runtime lights in this scene. Surface colour comes from an
 * albedo atlas (UV0) multiplied by an irradiance atlas baked in Blender (UV1).
 * That is the whole lighting model, and it is why the scene costs almost
 * nothing per frame.
 *
 * Two irradiance atlases can be supplied and crossfaded, which is how a
 * lighting state change (a lamp switching on, dusk falling) happens without
 * re-baking or shipping a second scene.
 */

const VERTEX_SHADER = /* glsl */ `
  // UV0 addresses the albedo atlas; UV1 addresses the baked irradiance atlas.
  // Blender must export both channels -- see the export contract.
  attribute vec2 uv1;

  uniform vec2 uAlbedoScale;

  varying vec2 vAlbedoUv;
  varying vec2 vIrradianceUv;

  void main() {
    vAlbedoUv = uv * uAlbedoScale;
    vIrradianceUv = uv1;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uAlbedo;
  uniform sampler2D uIrradianceA;
  uniform sampler2D uIrradianceB;
  uniform float uBlend;
  uniform float uIntensity;
  uniform vec3 uTint;

  varying vec2 vAlbedoUv;
  varying vec2 vIrradianceUv;

  void main() {
    // Both textures are flagged SRGBColorSpace, so these samples arrive linear.
    vec4 albedo = texture2D(uAlbedo, vAlbedoUv);

    vec3 irradianceA = texture2D(uIrradianceA, vIrradianceUv).rgb;
    vec3 irradianceB = texture2D(uIrradianceB, vIrradianceUv).rgb;
    vec3 irradiance = mix(irradianceA, irradianceB, clamp(uBlend, 0.0, 1.0));

    vec3 lit = albedo.rgb * irradiance * uIntensity * uTint;

    gl_FragColor = vec4(lit, albedo.a);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Tag a loaded texture as sRGB-encoded and non-repeating.
 *
 * Baked atlases are authored in sRGB and addressed by unique, non-tiling UVs,
 * so wrapping would only ever be a bug.
 *
 * @param {import("three").Texture} texture
 * @returns {import("three").Texture} the same texture, configured
 */
export function configureBakedTexture(texture) {
  if (!texture) {
    throw new TypeError("configureBakedTexture() requires a texture");
  }
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/**
 * @typedef {object} BakedMaterialOptions
 * @property {import("three").Texture} albedo
 * @property {import("three").Texture} irradianceA
 * @property {import("three").Texture} [irradianceB] defaults to irradianceA
 * @property {number} [intensity] multiplier on the baked lighting, default 1
 * @property {boolean} [transparent] default false
 */

/**
 * Build a baked material.
 *
 * @param {BakedMaterialOptions} options
 * @returns {ShaderMaterial}
 */
export function createBakedMaterial(options) {
  const { albedo, irradianceA, irradianceB, intensity = 1, transparent = false } =
    options ?? {};

  if (!albedo) throw new TypeError("createBakedMaterial() requires an albedo texture");
  if (!irradianceA) {
    throw new TypeError("createBakedMaterial() requires an irradianceA texture");
  }
  if (!(Number.isFinite(intensity) && intensity >= 0)) {
    throw new RangeError("createBakedMaterial(): intensity must be a number >= 0");
  }

  return new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent,
    blending: transparent ? undefined : NoBlending,
    uniforms: {
      uAlbedo: { value: albedo },
      uIrradianceA: { value: irradianceA },
      uIrradianceB: { value: irradianceB ?? irradianceA },
      uBlend: { value: 0 },
      uIntensity: { value: intensity },
      uTint: { value: new Color(1, 1, 1) },
      uAlbedoScale: { value: new Vector2(1, 1) },
    },
  });
}

/**
 * Return a new crossfade value stepped toward a target.
 *
 * Framerate-independent so a 144Hz machine and a 60Hz machine reach the target
 * at the same wall-clock moment. Does not mutate the material.
 *
 * @param {number} current  current blend, 0..1
 * @param {number} target   desired blend, 0..1
 * @param {number} deltaSeconds
 * @param {number} durationSeconds time to traverse the full 0..1 range
 * @returns {number} the next blend value, clamped to 0..1
 */
export function stepBlend(current, target, deltaSeconds, durationSeconds) {
  if (!(durationSeconds > 0)) return target;

  const maximumStep = deltaSeconds / durationSeconds;
  const difference = target - current;

  if (Math.abs(difference) <= maximumStep) return target;

  const next = current + Math.sign(difference) * maximumStep;
  return Math.min(1, Math.max(0, next));
}
