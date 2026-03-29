import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ARTICLE_FILE_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
export const ARTICLE_TOPIC_OPTIONS = [
  "Agents",
  "Computer Use",
  "Tool Use",
  "Planning & Orchestration",
  "Memory & Context",
  "Verification & Evaluation",
  "Code Review & Static Analysis",
  "Software Delivery & Design-to-Code",
];

export async function readResearchArticles(contentDir) {
  let fileNames = [];

  try {
    fileNames = await readdir(contentDir);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const matchedFiles = fileNames
    .flatMap((fileName) => {
      const match = fileName.match(ARTICLE_FILE_PATTERN);
      if (!match) {
        return [];
      }

      return [{ fileName, date: match[1], slugFromFile: match[2] }];
    })
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || a.fileName.localeCompare(b.fileName),
    );

  const articles = [];

  for (const { fileName, date, slugFromFile } of matchedFiles) {
    const filePath = path.join(contentDir, fileName);
    const raw = await readFile(filePath, "utf8");
    articles.push(
      parseResearchArticle({ raw, fileName, filePath, date, slugFromFile }),
    );
  }

  return articles;
}

export function parseResearchArticle({
  raw,
  fileName,
  filePath,
  date,
  slugFromFile,
}) {
  const { frontmatter, body } = splitFrontmatter(raw);
  const title =
    frontmatter.title || extractFirstHeading(body) || slugToTitle(slugFromFile);
  const slug = frontmatter.slug || slugFromFile;
  const description =
    frontmatter.description ||
    frontmatter.summary ||
    extractLeadParagraph(body) ||
    title;
  const summary = frontmatter.summary || description;
  const author = frontmatter.author || "Adam Jackson";
  const typeLabel = frontmatter.typeLabel || "Article";
  const publishedAt = frontmatter.date || date;
  const topics = normalizeTopics(frontmatter.topics);
  const headings = extractBodyHeadings(body, title);
  const { html: bodyHtml, mediaAssets } = renderMarkdownToHtml(body, {
    title,
    slug,
    filePath,
  });
  const readTimeMinutes = estimateReadTimeMinutes(body);

  return {
    fileName,
    filePath,
    slug,
    title,
    date: publishedAt,
    summary,
    description,
    author,
    typeLabel,
    topics,
    routePath: `/research/${slug}/`,
    routeHref: `./research/${slug}/`,
    headings,
    body,
    bodyHtml,
    mediaAssets,
    readTimeMinutes,
  };
}

export function renderMarkdownToHtml(
  markdown,
  { title = "", slug = "", filePath = "" } = {},
) {
  const normalized = String(markdown).replace(/\r\n/g, "\n").trim();
  const blocks = normalized.split(/\n\s*\n/);
  const html = [];
  const mediaAssets = [];
  let skippedTopHeading = false;

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      continue;
    }

    const headingMatch = lines[0].match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      if (!skippedTopHeading && level === 1 && (!title || text === title)) {
        skippedTopHeading = true;
        continue;
      }

      const id = level > 1 ? slugify(text) : "";
      const tagName = `h${level}`;
      html.push(
        `<${tagName}${id ? ` id="${escapeHtml(id)}"` : ""}>${renderInlineMarkdown(text)}</${tagName}>`,
      );
      continue;
    }

    const videoMatch = block
      .trim()
      .match(/^!video(?:\[([^\]]*)\])?\(([^)]+)\)$/i);
    if (videoMatch) {
      const media = resolveMediaReference(videoMatch[2], { slug, filePath });
      mediaAssets.push(...(media.asset ? [media.asset] : []));
      html.push(
        renderVideoFigure({
          caption: videoMatch[1]?.trim() || "",
          src: media.url,
        }),
      );
      continue;
    }

    const imageMatch = block.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const media = resolveMediaReference(imageMatch[2], { slug, filePath });
      mediaAssets.push(...(media.asset ? [media.asset] : []));
      html.push(
        renderImageFigure({ alt: imageMatch[1].trim(), src: media.url }),
      );
      continue;
    }

    if (lines.every((line) => /^-\s+/.test(line))) {
      html.push(
        `<ul>${lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^-\s+/, ""))}</li>`).join("")}</ul>`,
      );
      continue;
    }

    html.push(`<p>${renderInlineMarkdown(lines.join(" "))}</p>`);
  }

  return {
    html: html.join("\n"),
    mediaAssets: dedupeMediaAssets(mediaAssets),
  };
}

export function splitFrontmatter(raw) {
  const normalized = String(raw).replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {},
      body: normalized,
    };
  }

  const frontmatter = {};

  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    frontmatter[key] = stripOuterQuotes(value);
  }

  return {
    frontmatter,
    body: match[2].trim(),
  };
}

function stripOuterQuotes(value) {
  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function normalizeTopics(value) {
  return parseStringList(value).filter((topic) =>
    ARTICLE_TOPIC_OPTIONS.includes(topic),
  );
}

function parseStringList(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    return [];
  }

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  const separator = raw.includes("|") ? "|" : ",";
  return raw
    .split(separator)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function extractFirstHeading(markdown) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^#\s+/.test(line))
    ?.replace(/^#\s+/, "")
    .trim();
}

export function extractLeadParagraph(markdown) {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^#/.test(block) && !/^- /.test(block))
    ?.replace(/\s+/g, " ")
    .trim();
}

function extractBodyHeadings(markdown, title) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .flatMap((line) => {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (!match) {
        return [];
      }

      const level = match[1].length;
      const text = match[2].trim();
      if (!text || text === title) {
        return [];
      }

      return [{ id: slugify(text), text, level }];
    });
}

function estimateReadTimeMinutes(markdown) {
  const wordCount = String(markdown)
    .replace(/[#_*`>\-\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(wordCount / 220));
}

function renderInlineMarkdown(value) {
  const escaped = escapeHtml(value);
  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    );
}

function slugToTitle(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMediaReference(rawUrl, { slug = "", filePath = "" } = {}) {
  const cleaned = String(rawUrl).trim();
  if (!cleaned) {
    return { url: "" };
  }

  if (/^(https?:)?\/\//i.test(cleaned) || cleaned.startsWith("/")) {
    return { url: cleaned };
  }

  const normalizedSourcePath = cleaned.replace(/^\.\//, "");
  const sourcePath = path.join(path.dirname(filePath), normalizedSourcePath);
  const segments = normalizedSourcePath.split("/").filter(Boolean);

  if (segments[0] === "assets" && segments[1] === slug && segments.length > 2) {
    const outputRelativePath = segments.slice(2).join("/");
    return {
      url: `./assets/${outputRelativePath}`,
      asset: {
        sourcePath,
        outputRelativePath,
      },
    };
  }

  return { url: cleaned };
}

function renderImageFigure({ alt = "", src = "" }) {
  return `
    <figure class="article-media">
      <img class="article-media-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />
      ${alt ? `<figcaption class="article-media-caption">${escapeHtml(alt)}</figcaption>` : ""}
    </figure>
  `.trim();
}

function renderVideoFigure({ caption = "", src = "" }) {
  return `
    <figure class="article-media article-media-video-shell">
      <video class="article-media-video" controls preload="metadata" playsinline src="${escapeHtml(src)}"></video>
      ${caption ? `<figcaption class="article-media-caption">${escapeHtml(caption)}</figcaption>` : ""}
    </figure>
  `.trim();
}

function dedupeMediaAssets(assets) {
  const seen = new Set();
  return assets.filter((asset) => {
    const key = `${asset.sourcePath}::${asset.outputRelativePath}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
