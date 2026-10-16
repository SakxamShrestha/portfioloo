/**
 * The v2 section routes, in nav order.
 *
 * Plain module rather than part of a client component, so server components
 * (the flat fallback, the section shell) and client components (the HUD, the
 * nav) can all share one list instead of keeping parallel copies.
 */
export const V2_SECTIONS = Object.freeze([
  Object.freeze({ href: "/v2/projects", label: "Projects" }),
  Object.freeze({ href: "/v2/blog", label: "Blog" }),
  Object.freeze({ href: "/v2/reading", label: "Reading" }),
  Object.freeze({ href: "/v2/books", label: "Books" }),
  Object.freeze({ href: "/v2/resume", label: "Resume" }),
]);
