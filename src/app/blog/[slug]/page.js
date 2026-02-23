import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlogPosts } from "../../../lib/getBlogPosts";
import styles from "../../styles/books/books.module.css";

export async function generateStaticParams() {
  const blogPosts = getBlogPosts();
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blogPosts = getBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | Blog | Sakxam Shrestha`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.sakxamshrestha.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://www.sakxamshrestha.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const blogPosts = getBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.booksContainer}>
      <div className={`content ${styles.booksContent}`}>
        <p style={{ marginBottom: "0.5rem" }}>
          <Link href="/blog" style={{ opacity: 0.9, textDecoration: "underline" }}>
            ← Blog
          </Link>
        </p>
        <h1 className={styles.booksTitle} style={{ textAlign: "left", marginBottom: "0.25rem" }}>
          {post.title}
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          {formattedDate}
        </p>
        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
