import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { configureBakedTexture, createBakedMaterial } from "./bakedMaterial";
import { parseManifest, resolveAssetUrl } from "./manifest";

/**
 * Scene loader: manifest in, ready-to-render group out.
 *
 * Load order is deliberate. The manifest is fetched and fully validated first,
 * so a bad export fails in a few hundred bytes rather than after pulling
 * several megabytes of atlases.
 */

/** Google's hosted Draco decoder, used only if the .glb is Draco-compressed. */
const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(
      url,
      (texture) => resolve(configureBakedTexture(texture)),
      undefined,
      () => reject(new Error(`Failed to load texture: ${url}`)),
    );
  });
}

function loadGltf(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_DECODER_PATH);
    loader.setDRACOLoader(draco);

    loader.load(
      url,
      (gltf) => {
        draco.dispose();
        resolve(gltf);
      },
      undefined,
      () => {
        draco.dispose();
        reject(new Error(`Failed to load geometry: ${url}`));
      },
    );
  });
}

/**
 * Fetch and validate a scene manifest.
 *
 * @param {string} baseUrl directory containing scene.json
 * @param {AbortSignal} [signal]
 * @returns {Promise<Readonly<object>>}
 */
export async function fetchManifest(baseUrl, signal) {
  const manifestUrl = resolveAssetUrl(baseUrl, "scene.json");
  const response = await fetch(manifestUrl, { signal });

  if (!response.ok) {
    throw new Error(
      `Scene manifest request failed: ${response.status} ${response.statusText}`,
    );
  }

  return parseManifest(await response.json());
}

/**
 * @typedef {object} LoadedScene
 * @property {import("three").Group} root        the scene graph to add
 * @property {Readonly<object>} manifest         the validated manifest
 * @property {Map<string, import("three").Texture>} irradianceByKey
 * @property {readonly import("three").ShaderMaterial[]} materials
 * @property {() => void} dispose                releases every GPU resource
 */

/**
 * Load a baked scene described by a manifest.
 *
 * @param {string} baseUrl directory containing scene.json and its assets
 * @param {AbortSignal} [signal]
 * @returns {Promise<LoadedScene>}
 */
export async function loadScene(baseUrl, signal) {
  const manifest = await fetchManifest(baseUrl, signal);

  const [gltf, albedo, ...irradianceTextures] = await Promise.all([
    loadGltf(resolveAssetUrl(baseUrl, manifest.geometry.url)),
    loadTexture(resolveAssetUrl(baseUrl, manifest.textures.albedo)),
    ...manifest.textures.irradiance.map((entry) =>
      loadTexture(resolveAssetUrl(baseUrl, entry.url)),
    ),
  ]);

  const irradianceByKey = new Map(
    manifest.textures.irradiance.map((entry, index) => [
      entry.key,
      irradianceTextures[index],
    ]),
  );

  const primaryIrradiance = irradianceTextures[0];
  const secondaryIrradiance = irradianceTextures[1] ?? irradianceTextures[0];

  const root = gltf.scene;
  const materials = [];
  const missingMeshes = [];

  manifest.meshes.forEach((meshSpec) => {
    const target = root.getObjectByName(meshSpec.name);

    if (!target?.isMesh) {
      missingMeshes.push(meshSpec.name);
      return;
    }

    const material = createBakedMaterial({
      albedo,
      irradianceA: primaryIrradiance,
      irradianceB: secondaryIrradiance,
      intensity: meshSpec.irradianceIntensity ?? 1,
      transparent: meshSpec.transparent === true,
    });

    // The baked material reads UV1 by a fixed attribute name. Blender's
    // exporter may call the second channel something else, so alias it.
    const geometry = target.geometry;
    if (!geometry.hasAttribute("uv1")) {
      const channelName = `uv${meshSpec.uvChannel}`;
      if (geometry.hasAttribute(channelName)) {
        geometry.setAttribute("uv1", geometry.getAttribute(channelName));
      } else {
        missingMeshes.push(`${meshSpec.name} (no ${channelName} attribute)`);
        return;
      }
    }

    target.material = material;
    materials.push(material);
  });

  if (missingMeshes.length > 0) {
    // Not fatal -- the rest of the scene is still renderable -- but this is
    // always an export mistake and must be visible in the console.
    console.warn(
      `[v2] manifest references meshes missing from the .glb: ${missingMeshes.join(", ")}`,
    );
  }

  function dispose() {
    materials.forEach((material) => material.dispose());
    albedo.dispose();
    irradianceTextures.forEach((texture) => texture.dispose());
    root.traverse((object) => {
      if (object.isMesh) object.geometry.dispose();
    });
  }

  return Object.freeze({
    root,
    manifest,
    irradianceByKey,
    materials: Object.freeze(materials),
    dispose,
  });
}
