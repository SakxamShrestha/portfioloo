/** @type {import('next-sitemap').IConfig} */
const siteUrl = "https://www.sakxamshrestha.com/";

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  changefreq: "monthly",
  priority: 0.7,
  sitemapSize: 5000,

  exclude: ["/blog", "/books", "/resume", "/"],

  additionalPaths: async () => {
    const additionalPaths = ["/", "/blog", "/books", "/resume"];

    return additionalPaths.map((p) => ({
      loc: `${siteUrl}${p === "/" ? "" : p}`,
      lastmod: new Date().toISOString(),
      changefreq: "monthly",
      priority: p === "/" ? 1.0 : 0.7,
    }));
  },
};
