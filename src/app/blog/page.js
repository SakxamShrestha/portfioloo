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
  return (
    <div className={styles.booksContainer}>
      <div className={`content ${styles.booksContent}`}>
        <h1 className={styles.booksTitle}>Blog</h1>
        <p style={{ marginTop: "1rem", opacity: 0.9 }}>
          Posts coming soon.
        </p>
      </div>
    </div>
  );
}
