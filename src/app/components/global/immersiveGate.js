"use client";

import { usePathname } from "next/navigation";

/**
 * Hides site chrome on immersive routes.
 *
 * The v2 scene owns the whole viewport, so the shared header and footer must
 * not render over it. A nested layout cannot remove a parent layout's chrome
 * in the App Router, so the root layout wraps that chrome in this gate instead.
 */

/** Route prefixes that take over the full viewport. */
const IMMERSIVE_PREFIXES = Object.freeze(["/v2"]);

export default function ImmersiveGate({ children }) {
  const pathname = usePathname();

  const isImmersive = IMMERSIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`),
  );

  return isImmersive ? null : children;
}
