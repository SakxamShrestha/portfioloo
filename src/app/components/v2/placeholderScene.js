"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MathUtils } from "three";

/**
 * Placeholder centrepiece.
 *
 * Original abstract primitives standing in for the Blender export, so the
 * route, boot gate, camera rig, HUD and audio can all be built and tested
 * before any geometry exists. Delete this file once scene.json loads.
 *
 * It uses real-time lights, which the baked scene will not: the whole point of
 * the bake is to remove them. Treat the lighting here as scaffolding.
 */

/** Degrees of rotation per second for the floating monolith. */
const SPIN_DEGREES_PER_SECOND = 7;

/** Vertical bob amplitude and period of the monolith, in metres and seconds. */
const BOB_AMPLITUDE_M = 0.04;
const BOB_PERIOD_S = 6;

export default function PlaceholderScene({ reducedMotion = false }) {
  const monolithRef = useRef(null);

  // Stable across renders so the bob does not jump when React re-renders.
  const bobAngularVelocity = useMemo(
    () => (Math.PI * 2) / BOB_PERIOD_S,
    [],
  );

  useFrame((state, delta) => {
    const monolith = monolithRef.current;
    if (!monolith || reducedMotion) return;

    monolith.rotation.y += MathUtils.degToRad(SPIN_DEGREES_PER_SECOND) * delta;
    monolith.position.y =
      1.0 + Math.sin(state.clock.elapsedTime * bobAngularVelocity) * BOB_AMPLITUDE_M;
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.6} color="#ffd9a8" />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#7aa2ff" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#14131a" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Plinth */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.9, 1.05, 0.6, 48]} />
        <meshStandardMaterial color="#2a2733" roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Floating faceted monolith: the stand-in centrepiece */}
      <mesh ref={monolithRef} position={[0, 1.0, 0]} castShadow>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#c98a4b"
          roughness={0.28}
          metalness={0.55}
          emissive="#3a1f06"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Emissive accent ring, echoing the --accent token of the flat site */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.62, 0]}>
        <ringGeometry args={[1.08, 1.16, 64]} />
        <meshBasicMaterial color="#ffb867" toneMapped={false} />
      </mesh>
    </group>
  );
}
