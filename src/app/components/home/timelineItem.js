"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import styles from "../../styles/home/timeline.module.css";

export default function TimelineItem({ item, isLeft }) {
  const { theme } = useTheme();
  const [logoError, setLogoError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={`${styles.timelineItem} ${isLeft ? styles.left : styles.right}`}
    >
      <motion.div
        className={styles.content}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
          boxShadow:
            theme === "dark"
              ? "0 8px 24px rgba(100, 255, 218, 0.15)"
              : "0 8px 24px rgba(15, 118, 110, 0.2)",
        }}
      >
        <div className={styles.cardHeader}>
          {item.logo && !logoError && (
            <div className={styles.logo}>
              <Image
                src={item.logo}
                alt=""
                width={24}
                height={24}
                unoptimized
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          <div className={styles.headerText}>
            <div className={styles.yearBadge}>
              <span>{item.year}</span>
            </div>
            <h3 className={styles.title}>{item.title}</h3>
          </div>
        </div>
        {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
        {item.description && (
          <p className={styles.description}>{item.description}</p>
        )}
        <span
          className={`${styles.typeBadge} ${styles[item.type]}`}
          title={item.type}
        >
          {item.type}
        </span>
      </motion.div>
    </motion.div>
  );
}
