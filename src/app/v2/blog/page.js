import Link from "next/link";

import { getBlogPosts } from "../../../lib/getBlogPosts";
import SectionShell from "../../components/v2/sectionShell";
import styles from "../../styles/v2/section.module.css";

export const metadata = {
  title: "Blog | v2",
  description: "Posts on technology and whatever else, in the v2 interface.",
  robots: { index: false, follow: false },
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
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

export default function V2BlogPage() {
  const posts = [...getBlogPosts()].sort(byDateDescending);

  return (
    <SectionShell
      title="Blog"
      lede="Longer thoughts, written when something is worth more than a note."
      count={`${posts.length} posts`}
    >
      {posts.length === 0 ? (
        <p className={styles.empty}>No posts yet.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            // Posts themselves still live on the flat site: there is one copy
            // of each article, not a v2 fork of the content.
            <Link
              key={post.slug}
              className={styles.row}
              href={`/blog/${post.slug}`}
            >
              <div className={styles.rowTop}>
                <h2 className={styles.itemTitle}>{post.title}</h2>
                <span className={styles.meta}>{formatDate(post.date)}</span>
              </div>
              {post.excerpt ? <p className={styles.body}>{post.excerpt}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
