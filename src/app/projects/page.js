import Projects from "../components/home/projectsSection";
import projects from "../data/projects.json";

export const metadata = {
  title: "Projects | Sakxam Shrestha",
  description:
    "Explore my software and ML projects, from NLP to deep learning and full-stack applications.",
  creator: "Sakxam Shrestha",
  openGraph: {
    title: "Projects | Sakxam Shrestha",
    description:
      "Explore my software and ML projects, from NLP to deep learning and full-stack applications.",
    url: "https://www.sakxamshrestha.com/projects",
    siteName: "Sakxam Shrestha's Projects",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        alt: "Sakxam Shrestha's Projects",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Sakxam Shrestha",
    description:
      "Explore my software and ML projects, from NLP to deep learning and full-stack applications.",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/projects",
  },
};

export default function ProjectsPage() {
  return <Projects projects={projects} />;
}
