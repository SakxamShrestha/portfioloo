import V2Nav from "./v2Nav";
import styles from "../../styles/v2/section.module.css";

/**
 * Frame shared by every v2 content page.
 *
 * Keeps the nav, heading rhythm and page width in one place so five sections
 * cannot drift apart, and so the type scale set in tokens.css is applied
 * identically across all of them.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.lede] one sentence under the title
 * @param {string} [props.count] small monospace tally, e.g. "3 projects"
 * @param {React.ReactNode} props.children
 */
export default function SectionShell({ title, lede, count, children }) {
  return (
    <div className={styles.page}>
      <V2Nav />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {count ? <span className={styles.count}>{count}</span> : null}
        </div>
        {lede ? <p className={styles.lede}>{lede}</p> : null}

        {children}
      </main>
    </div>
  );
}
