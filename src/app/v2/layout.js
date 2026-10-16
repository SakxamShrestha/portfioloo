import { DotGothic16, Space_Grotesk } from "next/font/google";

import "../styles/v2/tokens.css";

/**
 * v2 route layout.
 *
 * Self-contained: its own fonts, its own token scope, its own full-viewport
 * frame. The site header and footer are suppressed for this subtree by
 * ImmersiveGate in the root layout.
 */

// Dot-matrix display face, for headings, the HUD and every numeral. Bitmap
// type has no weight axis, which is authentic rather than a limitation.
const displayFont = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-v2-display",
});

// Geometric grotesque for prose: its forms rhyme with the pixel grid while
// staying readable at resume-bullet length.
const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-v2-body",
});

export const metadata = {
  title: "v2 | Sakxam Shrestha",
  description:
    "An in-progress interactive version of Sakxam Shrestha's portfolio.",
  // Unfinished and intentionally not a search result yet.
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches --void so mobile browser chrome does not clash with the board.
  themeColor: "#05060b",
};

export default function V2Layout({ children }) {
  return (
    <div className={`v2Root ${displayFont.variable} ${bodyFont.variable}`}>
      {children}
    </div>
  );
}
