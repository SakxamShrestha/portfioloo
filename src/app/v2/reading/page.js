import readingList from "../../data/readingList.json";
import SectionShell from "../../components/v2/sectionShell";
import styles from "../../styles/v2/section.module.css";

export const metadata = {
  title: "Reading | v2",
  description: "Articles and papers I've read, in the v2 interface.",
  robots: { index: false, follow: false },
};

/** Fixed locale so server and client render the same string. */
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function formatDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : DATE_FORMAT.format(parsed);
}

function byDateDescending(first, second) {
  return new Date(second.date ?? 0) - new Date(first.date ?? 0);
}

export default function V2ReadingPage() {
  const ordered = [...readingList].sort(byDateDescending);

  return (
    <SectionShell
      title="Reading"
      lede="A running log of technical posts and papers worth keeping."
      count={`${ordered.length} entries`}
    >
      <div className={styles.list}>
        {ordered.map((entry) => (
          <a
            key={entry.url}
            className={styles.row}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.rowTop}>
              <h2 className={styles.itemTitle}>{entry.title}</h2>
              <span className={styles.meta}>{formatDate(entry.date)}</span>
            </div>

            <p className={styles.body}>
              {[entry.author, entry.source].filter(Boolean).join(" · ")}
            </p>

            {entry.note ? <p className={styles.body}>{entry.note}</p> : null}

            {entry.tags?.length ? (
              <ul className={styles.tags}>
                {entry.tags.map((tag) => (
                  <li key={tag} className={styles.tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </a>
        ))}
      </div>
    </SectionShell>
  );
}
