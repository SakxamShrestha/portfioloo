import fs from "fs";
import path from "path";

const BLOG_PATH = path.join(process.cwd(), "public", "assets", "blog", "blog.json");

export function getBlogPosts() {
  const json = fs.readFileSync(BLOG_PATH, "utf8");
  return JSON.parse(json);
}
