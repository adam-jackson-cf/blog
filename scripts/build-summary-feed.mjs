import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { readResearchArticles, slugify } from "./research-article-utils.mjs";
import { readResearchNotes } from "./research-note-utils.mjs";

const STREAM_PRIORITY = {
  note: 0,
  article: 1,
  "blog-arxiv": 2,
  xdotcom: 3,
};

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

export async function buildSummaryFeed({ projectRoot = process.cwd() } = {}) {
  const sourceDir = path.join(projectRoot, "docs", "daily-source-scans");
  const articleDir = path.join(projectRoot, "content", "research-articles");
  const noteDir = path.join(projectRoot, "content", "research-notes");
  const outDir = path.join(projectRoot, "data");
  const outFile = path.join(outDir, "summary-feed.js");
  const daysByDate = new Map();

  for (const { date, fileName, target } of await readMatchedSummaryFiles(
    sourceDir,
  )) {
    const markdown = await readFile(path.join(sourceDir, fileName), "utf8");
    const summary = parseSummary(date, fileName, target, markdown);
    mergeSummary(daysByDate, summary);
  }

  for (const note of await readResearchNotes(noteDir)) {
    mergeSummary(daysByDate, {
      date: note.date,
      title: `Daily Source Summary - ${note.date}`,
      coverageNotes: [],
      items: [
        {
          id: note.noteId,
          title: note.title,
          summary: note.summary,
          bodyHtml: note.bodyHtml,
          sourceLinks: note.sourceLinks,
          sourceUrl: note.sourceUrl,
          sourceTitle: note.sourceTitle,
          sourceDomain: note.sourceDomain,
          previewImage: note.previewImage,
          screenshot: note.screenshot,
          favicon: note.favicon,
          capturedAt: note.capturedAt,
          stream: "note",
          streamLabel: "Research note",
        },
      ],
      sourceFiles: [
        {
          key: "note",
          label: "Research note",
          fileName: path.relative(projectRoot, note.filePath),
          title: note.title,
        },
      ],
    });
  }

  for (const article of await readResearchArticles(articleDir)) {
    mergeSummary(daysByDate, {
      date: article.date,
      title: `Daily Source Summary - ${article.date}`,
      coverageNotes: [],
      items: [
        {
          id: `${article.date}-article-${slugify(article.slug)}`,
          title: article.title,
          summary: article.summary,
          sourceLinks: [
            {
              label: "Article detail",
              url: article.routeHref,
            },
          ],
          stream: "article",
          streamLabel: "Article",
          href: article.routeHref,
        },
      ],
      sourceFiles: [
        {
          key: "article",
          label: "Article",
          fileName: article.fileName,
          title: article.title,
        },
      ],
    });
  }

  const days = Array.from(daysByDate.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(finalizeDay);

  const payload = {
    generatedAt: new Date().toISOString(),
    days,
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(
    outFile,
    `window.__DAILY_SUMMARY_FEED__ = ${JSON.stringify(payload, null, 2)};\n`,
    "utf8",
  );

  return { outFile, payload };
}

async function readMatchedSummaryFiles(sourceDir) {
  let fileNames = [];

  try {
    fileNames = await readdir(sourceDir);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  return fileNames
    .flatMap((fileName) => {
      const target = summaryTargets.find(({ filePattern }) =>
        filePattern.test(fileName),
      );
      if (!target) {
        return [];
      }

      const date = fileName.match(target.filePattern)?.[1];
      return date ? [{ date, fileName, target }] : [];
    })
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.fileName.localeCompare(b.fileName),
    );
}

function parseSummary(date, fileName, target, markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const title =
    lines
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() ?? date;

  if (title !== target.expectedTitle(date)) {
    throw new Error(
      `Unexpected summary title format in ${date} (${target.key}): "${title}"`,
    );
  }

  const coverageDetail =
    lines
      .find((line) => line.startsWith(target.coveragePrefix))
      ?.replace(target.coveragePrefix, "")
      .trim() ?? "";
  const selectedHeadingIndex = lines.findIndex(
    (line) => line.trim() === "## Selected items",
  );
  const nextHeadingIndex = lines.findIndex(
    (line, index) => index > selectedHeadingIndex && line.startsWith("## "),
  );
  const selectedSection =
    selectedHeadingIndex === -1
      ? []
      : lines.slice(
          selectedHeadingIndex + 1,
          nextHeadingIndex === -1 ? lines.length : nextHeadingIndex,
        );

  return {
    date,
    title: `Daily Source Summary - ${date}`,
    coverageNotes: coverageDetail
      ? [`${target.label}: ${coverageDetail.replace(/\.$/, "")}`]
      : [],
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
    items: [...day.items].sort(compareEntries),
    sources: [...day.sourceFiles].sort(compareSources),
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
      current.sourceLinks = parseSourceLinks(
        sourceMatch[1].trim(),
        current.sourceLinks,
      );
      continue;
    }

    const inlineSourceMatch = line.match(/\bSource:\s*(.+)$/);
    if (inlineSourceMatch) {
      current.sourceLinks = parseSourceLinks(
        inlineSourceMatch[1].trim(),
        current.sourceLinks,
      );
    }
  }

  if (current) {
    items.push(current);
  }

  return items;
}

function parseSourceLinks(value, existing = []) {
  const links = [...existing];

  if (!value) {
    return links;
  }

  const add = (parsed) => {
    if (
      parsed &&
      parsed.url &&
      !links.some((entry) => entry.url === parsed.url)
    ) {
      links.push(parsed);
    }
  };

  const markdownMatches = Array.from(
    value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g),
  );
  for (const match of markdownMatches) {
    add({ label: match[1].trim(), url: normalizeSourceUrl(match[2]) });
  }

  const stripped = value.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, " ");

  const urlMatches = stripped.match(/https?:\/\/[^\s,;]+/g) ?? [];
  for (const rawUrl of urlMatches) {
    const normalized = normalizeSourceUrl(rawUrl);
    add({ label: normalized || rawUrl, url: normalized });
  }

  const domainMatches =
    stripped.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;]*)?/gi) ?? [];
  for (const rawDomain of domainMatches) {
    if (/^https?:\/\//i.test(rawDomain)) {
      continue;
    }
    const normalized = normalizeSourceUrl(rawDomain);
    add({ label: rawDomain.trim(), url: normalized });
  }

  const handleMatches = Array.from(
    stripped.matchAll(/(^|[\s,;])@([a-z0-9_]{1,15})\b/gi),
  );
  for (const match of handleMatches) {
    const handle = match[2];
    add({ label: `@${handle}`, url: `https://x.com/${handle}` });
  }

  return links;
}

function compareEntries(a, b) {
  return (
    getStreamPriority(a?.stream) - getStreamPriority(b?.stream) ||
    String(b?.capturedAt || "").localeCompare(String(a?.capturedAt || "")) ||
    String(a?.title || "").localeCompare(String(b?.title || ""))
  );
}

function compareSources(a, b) {
  return (
    getStreamPriority(a?.key) - getStreamPriority(b?.key) ||
    String(a?.label || "").localeCompare(String(b?.label || ""))
  );
}

function getStreamPriority(key) {
  return STREAM_PRIORITY[key] ?? 99;
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

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await buildSummaryFeed();
}
