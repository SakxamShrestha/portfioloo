"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";

import styles from "../../styles/home/v2Teaser.module.css";

/**
 * Doorway to the v2 experience.
 *
 * Honest about being unfinished. A teaser that oversells a work in progress
 * only makes the click a disappointment.
 */
export default function V2Teaser() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={`content ${styles.teaser}`}>
      <motion.div
        className={styles.card}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className={styles.badge}>Now building</span>

        <h2 className={styles.heading}>Portfolio, version two</h2>

        <p className={styles.copy}>
          A maze you drive instead of a page you scroll. Arrow keys move the
          mark through the corridors, and reaching a gate opens that section.
          Unfinished, and I am building it in the open.
        </p>

        <Link href="/v2" className={styles.cta}>
          Play the maze
          <FaArrowRight aria-hidden="true" className={styles.ctaIcon} />
        </Link>

        <p className={styles.note}>
          Works on phones too. Every section is a plain link as well, so the
          maze is never in the way.
        </p>
      </motion.div>
    </section>
  );
}
