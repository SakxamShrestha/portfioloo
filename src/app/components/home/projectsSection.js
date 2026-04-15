"use client";

import { motion } from "motion/react";
import Project from "./project";
import styles from "../../styles/home/page.module.css";

export default function Projects({ projects }) {
  return (
    <div className={styles.projectsContainer}>
      <div className={`content ${styles.projectContent}`}>
        <motion.h1
          className={styles.sectionHeading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Projects
        </motion.h1>
        <div className={styles.projectGrid}>
          {projects.map((project, i) => (
            <Project key={project.name} {...project} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
