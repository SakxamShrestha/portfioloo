import BlogList from "../components/blog/blogList";

export const metadata = {
  title: "Blog | Sakxam Shrestha",
  description:
    "Browse my stories ranging from life to technology to anything I desire to write about.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Blog | Sakxam Shrestha",
    description:
      "Browse my stories ranging from life to technology to anything I desire to write about.",
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
      "Browse my stories ranging from life to technology to anything I desire to write about.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/blog",
  },
};

export default function Blog() {
  return <BlogList />;
}
