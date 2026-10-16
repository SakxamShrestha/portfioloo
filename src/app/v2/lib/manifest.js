/**
 * Scene manifest: the contract between Blender and the runtime.
 *
 * Blender bakes geometry, an albedo atlas and one or more irradiance (lighting)
 * atlases, then writes a manifest describing how to reassemble them. The
 * runtime never guesses -- if the manifest does not describe it, it is not
 * rendered.
 *
 * A fetched manifest is untrusted external data, so it is validated in full
 * before a single texture request is made. Validation collects every problem
 * rather than throwing on the first, so a broken export reports all its faults
 * in one pass.
 */

/** Manifest format version this runtime understands. */
export const MANIFEST_VERSION = 1;

/** Error thrown when a manifest fails validation. */
export class ManifestError extends Error {
  /**
   * @param {readonly string[]} problems
   */
  constructor(problems) {
    super(`Invalid scene manifest:\n  - ${problems.join("\n  - ")}`);
    this.name = "ManifestError";
    this.problems = Object.freeze([...problems]);
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isVector3(value) {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((component) => Number.isFinite(component))
  );
}

/**
 * Reject absolute URLs and parent-directory escapes.
 *
 * Every asset path is resolved against the scene's own base directory. A
 * manifest must not be able to point the loader at another origin.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isSafeRelativePath(value) {
  if (!isNonEmptyString(value)) return false;
  if (value.startsWith("/") || value.startsWith("\\")) return false;
  if (value.includes("..")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  return true;
}

function validateTextures(textures, problems) {
  if (!isPlainObject(textures)) {
    problems.push("textures: must be an object");
    return;
  }

  if (!isSafeRelativePath(textures.albedo)) {
    problems.push("textures.albedo: must be a safe relative path");
  }

  if (!Array.isArray(textures.irradiance) || textures.irradiance.length === 0) {
    problems.push("textures.irradiance: must be a non-empty array");
    return;
  }

  const seenKeys = new Set();
  textures.irradiance.forEach((entry, index) => {
    const at = `textures.irradiance[${index}]`;
    if (!isPlainObject(entry)) {
      problems.push(`${at}: must be an object`);
      return;
    }
    if (!isNonEmptyString(entry.key)) {
      problems.push(`${at}.key: must be a non-empty string`);
    } else if (seenKeys.has(entry.key)) {
      problems.push(`${at}.key: duplicate key "${entry.key}"`);
    } else {
      seenKeys.add(entry.key);
    }
    if (!isSafeRelativePath(entry.url)) {
      problems.push(`${at}.url: must be a safe relative path`);
    }
  });
}

function validateMeshes(meshes, problems) {
  if (!Array.isArray(meshes)) {
    problems.push("meshes: must be an array");
    return;
  }
  meshes.forEach((mesh, index) => {
    const at = `meshes[${index}]`;
    if (!isPlainObject(mesh)) {
      problems.push(`${at}: must be an object`);
      return;
    }
    if (!isNonEmptyString(mesh.name)) {
      problems.push(`${at}.name: must match the object name in the .glb`);
    }
    if (!Number.isInteger(mesh.uvChannel) || mesh.uvChannel < 0) {
      problems.push(`${at}.uvChannel: must be a non-negative integer`);
    }
    if (
      mesh.irradianceIntensity !== undefined &&
      !(Number.isFinite(mesh.irradianceIntensity) && mesh.irradianceIntensity >= 0)
    ) {
      problems.push(`${at}.irradianceIntensity: must be a number >= 0`);
    }
  });
}

function validateHotspots(hotspots, problems) {
  if (hotspots === undefined) return;
  if (!Array.isArray(hotspots)) {
    problems.push("hotspots: must be an array when present");
    return;
  }

  const seenIds = new Set();
  hotspots.forEach((hotspot, index) => {
    const at = `hotspots[${index}]`;
    if (!isPlainObject(hotspot)) {
      problems.push(`${at}: must be an object`);
      return;
    }
    if (!isNonEmptyString(hotspot.id)) {
      problems.push(`${at}.id: must be a non-empty string`);
    } else if (seenIds.has(hotspot.id)) {
      problems.push(`${at}.id: duplicate id "${hotspot.id}"`);
    } else {
      seenIds.add(hotspot.id);
    }
    if (!isNonEmptyString(hotspot.label)) {
      problems.push(`${at}.label: must be a non-empty string`);
    }
    if (!isVector3(hotspot.position)) {
      problems.push(`${at}.position: must be [x, y, z] of finite numbers`);
    }
    // Internal routes only. An external href here would be an open redirect
    // controlled by whatever produced the manifest.
    if (!isNonEmptyString(hotspot.href) || !hotspot.href.startsWith("/")) {
      problems.push(`${at}.href: must be an internal path starting with "/"`);
    }
  });
}

function validateCamera(camera, problems) {
  if (camera === undefined) return;
  if (!isPlainObject(camera)) {
    problems.push("camera: must be an object when present");
    return;
  }
  if (!isVector3(camera.position)) {
    problems.push("camera.position: must be [x, y, z] of finite numbers");
  }
  if (!isVector3(camera.target)) {
    problems.push("camera.target: must be [x, y, z] of finite numbers");
  }
  if (!(Number.isFinite(camera.fov) && camera.fov > 0 && camera.fov < 180)) {
    problems.push("camera.fov: must be a number in (0, 180)");
  }
}

/**
 * Validate a parsed manifest, returning a frozen copy.
 *
 * @param {unknown} raw
 * @returns {Readonly<object>} the validated manifest
 * @throws {ManifestError} if any field is invalid
 */
export function parseManifest(raw) {
  const problems = [];

  if (!isPlainObject(raw)) {
    throw new ManifestError(["manifest: must be a JSON object"]);
  }

  if (raw.version !== MANIFEST_VERSION) {
    problems.push(
      `version: expected ${MANIFEST_VERSION}, received ${JSON.stringify(raw.version)}`,
    );
  }
  if (!isNonEmptyString(raw.name)) {
    problems.push("name: must be a non-empty string");
  }
  if (!isPlainObject(raw.geometry) || !isSafeRelativePath(raw.geometry.url)) {
    problems.push("geometry.url: must be a safe relative path to a .glb");
  }

  validateTextures(raw.textures, problems);
  validateMeshes(raw.meshes, problems);
  validateHotspots(raw.hotspots, problems);
  validateCamera(raw.camera, problems);

  if (problems.length > 0) throw new ManifestError(problems);

  return Object.freeze(structuredClone(raw));
}

/**
 * Resolve an asset path from the manifest against the scene's base directory.
 *
 * @param {string} baseUrl  directory holding the manifest, e.g. "/scene/study/"
 * @param {string} assetPath relative path from the manifest
 * @returns {string}
 */
export function resolveAssetUrl(baseUrl, assetPath) {
  if (!isNonEmptyString(baseUrl)) {
    throw new TypeError("resolveAssetUrl() requires a base URL");
  }
  if (!isSafeRelativePath(assetPath)) {
    throw new TypeError(`Unsafe asset path: ${JSON.stringify(assetPath)}`);
  }
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${assetPath}`;
}
