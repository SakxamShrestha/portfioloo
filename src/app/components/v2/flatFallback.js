import Link from "next/link";

import styles from "../../styles/v2/flat.module.css";
import { V2_SECTIONS } from "../../v2/lib/sections";

/**
 * The flat tier.
 *
 * Shown to anyone the boot gate routes away from WebGL: no GPU, a phone, a
 * data-saver connection, or a stated preference for reduced motion. It is a
 * real page, not an apology -- the 3D bundle is never even requested here.
 */

/** Human-readable explanation per capability reason. */
const REASON_COPY = Object.freeze({
  "no-webgl2": "this browser does not expose WebGL2",
  "reduced-motion": "you asked your system to reduce motion",
  "save-data": "your connection is in data-saver mode",
  "small-viewport": "the scene needs a wider screen",
  "low-memory": "this device reports limited memory",
  "few-cores": "this device reports a low core count",
  "no-canvas": "this browser does not support a 2D canvas",
});

export default function FlatFallback({ reasons = [] }) {
  const explanations = reasons
    .map((reason) => REASON_COPY[reason])
    .filter(Boolean);

  return (
    <div className={styles.flat}>
      <div className={styles.flatInner}>
        <span className={styles.build}>Text mode</span>
        <h1 className={styles.title}>Sakxam Shrestha</h1>
        <p className={styles.body}>
          The board is sitting this one out.
          {explanations.length > 0 ? ` Reason: ${explanations.join("; ")}.` : null}
        </p>
        <p className={styles.body}>
          Nothing is missing. Every section below holds the same content.
        </p>

        <nav className={styles.links} aria-label="Portfolio sections">
          {V2_SECTIONS.map((section) => (
            <Link key={section.href} href={section.href}>
              {section.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className={styles.exit}>
          ← Back to the flat site
        </Link>
      </div>
    </div>
  );
}
