import Link from "next/link";

import { getBlogPosts } from "../../lib/getBlogPosts";
import styles from "../styles/books/books.module.css";

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
    <div className={styles.booksContainer}>
      <div className={`content ${styles.booksContent}`}>
        <h1 className={styles.booksTitle}>Blog</h1>
        <p style={{ marginTop: "1rem", marginBottom: "2rem", opacity: 0.9 }}>
          Thoughts on technology, lessons learned, and more.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}>
          {sortedPosts.map((post) => {
            const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <li
                key={post.slug}
                style={{
                  marginBottom: "2rem",
                  paddingBottom: "2rem",
                  borderBottom: "1px solid var(--blog-post-border, #3e454b)",
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      marginBottom: "0.35rem",
                      textDecoration: "underline",
                      textUnderlineOffset: "0.2em",
                    }}
                  >
                    {post.title}
                  </h2>
                </Link>
                <time
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.8,
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  {formattedDate}
                </time>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem" }}>
                  {post.excerpt}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
