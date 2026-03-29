import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  extractLeadParagraph,
  renderMarkdownToHtml,
  splitFrontmatter,
  slugify,
} from "./research-article-utils.mjs";

const NOTE_FILE_NAME = "note.md";
const DATE_SEGMENT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function readResearchNotes(contentDir) {
  let dateEntries = [];

  try {
    dateEntries = await readdir(contentDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const matchedDateEntries = dateEntries
    .filter(
      (entry) => entry.isDirectory() && DATE_SEGMENT_PATTERN.test(entry.name),
    )
    .sort((a, b) => b.name.localeCompare(a.name));

  const notes = [];

  for (const dateEntry of matchedDateEntries) {
    const date = dateEntry.name;
    const dateDir = path.join(contentDir, date);
    let noteEntries = [];

    try {
      noteEntries = await readdir(dateDir, { withFileTypes: true });
    } catch (error) {
      if (error && error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    for (const noteEntry of noteEntries
      .filter((entry) => entry.isDirectory())
      .sort((a, b) => b.name.localeCompare(a.name))) {
      const filePath = path.join(dateDir, noteEntry.name, NOTE_FILE_NAME);
      let raw;

      try {
        raw = await readFile(filePath, "utf8");
      } catch (error) {
        if (error && error.code === "ENOENT") {
          continue;
        }
        throw error;
      }

      notes.push(
        parseResearchNote({
          raw,
          filePath,
          date,
          noteFolder: noteEntry.name,
        }),
      );
    }
  }

  return notes.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      String(b.capturedAt || "").localeCompare(String(a.capturedAt || "")) ||
      String(a.noteId).localeCompare(String(b.noteId)),
  );
}

export function parseResearchNote({ raw, filePath, date, noteFolder }) {
  const { frontmatter, body } = splitFrontmatter(raw);
  const sourceUrl = normalizeAbsoluteUrl(frontmatter.sourceUrl);
  const title =
    frontmatter.title || frontmatter.sourceTitle || slugToTitle(noteFolder);
  const summary = frontmatter.summary || extractLeadParagraph(body) || title;
  const sourceTitle = frontmatter.sourceTitle || title;
  const sourceDomain = frontmatter.sourceDomain || getDomainLabel(sourceUrl);
  const screenshot = normalizePublicAssetPath(frontmatter.screenshot);
  const previewImage = normalizePublicAssetPath(frontmatter.previewImage);
  const favicon = normalizePublicAssetPath(frontmatter.favicon);
  const { html: bodyHtml } = renderMarkdownToHtml(body, { title });

  return {
    filePath,
    fileName: path.basename(filePath),
    noteFolder,
    noteId: `${date}-${noteFolder}`,
    title,
    date: frontmatter.date || date,
    capturedAt: frontmatter.capturedAt || `${date}T00:00:00`,
    summary,
    sourceUrl,
    sourceTitle,
    sourceDomain,
    screenshot,
    previewImage,
    favicon,
    body,
    bodyHtml,
    sourceLinks: sourceUrl
      ? [
          {
            label: sourceTitle || sourceDomain || sourceUrl,
            url: sourceUrl,
          },
        ]
      : [],
  };
}

export function validateResearchNoteCapture(input, { now = new Date() } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Capture payload must be a JSON object.");
  }

  const capturedAt = parseCaptureDate(input.capturedAt) ?? now;
  const sourceUrl =
    normalizeAbsoluteUrl(
      firstNonEmpty(input.sourceUrl, input.canonicalUrl, input.pageUrl),
    ) || "";

  if (!sourceUrl) {
    throw new Error("Capture payload must include a valid source URL.");
  }

  const sourceTitle =
    collapseWhitespace(
      firstNonEmpty(input.sourceTitle, input.pageTitle, input.title),
    ) || getDomainLabel(sourceUrl);
  const title =
    collapseWhitespace(firstNonEmpty(input.title, sourceTitle)) ||
    getDomainLabel(sourceUrl) ||
    "Untitled note";
  const body = normalizeMultiline(
    firstNonEmpty(input.body, input.selectedText),
  );
  const summary =
    collapseWhitespace(
      firstNonEmpty(input.summary, input.sourceDescription, input.description),
    ) ||
    collapseWhitespace(extractLeadParagraph(body)) ||
    title;

  return {
    title,
    summary,
    body,
    sourceUrl,
    sourceTitle,
    sourceDomain:
      collapseWhitespace(firstNonEmpty(input.sourceDomain)) ||
      getDomainLabel(sourceUrl),
    capturedAt: capturedAt.toISOString(),
    screenshotDataUrl: normalizeDataUrl(firstNonEmpty(input.screenshotDataUrl)),
    previewImageUrl: normalizeAbsoluteUrl(firstNonEmpty(input.previewImageUrl)),
    faviconUrl: normalizeAbsoluteUrl(firstNonEmpty(input.faviconUrl)),
    htmlSnapshot: normalizeMultiline(firstNonEmpty(input.htmlSnapshot)),
    author: collapseWhitespace(firstNonEmpty(input.author)),
    publisher: collapseWhitespace(firstNonEmpty(input.publisher)),
    canonicalUrl:
      normalizeAbsoluteUrl(firstNonEmpty(input.canonicalUrl)) || sourceUrl,
    selectedText: normalizeMultiline(firstNonEmpty(input.selectedText)),
  };
}

export async function saveResearchNoteCapture({
  projectRoot,
  capture,
  now = new Date(),
}) {
  const normalized = validateResearchNoteCapture(capture, { now });
  const captureDate = new Date(normalized.capturedAt);
  const { date, time } = getLocalTimestampParts(captureDate);
  const noteSlug = createNoteSlug(
    normalized.title,
    normalized.sourceTitle,
    normalized.sourceDomain,
  );
  const noteFolder = `${time}-${noteSlug}`;
  const noteId = `${date}-${noteFolder}`;
  const noteDir = path.join(
    projectRoot,
    "content",
    "research-notes",
    date,
    noteFolder,
  );
  const publicDir = path.join(
    projectRoot,
    "assets",
    "research-notes",
    date,
    noteFolder,
  );
  const cacheDir = path.join(projectRoot, ".cache", "research-notes", noteId);

  await Promise.all([
    mkdir(noteDir, { recursive: true }),
    mkdir(publicDir, { recursive: true }),
    mkdir(cacheDir, { recursive: true }),
  ]);

  const assetErrors = [];
  const publicPaths = {
    screenshot: "",
    previewImage: "",
    favicon: "",
  };

  if (normalized.screenshotDataUrl) {
    const screenshotAsset = writeDataUrlAsset(
      normalized.screenshotDataUrl,
      publicDir,
      "screenshot",
    );
    publicPaths.screenshot = toPublicAssetPath(
      date,
      noteFolder,
      await screenshotAsset,
    );
  }

  const previewResult = await saveRemoteAsset({
    url: normalized.previewImageUrl,
    publicDir,
    fileStem: "preview",
  }).catch((error) => {
    if (normalized.previewImageUrl) {
      assetErrors.push(`Preview image: ${error.message}`);
    }
    return "";
  });

  if (previewResult) {
    publicPaths.previewImage = toPublicAssetPath(
      date,
      noteFolder,
      previewResult,
    );
  }

  const faviconResult = await saveRemoteAsset({
    url: normalized.faviconUrl,
    publicDir,
    fileStem: "favicon",
  }).catch((error) => {
    if (normalized.faviconUrl) {
      assetErrors.push(`Favicon: ${error.message}`);
    }
    return "";
  });

  if (faviconResult) {
    publicPaths.favicon = toPublicAssetPath(date, noteFolder, faviconResult);
  }

  const markdown = serializeResearchNote({
    title: normalized.title,
    date,
    capturedAt: normalized.capturedAt,
    summary: normalized.summary,
    sourceUrl: normalized.sourceUrl,
    sourceTitle: normalized.sourceTitle,
    sourceDomain: normalized.sourceDomain,
    screenshot: publicPaths.screenshot,
    previewImage: publicPaths.previewImage,
    favicon: publicPaths.favicon,
    body: normalized.body,
  });

  const noteFile = path.join(noteDir, NOTE_FILE_NAME);
  await Promise.all([
    writeFile(noteFile, markdown, "utf8"),
    writeFile(
      path.join(cacheDir, "capture.json"),
      JSON.stringify(normalized, null, 2),
      "utf8",
    ),
    writeFile(
      path.join(cacheDir, "meta.json"),
      JSON.stringify({ noteId, noteFile, publicPaths, assetErrors }, null, 2),
      "utf8",
    ),
  ]);

  if (normalized.htmlSnapshot) {
    await writeFile(
      path.join(cacheDir, "page.html"),
      normalized.htmlSnapshot,
      "utf8",
    );
  }

  return {
    noteId,
    date,
    noteFolder,
    noteFile,
    cacheDir,
    publicPaths,
    assetErrors,
    capture: normalized,
  };
}

export function serializeResearchNote({
  title,
  date,
  capturedAt,
  summary,
  sourceUrl,
  sourceTitle,
  sourceDomain,
  screenshot,
  previewImage,
  favicon,
  body = "",
}) {
  const frontmatterEntries = [
    ["title", title],
    ["date", date],
    ["capturedAt", capturedAt],
    ["summary", summary],
    ["sourceUrl", sourceUrl],
    ["sourceTitle", sourceTitle],
    ["sourceDomain", sourceDomain],
    ["screenshot", screenshot],
    ["previewImage", previewImage],
    ["favicon", favicon],
  ].filter(([, value]) => typeof value === "string" && value.trim());

  const frontmatter = frontmatterEntries
    .map(([key, value]) => `${key}: "${escapeFrontmatterValue(value)}"`)
    .join("\n");

  const bodyContent = String(body || "").trim();
  return `---\n${frontmatter}\n---\n\n${bodyContent}${bodyContent ? "\n" : ""}`;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeMultiline(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function collapseWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAbsoluteUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(String(value).trim());
    return url.href;
  } catch {
    return "";
  }
}

function normalizeDataUrl(value) {
  if (!value) {
    return "";
  }

  return /^data:[^;,]+;base64,[a-z0-9+/=\s]+$/i.test(String(value).trim())
    ? String(value).trim()
    : "";
}

function parseCaptureDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function createNoteSlug(...values) {
  const slug = slugify(
    values.find((value) => typeof value === "string" && value.trim()) || "note",
  );
  return slug.slice(0, 72) || "note";
}

function slugToTitle(value) {
  return String(value)
    .replace(/^\d{6}-/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function getDomainLabel(value) {
  try {
    return new URL(String(value)).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function getLocalTimestampParts(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}${minutes}${seconds}`,
  };
}

async function writeDataUrlAsset(dataUrl, publicDir, fileStem) {
  const match = String(dataUrl).match(/^data:([^;,]+);base64,([\s\S]+)$/i);
  if (!match) {
    throw new Error("Invalid data URL asset.");
  }

  const fileName = `${fileStem}${extensionFromMimeType(match[1])}`;
  const targetPath = path.join(publicDir, fileName);
  await writeFile(targetPath, Buffer.from(match[2], "base64"));
  return fileName;
}

async function saveRemoteAsset({ url, publicDir, fileStem }) {
  if (!url) {
    return "";
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`download failed with ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "";
  const fileName = `${fileStem}${extensionFromRemoteAsset(url, contentType)}`;
  await writeFile(path.join(publicDir, fileName), Buffer.from(arrayBuffer));
  return fileName;
}

function extensionFromRemoteAsset(url, contentType) {
  const fromType = extensionFromMimeType(contentType);
  if (fromType !== ".bin") {
    return fromType;
  }

  try {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname);
    return extension || ".bin";
  } catch {
    return ".bin";
  }
}

function extensionFromMimeType(value) {
  const mimeType = String(value || "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      return ".ico";
    case "text/html":
      return ".html";
    default:
      return ".bin";
  }
}

function toPublicAssetPath(date, noteFolder, fileName) {
  return fileName
    ? `/assets/research-notes/${date}/${noteFolder}/${fileName}`
    : "";
}

function normalizePublicAssetPath(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function escapeFrontmatterValue(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n");
}
