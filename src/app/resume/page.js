import styles from "../styles/resume/resume.module.css";

import { FaRegFilePdf, FaGithub } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FaLinkedinIn } from "react-icons/fa";
import { HiGlobeAmericas } from "react-icons/hi2";

export const metadata = {
  title: "Resume | Sakxam Shrestha",
  description:
    "View my resume and explore my experience, skills, and education.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Resume | Sakxam Shrestha",
    description:
      "View my resume and explore my experience, skills, and education.",
    url: "https://www.sakxamshrestha.com/resume",
    siteName: "Sakxam Shrestha's Resume",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        alt: "Sakxam Shrestha's Resume",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | Sakxam Shrestha",
    description:
      "View my resume and explore my experience, skills, and education.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/resume",
  },
};

export default function Resume() {
  return (
    <div className={styles.resumeContainer}>
      <div className={`content ${styles.resumeContentContainer}`}>
        <div className={styles.intro}>
          <h1 className={styles.name}>
            Sakxam Shrestha
            <a href="assets/resume/resume.pdf" target="_blank">
              <FaRegFilePdf className={styles.svg} />
            </a>
          </h1>
          <div className={styles.links}>
            <a
              className={`${styles.contact} ${styles.link} ${styles.text} ${styles.underline}`}
              href="mailto: sakxamshrestha57@gmail.com"
              target="_blank"
            >
              <IoMdMail />
              sakxamshrestha57@gmail.com
            </a>{" "}
            <p className={`${styles.text} ${styles.linkDivider}`}>|</p>
            <a
              className={`${styles.contact} ${styles.link} ${styles.text} ${styles.underline}`}
              href="https://www.linkedin.com/in/sakxam-shrestha-3a817a237/"
              target="_blank"
            >
              <FaLinkedinIn />
              in/shresthasakxam
            </a>{" "}
            <p className={`${styles.text} ${styles.linkDivider}`}>|</p>
            <a
              className={`${styles.contact} ${styles.link} ${styles.text} ${styles.underline}`}
              href="https://github.com/SakxamShrestha"
              target="_blank"
            >
              <FaGithub />
              github.com/SakxamShrestha
            </a>
            <p className={`${styles.text} ${styles.linkDivider}`}>|</p>
            <a
              className={`${styles.contact} ${styles.link} ${styles.text} ${styles.underline}`}
              href="https://www.sakxamshrestha.com/"
              target="_blank"
            >
              <HiGlobeAmericas />
              sakxamshrestha.com
            </a>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h1 className={styles.sectionHeading}>Education</h1>
          <hr className={styles.divider} />
          <div className={styles.schoolContainer}>
            <div className={styles.school}>
              <div className={styles.schoolDetails}>
                <b className={styles.text}>Fisk University</b>
                <p className={styles.text}>Expected: May 2027</p>
              </div>
              <div className={styles.schoolDetails}>
                <i className={styles.text}>Bachelor of Science in Computer Science</i>
                <i className={styles.text}>GPA:3.91/4.0</i>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h1 className={styles.sectionHeading}>Relevant Coursework</h1>
          <hr className={styles.divider} />
          <p className={styles.text}>
            Data Structures & Algorithms (Java), Intro to Computer Science
            (Python & Java), Calculus (1 & 2), Discrete Maths, Machine Learning
            & Projects, Database Management, Computer Organization, Computer
            Security, Quantum Computing.
          </p>
        </div>
        <div className={styles.sectionContainer}>
          <h1 className={styles.sectionHeading}>Experience</h1>
          <hr className={styles.divider} />
          <div className={styles.experienceContainer}>
            <div className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceLeft}>
                  <b className={styles.text}>Amazon LLC</b>
                  <i className={styles.text}>Software Development Intern</i>
                </div>
                <div className={styles.experienceMeta}>
                  <p className={styles.text}>May 2025 – July 2025</p>
                  <p className={styles.text}>Seattle, WA</p>
                </div>
              </div>
              <ul className={styles.list}>
                <li className={styles.text}>
                  Under the Personalization department, designed and prototyped
                  an LLM-powered internal chat assistant projected to reduce
                  documentation and ticket lookup time by approximately{" "}
                  <b>30%</b> for on-call support engineers, optimizing
                  operational workflow.
                </li>
                <li className={styles.text}>
                  Integrated <b>MCP (Model Context Protocol)</b> to dynamically
                  extract and maintain context for LLMs, improving response
                  relevance by over <b>40%</b> in internal QA evaluations.
                </li>
                <li className={styles.text}>
                  Built scalable backend services using{" "}
                  <b>AWS Services (Lambda, DynamoDB, Bedrock, SQS)</b>,
                  achieving sub-<b>200ms</b> average latency under optimized
                  conditions, with modular design supporting future toolchain
                  integrations.
                </li>
              </ul>
            </div>
            <div className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceLeft}>
                  <b className={styles.text}>Webacy</b>
                  <i className={styles.text}>
                    Web3 Security and Data Analytics Extern
                  </i>
                </div>
                <div className={styles.experienceMeta}>
                  <p className={styles.text}>August 2024 – September 2024</p>
                  <p className={styles.text}>Remote</p>
                </div>
              </div>
              <ul className={styles.list}>
                <li className={styles.text}>
                  Conducted a comprehensive analysis of smart contract
                  vulnerabilities, identifying and labeling <b>50+</b> critical
                  risks; this initiative enhanced the team&apos;s data
                  categorization processes and improved overall risk assessment
                  accuracy by <b>25%</b>.
                </li>
                <li className={styles.text}>
                  Conducted frequency and correlation analysis on a dataset
                  comprising <b>10,000+</b> entries, identifying critical
                  vulnerabilities, which streamlined reporting processes and
                  enhanced data accuracy by <b>25%</b> through targeted
                  statistical tools.
                </li>
              </ul>
            </div>
            <div className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceLeft}>
                  <b className={styles.text}>
                    Tennessee Education Lottery Corporation
                  </b>
                  <i className={styles.text}>Data Analytics Intern</i>
                </div>
                <div className={styles.experienceMeta}>
                  <p className={styles.text}>May 2024 – August 2024</p>
                  <p className={styles.text}>Nashville, TN</p>
                </div>
              </div>
              <ul className={styles.list}>
                <li className={styles.text}>
                  Interned under Scientific Games Department, cleaned and
                  processed <b>50K+</b> rows of Ticket Sales Excel data using
                  Python in Linux environment, then created interactive
                  dashboards in Tableau, improving data-driven decision-making
                  by <b>30%</b>.
                </li>
                <li className={styles.text}>
                  Built MySQL queries and dashboards to analyze sales trends,
                  providing actionable insights for business strategy.
                </li>
                <li className={styles.text}>
                  Collaborated with a team of 4 interns to submit a final
                  project on Responsible Gameplay, presented findings to the
                  Board members of TEL, and received critical feedback.
                </li>
              </ul>
            </div>
            <div className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceLeft}>
                  <b className={styles.text}>Thurgood Marshall College Fund</b>
                  <i className={styles.text}>MetaScholar Intern</i>
                </div>
                <div className={styles.experienceMeta}>
                  <p className={styles.text}>March 2024 – May 2024</p>
                  <p className={styles.text}>Atlanta, GA / Remote</p>
                </div>
              </div>
              <ul className={styles.list}>
                <li className={styles.text}>
                  Coordinated in an immersive program focused on <b>Web3</b> and
                  the <b>Metaverse</b> and implications for business, gaining
                  hands-on experience in blockchain, VR and smart contracts.
                </li>
                <li className={styles.text}>
                  Created a <b>Solidity</b>-based smart contract that automated
                  transaction processes, reducing manual intervention by{" "}
                  <b>70%</b> and enabling real-time tracking of payment
                  statuses on the <b>Ethereum</b> blockchain for enhanced user
                  experience.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h1 className={styles.sectionHeading}>Projects</h1>
          <hr className={styles.divider} />
          <div className={styles.projectContainer}>
            <div className={styles.project}>
              <div className={styles.projectDetails}>
                <p
                  className={`${styles.text} ${styles.projectHeading} ${styles.projectTitle}`}
                >
                  TV Series NLP Analyzer |
                  <i className={styles.techStack}>
                    {" "}
                    Python, Scrapy, Spacy, Llama 3.1, Gradio
                  </i>
                </p>
                <p className={`${styles.text} ${styles.projectHeading}`}>
                  March 2024
                </p>
              </div>
              <ul className={`${styles.projectNotes} ${styles.text}`}>
                <li>
                  Developed Natural Language Processing system to scrape and
                  analyze over <b>10,000+</b> character dialogues using{" "}
                  <b>Scrapy</b> and <b>Spacy</b>, targeting high <b>95%</b>{" "}
                  accuracy in character relationship detection.
                </li>
                <li>
                  Implemented zero-shot and custom text classifiers with a
                  focus on achieving high precision in multi-class text
                  classification and theme extraction.
                </li>
                <li>
                  Created an interactive web UI with <b>Gradio</b> to
                  integrate and showcase <b>NLP</b> models, including a
                  character chatbot trained with <b>Llama 3.1</b>, improving
                  response accuracy.
                </li>
              </ul>
            </div>
            <div className={styles.project}>
              <div className={styles.projectDetails}>
                <p
                  className={`${styles.text} ${styles.projectHeading} ${styles.projectTitle}`}
                >
                  End-to-End Chest Cancer Classification |
                  <i className={styles.techStack}>
                    {" "}
                    Python, AWS S3, SageMaker, GitHub Actions, Docker,
                    MLflow, DVC
                  </i>
                </p>
                <p className={`${styles.text} ${styles.projectHeading}`}>
                  February 2024
                </p>
              </div>
              <ul className={`${styles.projectNotes} ${styles.text}`}>
                <li>
                  Built a deep learning model using <b>EfficientNet-B3</b> for
                  chest cancer classification, achieving <b>85%</b> accuracy on a
                  dataset of <b>5,000+</b> chest X-ray images.
                </li>
                <li>
                  Automated the ML pipeline with <b>SageMaker Pipelines</b>,{" "}
                  <b>MLflow</b>, and <b>DVC</b>, improving experiment tracking
                  and model versioning, reducing manual intervention by{" "}
                  <b>70%</b>.
                </li>
                <li>
                  Implemented <b>CI/CD</b> with <b>GitHub Actions</b>,{" "}
                  <b>Docker</b>, and <b>AWS</b>, deploying the model with{" "}
                  <b>API Gateway</b> for real-time predictions, cutting
                  deployment time by <b>50%</b>.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.sectionContainer}>
          <h1 className={styles.sectionHeading}>Skills</h1>
          <hr className={styles.divider} />
          <div className={styles.technicalSkillsContainer}>
            <div className={styles.skill}>
              <b className={styles.text}>Programming Languages: </b>
              <p className={styles.text}>
                <label className={`${styles.text} ${styles.space}`}>
                  &nbsp;
                </label>
                Python, C++, JavaScript, SQL, HTML, CSS/SCSS
              </p>
            </div>
            <div className={styles.skill}>
              <b className={styles.text}>Programming Frameworks: </b>
              <p className={styles.text}>
                <label className={`${styles.text} ${styles.space}`}>
                  &nbsp;
                </label>
                React, React Native, Node.js
              </p>
            </div>
            <div className={styles.skill}>
              <b className={styles.text}>Developer Tools: </b>
              <p className={styles.text}>
                <label className={`${styles.text} ${styles.space}`}>
                  &nbsp;
                </label>
                Firebase, Cloudflare, Netlify, Git, GitHub, iOS, Android, Yarn,
                NPM
              </p>
            </div>
            <div className={styles.skill}>
              <b className={styles.text}>Programming Libraries: </b>
              <p className={styles.text}>
                <label className={`${styles.text} ${styles.space}`}>
                  &nbsp;
                </label>
                Tailwind, Bootstrap
              </p>
            </div>
            <div className={styles.skill}>
              <b className={styles.text}>Productivity Tools and OS: </b>{" "}
              <p className={styles.text}>
                <label className={`${styles.text} ${styles.space}`}>
                  &nbsp;
                </label>
                MS Office, MS Teams, Google Suite, Jira, Adobe Photoshop, OBS
                Studio, Linux
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
