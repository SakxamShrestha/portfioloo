import {
  FaGithub,
  FaLinkedinIn,
  FaRegFilePdf,
} from "react-icons/fa";
import { HiGlobeAmericas } from "react-icons/hi2";
import { IoMdMail } from "react-icons/io";

import resume from "../../data/resume.json";
import SectionShell from "../../components/v2/sectionShell";
import styles from "../../styles/v2/resume.module.css";

export const metadata = {
  title: "Resume | v2",
  description: "Experience, education and skills, in the v2 interface.",
  robots: { index: false, follow: false },
};

/** Icon per contact kind, keyed by the `kind` field in resume.json. */
const CONTACT_ICONS = Object.freeze({
  email: IoMdMail,
  linkedin: FaLinkedinIn,
  github: FaGithub,
  website: HiGlobeAmericas,
});

function Entry({ heading, subheading, timeframe, location, bullets }) {
  return (
    <article className={styles.entry}>
      <div className={styles.entryHead}>
        <div>
          <h3 className={styles.entryTitle}>{heading}</h3>
          {subheading ? <p className={styles.entryRole}>{subheading}</p> : null}
        </div>
        <div className={styles.entryMeta}>
          {timeframe ? <span>{timeframe}</span> : null}
          {location ? <span>{location}</span> : null}
        </div>
      </div>

      {bullets?.length ? (
        <ul className={styles.bullets}>
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function V2ResumePage() {
  return (
    <SectionShell title="Resume">
      <div className={styles.contacts}>
        {resume.contacts.map((contact) => {
          const Icon = CONTACT_ICONS[contact.kind];

          return (
            <a
              key={contact.href}
              className={styles.contact}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {Icon ? <Icon aria-hidden="true" /> : null}
              {contact.label}
            </a>
          );
        })}

        <a
          className={styles.pdf}
          href={resume.pdf}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaRegFilePdf aria-hidden="true" />
          PDF
        </a>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Education</h2>
        {resume.education.map((school) => (
          <Entry
            key={school.school}
            heading={school.school}
            subheading={school.credential}
            timeframe={school.timeframe}
            location={school.detail}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Relevant Coursework</h2>
        <p className={styles.prose}>{resume.coursework}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Experience</h2>
        {resume.experience.map((job) => (
          <Entry
            key={`${job.organization}-${job.timeframe}`}
            heading={job.organization}
            subheading={job.role}
            timeframe={job.timeframe}
            location={job.location}
            bullets={job.bullets}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Projects</h2>
        {resume.projects.map((project) => (
          <Entry
            key={project.name}
            heading={project.name}
            subheading={project.stack}
            timeframe={project.timeframe}
            bullets={project.bullets}
          />
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Skills</h2>
        <dl className={styles.skills}>
          {resume.skills.map((skill) => (
            <div key={skill.label} className={styles.skillRow}>
              <dt className={styles.skillLabel}>{skill.label}</dt>
              <dd className={styles.skillValue}>{skill.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </SectionShell>
  );
}
