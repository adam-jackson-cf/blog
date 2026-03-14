import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "docs", "daily-source-scans");
const outDir = path.join(projectRoot, "data");
const outFile = path.join(outDir, "summary-feed.js");
const summaryTargets = [
  {
    key: "blog-arxiv",
    label: "Blog and arXiv summary",
    filePattern: /^(\d{4}-\d{2}-\d{2})-daily-blog-and-arxiv-summary\.md$/,
    expectedTitle: (date) => `Daily Blog and arXiv Summary - ${date}`,
    coveragePrefix: "Coverage window:",
  },
  {
    key: "xdotcom",
    label: "X.com summary",
    filePattern: /^(\d{4}-\d{2}-\d{2})-daily-xdotcom-summary\.md$/,
    expectedTitle: (date) => `Daily Grok Tech Summary - ${date}`,
    coveragePrefix: "Captured run:",
  },
];

const matchedFiles = (await readdir(sourceDir))
  .flatMap((fileName) => {
    const target = summaryTargets.find(({ filePattern }) => filePattern.test(fileName));
    if (!target) {
      return [];
    }

    const date = fileName.match(target.filePattern)?.[1];
    return date ? [{ date, fileName, target }] : [];
  })
  .sort((a, b) => b.date.localeCompare(a.date) || a.fileName.localeCompare(b.fileName));

const daysByDate = new Map();

for (const { date, fileName, target } of matchedFiles) {
  const markdown = await readFile(path.join(sourceDir, fileName), "utf8");
  const summary = parseSummary(date, fileName, target, markdown);
  mergeSummary(daysByDate, summary);
}

const days = Array.from(daysByDate.values())
  .sort((a, b) => b.date.localeCompare(a.date))
  .map(finalizeDay);

await mkdir(outDir, { recursive: true });
await writeFile(
  outFile,
  `window.__DAILY_SUMMARY_FEED__ = ${JSON.stringify({ generatedAt: new Date().toISOString(), days }, null, 2)};\n`,
  "utf8",
);

function parseSummary(date, fileName, target, markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() ?? date;
  if (title !== target.expectedTitle(date)) {
    throw new Error(`Unexpected summary title format in ${date} (${target.key}): "${title}"`);
  }
  const coverageDetail =
    lines.find((line) => line.startsWith(target.coveragePrefix))?.replace(target.coveragePrefix, "").trim() ?? "";
  const selectedHeadingIndex = lines.findIndex((line) => line.trim() === "## Selected items");
  const nextHeadingIndex = lines.findIndex((line, index) => index > selectedHeadingIndex && line.startsWith("## "));
  const selectedSection =
    selectedHeadingIndex === -1 ? [] : lines.slice(selectedHeadingIndex + 1, nextHeadingIndex === -1 ? lines.length : nextHeadingIndex);

  return {
    date,
    title: `Daily Source Summary - ${date}`,
    coverageNotes: coverageDetail ? [`${target.label}: ${coverageDetail.replace(/\.$/, "")}`] : [],
    items: parseItems(date, target, selectedSection),
    sourceFiles: [
      {
        key: target.key,
        label: target.label,
        fileName,
        title,
      },
    ],
  };
}

function mergeSummary(daysByDate, summary) {
  const existing = daysByDate.get(summary.date);
  if (!existing) {
    daysByDate.set(summary.date, summary);
    return;
  }

  existing.coverageNotes.push(...summary.coverageNotes);
  existing.items.push(...summary.items);
  existing.sourceFiles.push(...summary.sourceFiles);
}

function finalizeDay(day) {
  return {
    date: day.date,
    title: day.title,
    coverageWindow: day.coverageNotes.join(" | "),
    items: day.items,
    sources: day.sourceFiles,
  };
}

function parseItems(date, target, lines) {
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
        id: `${date}-${target.key}-${slugify(headingMatch[1])}`,
        title: headingMatch[1].trim(),
        summary: "",
        sourceLinks: [],
        stream: target.key,
        streamLabel: target.label,
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

    const sourceMatch = line.match(/^- Sources?:\s*(.+)$/);
    if (sourceMatch) {
      current.sourceLinks = parseSourceLinks(sourceMatch[1].trim(), current.sourceLinks);
      continue;
    }

    const inlineSourceMatch = line.match(/\bSource:\s*(.+)$/);
    if (inlineSourceMatch) {
      current.sourceLinks = parseSourceLinks(inlineSourceMatch[1].trim(), current.sourceLinks);
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

function parseSourceLinks(value, existing = []) {
  const links = [...existing];

  if (!value) {
    return links;
  }

  const add = (parsed) => {
    if (parsed && parsed.url && !links.some((entry) => entry.url === parsed.url)) {
      links.push(parsed);
    }
  };

  const markdownMatches = Array.from(value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g));
  for (const match of markdownMatches) {
    add({ label: match[1].trim(), url: normalizeSourceUrl(match[2]) });
  }

  const stripped = value.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, " ");

  const urlMatches = stripped.match(/https?:\/\/[^\s,;]+/g) ?? [];
  for (const rawUrl of urlMatches) {
    const normalized = normalizeSourceUrl(rawUrl);
    add({ label: normalized || rawUrl, url: normalized });
  }

  const domainMatches = stripped.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;]*)?/gi) ?? [];
  for (const rawDomain of domainMatches) {
    if (/^https?:\/\//i.test(rawDomain)) {
      continue;
    }
    const normalized = normalizeSourceUrl(rawDomain);
    add({ label: rawDomain.trim(), url: normalized });
  }

  const handleMatches = Array.from(stripped.matchAll(/(^|[\s,;])@([a-z0-9_]{1,15})\b/gi));
  for (const match of handleMatches) {
    const handle = match[2];
    add({ label: `@${handle}`, url: `https://x.com/${handle}` });
  }

  return links;
}

function normalizeSourceUrl(value) {
  if (!value) {
    return "";
  }

  const cleaned = value.trim().replace(/[)\].,;!?]+$/g, "");

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(cleaned)) {
    return `https://${cleaned}`;
  }

  return "";
}
