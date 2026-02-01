import { marked } from "marked";
import { notFound } from "next/navigation";
import posts from "../../../../public/posts.json";

import BackToTopButton from "@/app/components/blog/backToTopButton";
import TableOfContents from "@/app/components/blog/TableOfContents";

import styles from "../../styles/blog/blogPost.module.css";

function slugify(anyText) {
  const text = (anyText ?? "").toString().replace(/\s+/g, " ").trim();
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getTocFromMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      headings.push({
        text: trimmed.slice(2).trim(),
        depth: 1,
        id: slugify(trimmed.slice(2).trim()),
      });
    } else if (trimmed.startsWith("## ")) {
      headings.push({
        text: trimmed.slice(3).trim(),
        depth: 2,
        id: slugify(trimmed.slice(3).trim()),
      });
    } else if (trimmed.startsWith("### ")) {
      headings.push({
        text: trimmed.slice(4).trim(),
        depth: 3,
        id: slugify(trimmed.slice(4).trim()),
      });
    }
  });

  return headings.filter((h) => h.depth >= 1 && h.depth <= 4);
}

export async function generateStaticParams() {
  const posts = require("../../../../public/posts.json");
  return posts.map((post) => ({ id: post.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const post = posts.find((p) => p.slug === id);

  if (!post) {
    return {
      title: "Post not Found | Sakxam Shrestha",
      description: "The requested blog post could not be found",
    };
  }

  return {
    metadataBase: new URL("https://sakxamshrestha.com"),
    title: `${post.meta.title} | Sakxam Shrestha`,
    authors: [{ name: "Sakxam Shrestha" }],
    description: post.meta.description,
    keywords: post.meta.keywords,
    openGraph: {
      locale: "en_US",
      title: `${post.meta.title} | Sakxam Shrestha`,
      description: post.meta.description,
      type: "article",
      publishedTime: post.meta.date,
      url: `https://www.sakxamshrestha.com/blog/${id}`,
      images: [
        {
          url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
          width: 800,
          height: 600,
          alt: "Sakxam Shrestha's Blog Post",
        },

      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.meta.title} | Sakxam Shrestha`,
      description: post.meta.description,
      images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
    },
    alternates: {
      canonical: `https://www.sakxamshrestha.com/blog/${id}`,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const post = posts.find((p) => p.slug === id);
  if (!post) return notFound();

  const toc = getTocFromMarkdown(post.content);

  let htmlContent = marked.parse(post.content);
  htmlContent = htmlContent.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" '
  );

  return (
    <div className={styles.blogPostContainer}>
      <div className={`content ${styles.blogPostContentContainer}`}>
        <div className={styles.blogPostContent}>
          <div className={styles.details}>
            <h1 className={`${styles.text} ${styles.title}`}>
              {post.meta.title}
            </h1>
            <p className={styles.text}>{post.meta.date}</p>
          </div>
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          <BackToTopButton />
        </div>
        {toc.length >= 2 && (
          <aside className={styles.blogPostToc}>
            <TableOfContents items={toc} postId={post.slug} />
          </aside>
        )}
      </div>
    </div>
  );
}
