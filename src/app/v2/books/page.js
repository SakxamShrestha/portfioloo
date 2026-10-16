import Image from "next/image";

import books from "../../data/books.json";
import SectionShell from "../../components/v2/sectionShell";
import styles from "../../styles/v2/section.module.css";
import bookStyles from "../../styles/v2/books.module.css";

export const metadata = {
  title: "Books | v2",
  description: "Books I've read, in the v2 interface.",
  robots: { index: false, follow: false },
};

export default function V2BooksPage() {
  return (
    <SectionShell
      title="Books"
      lede="What I've been reading away from a screen."
      count={`${books.length} books`}
    >
      <div className={bookStyles.shelf}>
        {books.map((book) => (
          <article key={book.title} className={bookStyles.book}>
            <a
              href={book.bookLink}
              target="_blank"
              rel="noopener noreferrer"
              className={bookStyles.coverLink}
            >
              <Image
                className={bookStyles.cover}
                src={book.cover}
                alt={`${book.title} cover`}
                width={200}
                height={300}
              />
            </a>

            <h2 className={bookStyles.bookTitle}>{book.title}</h2>

            <a
              className={styles.cardLink}
              href={book.authorLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {book.author}
            </a>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
