import styles from "../styles/reading/reading.module.css";

import readingList from "../data/readingList.json";

import Article from "../components/reading/article";

export const metadata = {
  title: "Reading | Sakxam Shrestha",
  description:
    "Technical blog posts, papers, and articles I've read — kept as a running log.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Reading | Sakxam Shrestha",
    description:
      "Technical blog posts, papers, and articles I've read — kept as a running log.",
    url: "https://www.sakxamshrestha.com/reading",
    siteName: "Sakxam Shrestha's Reading List",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        alt: "Sakxam Shrestha's Reading List",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reading | Sakxam Shrestha",
    description:
      "Technical blog posts, papers, and articles I've read — kept as a running log.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/reading",
  },
};

function groupByYear(articles) {
  const groups = new Map();

  for (const article of articles) {
    const parsed = new Date(article.date);
    const year = Number.isNaN(parsed.getTime())
      ? "Undated"
      : String(parsed.getUTCFullYear());

    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(article);
  }

  return [...groups.entries()];
}

export default function Reading() {
  const sorted = [...readingList].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  const grouped = groupByYear(sorted);

  return (
    <div className={styles.container}>
      <div className={`content ${styles.content}`}>
        <h1 className={styles.pageTitle}>Reading</h1>
        <p className={styles.pageSubtitle}>
          Technical posts, papers, and articles worth remembering. Logged as I
          read them.
        </p>

        {sorted.length === 0 ? (
          <p className={styles.empty}>Nothing logged yet.</p>
        ) : (
          <>
            <p className={styles.count}>
              {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
            </p>
            {grouped.map(([year, articles]) => (
              <section className={styles.yearGroup} key={year}>
                <h2 className={styles.year}>{year}</h2>
                <ul className={styles.articleList}>
                  {articles.map((article) => (
                    <Article {...article} key={article.url} />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
