import "./styles/global/globals.css";

import Header from "./components/global/header";
import Footer from "./components/global/footer";

import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12192b",
};

export const metadata = {
  title: "Portfolio | Sakxam Shrestha",
  description:
    "Welcome to my personal portfolio. Discover my skills, projects, interests, and experience.",
  creator: "Sakxam Shrestha",
  keywords: [
    "portfolio",
    "Sakxam Shrestha",
    "developer",
    "programming",
    "tech",
    "web development",
    "software engineer",
    "projects",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  category: "portfolio",
  openGraph: {
    title: "Sakxam Shrestha",
    description: "Sakxam Shrestha's Portfolio",
    url: "https://www.sakxamshrestha.com/",
    siteName: "Sakxam Shrestha",
    images: [
      {
        url: "https://www.sakxamshrestha.com/assets/openGraph/banner.png",
        width: 800,
        height: 600,
        type: "image/png",
        alt: "Blue text on dark background",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  appleWebApp: {
    title: "Sakxam Shrestha",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: [
      {
        url: "/favicon/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/favicon/favicon.ico",
        type: "image/x-icon",
      },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sakxam Shrestha",
    description: "Sakxam Shrestha's Portfolio",
    images: ["https://www.sakxamshrestha.com/assets/openGraph/banner.png"],
  },
  alternates: {
    canonical: "https://www.sakxamshrestha.com/",
  },
};

const structuredData = {
  "@context": "http://schema.org",
  "@type": "Person",
  name: "Sakxam Shrestha",
  url: "https://www.sakxamshrestha.com",
  description:
    "Hi, I'm Sakxam And I am a fullstack developer! I'm based in Nova Scotia, Canada, and I'm passionate about Math, Software Engineering, Gaming, and Jiu Jitsu.",
  sameAs: [
    "https://www.linkedin.com/in/sakxam-shrestha-3a817a237/",
  ],
  image: {
    "@type": "ImageObject",
    url: "https://www.sakxamshrestha.com/assets/welcome/aayush.webp",
  },
  jobTitle: "Fullstack Developer",
  worksFor: {
    "@type": "Organization",
    name: "Freelance",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1 (902)-789-4315",
    contactType: "Developer Support",
    areaServed: "Global",
    availableLanguage: "English",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Halifax",
    addressRegion: "Nova Scotia",
    addressCountry: "Canada",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <GoogleAnalytics gaId="G-ZSFY8QD3JM" />
        </ThemeProvider>
      </body>
    </html>
  );
}
