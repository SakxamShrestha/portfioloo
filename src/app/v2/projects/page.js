import Image from "next/image";
import { FaGithub } from "react-icons/fa";

import projects from "../../data/projects.json";
import SectionShell from "../../components/v2/sectionShell";
import styles from "../../styles/v2/section.module.css";

export const metadata = {
  title: "Projects | v2",
  description: "Software and ML projects, in the v2 interface.",
  robots: { index: false, follow: false },
};

/** Newest first, so the list does not depend on hand-ordering in the JSON. */
function byYearDescending(first, second) {
  return (second.year ?? 0) - (first.year ?? 0);
}

export default function V2ProjectsPage() {
  const ordered = [...projects].sort(byYearDescending);

  return (
    <SectionShell
      title="Projects"
      lede="Things I built end to end, mostly machine learning and full-stack work."
      count={`${ordered.length} projects`}
    >
      <div className={styles.grid}>
        {ordered.map((project) => (
          <article key={project.name} className={styles.card}>
            {project.image ? (
              <Image
                className={styles.thumb}
                src={project.image}
                alt={project.name}
                width={640}
                height={360}
              />
            ) : null}

            <div className={styles.rowTop}>
              <h2 className={styles.itemTitle}>{project.name}</h2>
              <span className={styles.meta}>{project.year}</span>
            </div>

            <p className={styles.body}>{project.description}</p>

            {project.tags?.length ? (
              <ul className={styles.tags}>
                {project.tags.map((tag) => (
                  <li key={tag} className={styles.tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            {project.github ? (
              <div className={styles.cardLinks}>
                <a
                  className={styles.cardLink}
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub aria-hidden="true" />
                  Source
                </a>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
