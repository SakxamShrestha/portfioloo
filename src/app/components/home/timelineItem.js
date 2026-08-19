"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";

import styles from "../../styles/home/timeline.module.css";

export default function TimelineItem({ item, index, reduceMotion }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = Boolean(item.logo) && !logoFailed;
  const mark = item.mark ?? item.title.slice(0, 2).toUpperCase();

  return (
    <motion.li
      className={`${styles.item} ${styles[item.type]}`}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.45,
        delay: reduceMotion ? 0 : Math.min(index, 3) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className={styles.node}>
        {showLogo ? (
          <Image
            src={item.logo}
            alt=""
            width={44}
            height={44}
            unoptimized
            className={styles.nodeLogo}
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <span className={styles.mark} data-len={mark.length}>
            {mark}
          </span>
        )}
        {item.ongoing && <span className={styles.pulse} aria-hidden="true" />}
      </div>

      <div className={styles.card}>
        <p className={styles.dates}>
          {item.year}
          {item.ongoing && <span className={styles.live}>now</span>}
        </p>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.meta}>
          {item.org && <span className={styles.org}>{item.org}</span>}
          {item.org && item.location && (
            <span className={styles.metaDot} aria-hidden="true">
              ·
            </span>
          )}
          {item.location && (
            <span className={styles.location}>{item.location}</span>
          )}
        </p>
        {item.highlight && (
          <p className={styles.highlight}>{item.highlight}</p>
        )}
      </div>
    </motion.li>
  );
}
