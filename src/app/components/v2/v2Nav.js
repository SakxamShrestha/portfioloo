"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "../../styles/v2/section.module.css";
import { V2_SECTIONS } from "../../v2/lib/sections";

/**
 * Navigation for the v2 content pages.
 *
 * The site-wide header is suppressed on /v2 routes, so these pages need their
 * own. It carries the current-page state the HUD cannot, since the HUD only
 * ever exists on the scene itself.
 */

export default function V2Nav() {
  const pathname = usePathname();

  return (
    <header className={styles.nav}>
      <Link href="/v2" className={styles.navHome}>
        <span aria-hidden="true">←</span> The room
      </Link>

      <nav className={styles.navLinks} aria-label="Portfolio sections">
        {V2_SECTIONS.map((section) => {
          const isCurrent = pathname === section.href;

          return (
            <Link
              key={section.href}
              href={section.href}
              className={isCurrent ? styles.navLinkCurrent : styles.navLink}
              aria-current={isCurrent ? "page" : undefined}
            >
              {section.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
