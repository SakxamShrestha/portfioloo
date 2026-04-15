"use client";

import { motion } from "motion/react";
import { FaGithub } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import styles from "../../styles/home/project.module.css";

export default function Project({ name, description, tags, year, github, website, gradient, index }) {
  return (
    <motion.article
      className={styles.projectCard}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.09 }}
    >
      <div className={styles.accentBar} style={{ background: gradient }} />
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.projectIndex}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.projectYear}>{year}</span>
        </div>
        <h2 className={styles.projectName}>{name}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.tagList}>
          {tags.map((tag, i) => (
            <span className={styles.tag} key={i}>{tag}</span>
          ))}
        </div>
        <div className={styles.cardFooter}>
          {github && (
            <a href={github} className={styles.githubBtn} target="_blank" rel="noopener noreferrer">
              <FaGithub size={14} />
              GitHub
            </a>
          )}
          {website && (
            <a href={website} className={styles.liveBtn} target="_blank" rel="noopener noreferrer">
              <IoIosLink size={14} />
              Live
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
