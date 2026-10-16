/** @type {import('next-sitemap').IConfig} */
const siteUrl = "https://www.sakxamshrestha.com/";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  changefreq: "monthly",
  priority: 0.7,
  sitemapSize: 5000,

  // "/v2" is unfinished and marked noindex in its layout; keeping it out of
  // the sitemap stops the two signals contradicting each other.
  exclude: [
    "/blog",
    "/projects",
    "/books",
    "/reading",
    "/resume",
    "/",
    "/v2",
    // A bare "/v2" does not match its children, so the subtree is listed too.
    "/v2/*",
  ],

  additionalPaths: async () => {
    const additionalPaths = [
      "/",
      "/blog",
      "/projects",
      "/books",
      "/reading",
      "/resume",
    ];

    return additionalPaths.map((p) => ({
      loc: `${siteUrl}${p === "/" ? "" : p}`,
      lastmod: new Date().toISOString(),
      changefreq: "monthly",
      priority: p === "/" ? 1.0 : 0.7,
    }));
  },
};
