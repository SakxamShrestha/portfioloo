import posts from "../../../../public/posts.json";

export function generateStaticParams() {
  return posts.map((post) => ({ id: post.slug }));
}

export default function BlogPostLayout({ children }) {
  return children;
}
