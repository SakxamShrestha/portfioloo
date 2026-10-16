"use client";

import { motion } from "motion/react";

import styles from "../../styles/reading/article.module.css";

function formatDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function Article(props) {
  const readOn = formatDate(props.date);

  return (
    <motion.li
      className={styles.article}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
    >
      <a
        className={styles.link}
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2 className={styles.title}>{props.title}</h2>
      </a>
      <div className={styles.meta}>
        {props.author && <span className={styles.author}>{props.author}</span>}
        {props.source && <span className={styles.source}>{props.source}</span>}
        {readOn && <span className={styles.date}>{readOn}</span>}
      </div>
      {props.note && <p className={styles.note}>{props.note}</p>}
      {props.tags?.length > 0 && (
        <div className={styles.tags}>
          {props.tags.map((tag) => (
            <span className={styles.tag} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.li>
  );
}
