# v2 Scene Export Contract

This document defines exactly what the Blender side must produce for the v2
runtime to render it. The runtime makes no guesses: if the manifest does not
describe something, it is not drawn.

The engine already exists and is tested. Once you drop a conforming export into
`public/scene/<name>/`, swap `PlaceholderScene` for the real loader and the
scene appears.

---

## 1. Why baked

There are no runtime lights in this scene. Surface colour is:

```
final = albedo × irradiance × intensity
```

`albedo` is the unlit base colour of each surface. `irradiance` is the light
that reached that surface, computed once in Blender and stored as a texture.
At runtime this is two texture reads and a multiply, which is why a scene that
looks expensive costs almost nothing per frame and runs on a laptop GPU.

The trade is that lighting cannot change unless you bake another irradiance
atlas. The runtime supports crossfading between two of them, which covers the
common cases (a lamp turning on, dusk falling) without a second scene.

## 2. Directory layout

```
public/scene/<name>/
├── scene.json          the manifest (contract below)
├── geo/
│   └── <name>.glb      geometry only, no materials, no lights, no cameras
└── tex/
    ├── <name>_albedo.jpg
    ├── <name>_irr_day.jpg
    └── <name>_irr_dusk.jpg   optional second lighting state
```

Every path inside `scene.json` is relative to that directory. The validator
rejects absolute paths, `..` segments and anything with a URL scheme, so the
manifest cannot point the loader at another origin.

## 3. UV channels

This is the part that most often goes wrong.

| Channel | Blender name | Purpose | Requirement |
|---|---|---|---|
| UV0 | first UV map | addresses the albedo atlas | may tile and overlap |
| UV1 | second UV map | addresses the irradiance atlas | must be unique per face, no overlap, no tiling |

The irradiance atlas stores a baked result per surface patch, so two faces
sharing the same UV1 region would share the same lighting, which reads as an
obvious error. Use **UV > Lightmap Pack** or **Smart UV Project** on the second
channel, and leave a few pixels of margin so mipmapping does not bleed between
patches.

The shader reads the second channel by the attribute name `uv1`. If Blender's
exporter names it something else, declare the actual channel index in the
manifest's `uvChannel` field and the loader aliases it for you.

## 4. Baking in Blender

1. Model the scene. Keep it to as few objects as you can live with — each one
   in the manifest is a draw call.
2. Apply all modifiers. The exporter bakes what it sees.
3. Add the second UV map to every object that will be lit, and lightmap-pack it.
4. Light the scene properly in Blender — area lights, an HDRI, whatever you
   want. None of this ships; it only feeds the bake.
5. Create one image per lighting state, e.g. `study_irr_day`, at 2048×2048 or
   4096×4096.
6. Bake type **Diffuse**, with **Direct** and **Indirect** contributions
   enabled and **Colour** disabled. That yields light-only data, not
   light-times-colour — the colour comes from the albedo at runtime.
7. Set the active UV map to UV1 before baking, or the result lands in the wrong
   channel.
8. Save as JPEG, quality 90. These are sRGB-encoded, which is what the runtime
   expects.
9. Bake the albedo separately with bake type **Diffuse**, **Colour** only,
   direct and indirect disabled — or just author the albedo atlas by hand.
10. Export geometry as glTF 2.0 Binary (`.glb`): include **UVs** and
    **Normals**, exclude **Materials**, **Cameras** and **Lights**. Draco
    compression is supported and worth enabling.

Keep object names stable. The manifest references meshes by name, and renaming
one in Blender silently drops it from the scene (the loader warns in the
console).

## 5. Manifest format

`scene.json`, version `1`:

```json
{
  "version": 1,
  "name": "study",
  "geometry": { "url": "geo/study.glb" },
  "textures": {
    "albedo": "tex/study_albedo.jpg",
    "irradiance": [
      { "key": "day",  "url": "tex/study_irr_day.jpg" },
      { "key": "dusk", "url": "tex/study_irr_dusk.jpg" }
    ]
  },
  "meshes": [
    { "name": "desk",  "uvChannel": 1 },
    { "name": "lamp",  "uvChannel": 1, "irradianceIntensity": 1.6 },
    { "name": "glass", "uvChannel": 1, "transparent": true }
  ],
  "hotspots": [
    {
      "id": "projects",
      "label": "Projects",
      "position": [0.4, 1.1, -0.2],
      "href": "/projects"
    }
  ],
  "camera": {
    "position": [0, 1.3, 4.2],
    "target": [0, 0.8, 0],
    "fov": 38
  }
}
```

### Field reference

| Field | Required | Notes |
|---|---|---|
| `version` | yes | Must be `1`. |
| `name` | yes | Non-empty string, used in logs. |
| `geometry.url` | yes | Relative path to the `.glb`. |
| `textures.albedo` | yes | Relative path to the albedo atlas. |
| `textures.irradiance` | yes | Non-empty array. Each entry needs a unique `key` and a relative `url`. The first entry is the default state. |
| `meshes[].name` | yes | Must match the object name in the `.glb` exactly. |
| `meshes[].uvChannel` | yes | Non-negative integer. The channel holding lightmap UVs — normally `1`. |
| `meshes[].irradianceIntensity` | no | Multiplier ≥ 0, default `1`. Use it to push a surface brighter without re-baking. |
| `meshes[].transparent` | no | Enables alpha blending for that mesh. |
| `hotspots` | no | Each needs a unique `id`, a `label`, a `[x, y, z]` `position`, and an `href` that is an internal path starting with `/`. External URLs are rejected — an href here would otherwise be an open redirect controlled by whatever wrote the manifest. |
| `camera` | no | `position` and `target` as `[x, y, z]`, `fov` in degrees between 0 and 180. Falls back to the values in `lib/constants.js`. |

Validation collects every problem in one pass, so a broken export reports all
its faults at once rather than one per reload. The manifest is fetched and
validated before any texture request is made — a bad export fails in a few
hundred bytes rather than after several megabytes.

## 6. Budget

These are the numbers to design against, not hard limits:

| Resource | Target | Why |
|---|---|---|
| `.glb` after Draco | under 2 MB | it blocks first render of the scene |
| Each atlas | 2048² or 4096² | 4096² JPEG is roughly 1–2 MB |
| Total scene payload | under 8 MB | anything more and the loading state becomes the experience |
| Draw calls (manifest meshes) | under 40 | each one is a state change |
| Triangles | under 300k | comfortable for integrated graphics |

## 7. Switching from the placeholder

`src/app/components/v2/sceneCanvas.js` currently renders
`PlaceholderScene`, which uses real-time lights as scaffolding. To go live:

1. Put the export in `public/scene/<name>/`.
2. Call `loadScene("/scene/<name>")` from `src/app/v2/lib/loadScene.js`.
3. Add the returned `root` to the canvas and delete `placeholderScene.js`.
4. Crossfade lighting states with `stepBlend` from `lib/bakedMaterial.js`,
   writing the result into each material's `uBlend` uniform.

## 8. What is deliberately not in the scene

Text is rendered as DOM in `hud.js`, not as geometry. Text drawn into a canvas
cannot be selected, searched, translated, zoomed or read by a screen reader.
The canvas carries the atmosphere; the DOM carries the content. Keep it that
way — it is also why the flat tier is a genuine alternative rather than an
apology.
