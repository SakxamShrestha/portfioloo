import styles from "../styles/books/books.module.css";

import books from "../data/books.json";

import Book from "../components/books/book";

export const metadata = {
  title: "Books | Sakxam Shrestha",
  description:
    "Explore the books I've read and get insights into the knowledge that shaped my journey.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Books | Sakxam Shrestha",
    description:
      "Explore the books I've read and get insights into the knowledge that shaped my journey.",
    url: "https://www.sakxamshrestha.com/books",
    siteName: "Sakxam Shrestha's Books",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        alt: "Sakxam Shrestha's Books",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Books | Sakxam Shrestha",
    description:
      "Explore the books I've read and get insights into the knowledge that shaped my journey.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/books",
  },
};

export default function Books() {
  return (
    <div className={styles.booksContainer}>
      <div className={`content ${styles.booksContent}`}>
        <h1 className={styles.booksTitle}>
          Collection of books that I&apos;ve read
        </h1>
        <div className={styles.booksList}>
          {books
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((book, index) => (
              <Book {...book} key={index} />
            ))}
        </div>
      </div>
    </div>
  );
}
