"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import { CAMERA } from "../../v2/lib/constants";

/**
 * Pointer-parallax camera rig.
 *
 * The camera never leaves its framing; the pointer only nudges it within a few
 * degrees. That reads as "the scene is aware of you" without surrendering the
 * composition to the visitor, and it means there is no way to navigate
 * yourself into a view where the content is unreadable.
 */
export default function CameraRig({ reducedMotion = false }) {
  const { camera } = useThree();

  // Target swing in normalised device coordinates, -1..1 on each axis.
  const desiredSwing = useRef({ x: 0, y: 0 });
  const basePosition = useRef(new Vector3(...CAMERA.POSITION));
  const lookTarget = useRef(new Vector3(...CAMERA.TARGET));

  useEffect(() => {
    camera.position.copy(basePosition.current);
    camera.lookAt(lookTarget.current);
  }, [camera]);

  useEffect(() => {
    if (reducedMotion) return undefined;

    function handlePointerMove(event) {
      desiredSwing.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    }

    // Recentre when the pointer leaves, so the camera does not stay cocked.
    function handlePointerLeave() {
      desiredSwing.current = { x: 0, y: 0 };
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;

    const { x, y } = desiredSwing.current;
    const targetX = basePosition.current.x + x * CAMERA.MAX_SWING_RAD * 4;
    const targetY = basePosition.current.y - y * CAMERA.MAX_SWING_RAD * 2;

    camera.position.x += (targetX - camera.position.x) * CAMERA.EASE;
    camera.position.y += (targetY - camera.position.y) * CAMERA.EASE;
    camera.lookAt(lookTarget.current);
  });

  return null;
}
