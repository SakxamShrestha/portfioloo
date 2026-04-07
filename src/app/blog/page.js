import Link from "next/link";

import { getBlogPosts } from "../../lib/getBlogPosts";
import styles from "../styles/blog/blog.module.css";

export const metadata = {
  title: "Blog | Sakxam Shrestha",
  description:
    "Read my thoughts on technology, books, and more.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Blog | Sakxam Shrestha",
    description:
      "Read my thoughts on technology, books, and more.",
    url: "https://www.sakxamshrestha.com/blog",
    siteName: "Sakxam Shrestha's Blog",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        alt: "Sakxam Shrestha's Blog",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Sakxam Shrestha",
    description:
      "Read my thoughts on technology, books, and more.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/blog",
  },
};

export default function Blog() {
  const blogPosts = getBlogPosts();
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className={styles.container}>
      <div className={`content ${styles.content}`}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <p className={styles.pageSubtitle}>
          Thoughts on technology, lessons learned, and more.
        </p>
        <ul className={styles.postList}>
          {sortedPosts.map((post) => {
            const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <li key={post.slug} className={styles.postItem}>
                <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                  <h2 className={styles.postTitle}>{post.title}</h2>
                </Link>
                <time className={styles.postDate}>{formattedDate}</time>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
