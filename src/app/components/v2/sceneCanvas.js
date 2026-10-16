"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";

import { CAMERA, MAX_PIXEL_RATIO } from "../../v2/lib/constants";
import { clampPixelRatio } from "../../v2/lib/capability";
import CameraRig from "./cameraRig";
import PlaceholderScene from "./placeholderScene";

/**
 * The WebGL surface.
 *
 * Only ever mounted on the full tier, and only via a dynamic import, so none
 * of three.js reaches a visitor who was routed to the flat version.
 */
export default function SceneCanvas({ reducedMotion = false }) {
  return (
    <Canvas
      dpr={[1, clampPixelRatio(
        typeof window === "undefined" ? 1 : window.devicePixelRatio,
        MAX_PIXEL_RATIO,
      )]}
      camera={{
        position: [...CAMERA.POSITION],
        fov: CAMERA.FOV,
        near: CAMERA.NEAR,
        far: CAMERA.FAR,
      }}
      gl={{
        antialias: true,
        // The scene is opaque and fills the viewport; an alpha buffer would be
        // a per-pixel cost for nothing.
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      // Baked lighting does not change unless state does, so there is no reason
      // to re-render a static frame. Raised to "always" by the scene when a
      // crossfade or animation is running.
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <color attach="background" args={["#090e1a"]} />
      <CameraRig reducedMotion={reducedMotion} />
      <PlaceholderScene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
