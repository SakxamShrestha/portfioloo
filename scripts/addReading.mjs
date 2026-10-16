/**
 * Appends an entry to src/app/data/readingList.json.
 *
 * Invoked by .github/workflows/add-reading.yml from a repository_dispatch
 * event, so the JSON is always written by this script rather than by the
 * phone — a malformed payload fails here instead of breaking the build.
 *
 * Reads the payload from the READING_PAYLOAD env var:
 *   { url, title?, author?, note?, tags? }
 * Only `url` is required; the title falls back to the page's <title>.
 */

import fs from "fs";
import path from "path";

const LIST_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "data",
  "readingList.json"
);

function fail(message) {
  console.error(`addReading: ${message}`);
  process.exit(1);
}

function parsePayload() {
  const raw = process.env.READING_PAYLOAD;
  if (!raw) fail("READING_PAYLOAD is empty");

  try {
    return JSON.parse(raw);
  } catch {
    fail("READING_PAYLOAD is not valid JSON");
  }
}

function normalizeUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    fail("payload is missing a url");
  }

  try {
    return new URL(value.trim());
  } catch {
    fail(`"${value}" is not a valid url`);
  }
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function fetchTitle(url) {
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "sakxamshrestha.com reading-list bot" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!match) return null;

    return decodeEntities(match[1]).replace(/\s+/g, " ").trim() || null;
  } catch (error) {
    console.warn(`addReading: could not fetch title (${error.message})`);
    return null;
  }
}

const payload = parsePayload();
const url = normalizeUrl(payload.url);

const list = JSON.parse(fs.readFileSync(LIST_PATH, "utf8"));
if (!Array.isArray(list)) fail("readingList.json is not an array");

if (list.some((entry) => entry.url === url.href)) {
  console.log(`addReading: ${url.href} is already logged, nothing to do`);
  process.exit(0);
}

const providedTitle =
  typeof payload.title === "string" ? payload.title.trim() : "";
const title = providedTitle || (await fetchTitle(url.href)) || url.href;

const entry = {
  title,
  url: url.href,
  source: url.hostname.replace(/^www\./, ""),
  author: typeof payload.author === "string" ? payload.author.trim() : "",
  date: new Date().toISOString().slice(0, 10),
  tags: normalizeTags(payload.tags),
  note: typeof payload.note === "string" ? payload.note.trim() : "",
};

list.unshift(entry);

fs.writeFileSync(LIST_PATH, `${JSON.stringify(list, null, 2)}\n`);
console.log(`addReading: logged "${entry.title}" (${entry.source})`);
