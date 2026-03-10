import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "docs", "daily-source-scans");
const outDir = path.join(projectRoot, "data");
const outFile = path.join(outDir, "summary-feed.js");
const filePattern = /^(\d{4}-\d{2}-\d{2})-daily-blog-and-arxiv-summary\.md$/;

const files = (await readdir(sourceDir))
  .filter((name) => filePattern.test(name))
  .sort((a, b) => b.localeCompare(a));

const days = [];

for (const fileName of files) {
  const date = fileName.match(filePattern)?.[1];
  if (!date) {
    continue;
  }

  const markdown = await readFile(path.join(sourceDir, fileName), "utf8");
  const summary = parseSummary(date, markdown);
  days.push(summary);
}

await mkdir(outDir, { recursive: true });
await writeFile(
  outFile,
  `window.__DAILY_SUMMARY_FEED__ = ${JSON.stringify({ generatedAt: new Date().toISOString(), days }, null, 2)};\n`,
  "utf8",
);

function parseSummary(date, markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() ?? date;
  if (title !== `Daily Blog and arXiv Summary - ${date}`) {
    throw new Error(`Unexpected summary title format in ${date}: "${title}"`);
  }
  const coverageWindow =
    lines.find((line) => line.startsWith("Coverage window:"))?.replace(/^Coverage window:\s*/, "").trim() ?? "";
  const selectedHeadingIndex = lines.findIndex((line) => line.trim() === "## Selected items");
  const nextHeadingIndex = lines.findIndex((line, index) => index > selectedHeadingIndex && line.startsWith("## "));
  const selectedSection =
    selectedHeadingIndex === -1 ? [] : lines.slice(selectedHeadingIndex + 1, nextHeadingIndex === -1 ? lines.length : nextHeadingIndex);

  return {
    date,
    title,
    coverageWindow: coverageWindow.replace(/\.$/, ""),
    items: parseItems(date, selectedSection),
  };
}

function parseItems(date, lines) {
  const items = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const headingMatch = line.match(/^###\s+\d+\)\s+(.+)$/);
    if (headingMatch) {
      if (current) {
        items.push(current);
      }
      current = {
        id: `${date}-${slugify(headingMatch[1])}`,
        title: headingMatch[1].trim(),
        summary: "",
        source: "",
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const summaryMatch = line.match(/^- What happened:\s*(.+)$/);
    if (summaryMatch) {
      current.summary = summaryMatch[1].trim();
      continue;
    }

    const sourceMatch = line.match(/^- Source:\s*(.+)$/);
    if (sourceMatch) {
      current.source = sourceMatch[1].trim();
    }
  }

  if (current) {
    items.push(current);
  }

  return items;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
