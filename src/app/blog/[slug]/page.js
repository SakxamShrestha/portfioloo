import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlogPosts } from "../../../lib/getBlogPosts";
import styles from "../../styles/blog/blog.module.css";

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
    <div className={styles.container}>
      <div className={`content ${styles.content}`}>
        <Link href="/blog" className={styles.backLink}>
          ← Blog
        </Link>
        <h1 className={styles.postPageTitle}>{post.title}</h1>
        <time className={styles.postPageDate}>{formattedDate}</time>
        <article
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
}
