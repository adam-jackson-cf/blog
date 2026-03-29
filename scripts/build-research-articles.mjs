import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { escapeHtml, renderPageShell } from "../src/ui.js";
import { readResearchArticles } from "./research-article-utils.mjs";

const projectRoot = process.cwd();
const contentDir = path.join(projectRoot, "content", "research-articles");
const researchRoot = path.join(projectRoot, "research");

const articles = await readResearchArticles(contentDir);

for (const article of articles) {
  const routeDir = path.join(researchRoot, article.slug);
  await mkdir(routeDir, { recursive: true });
  await copyArticleMedia(article, routeDir);
  await writeFile(path.join(routeDir, "index.html"), renderArticlePage(article), "utf8");
}

function renderArticlePage(article) {
  const canonicalPath = article.routePath;
  const pageTitle = `${article.title} | Research Feed`;
  const metaDescription = article.description;
  const articleTags = article.topics
    .map((topic) => `<meta property="article:tag" content="${escapeHtml(topic)}" />`)
    .join("\n    ");
  const tocMarkup =
    article.headings.length > 0
      ? `<nav class="article-toc" aria-label="Table of contents">
          <p class="article-meta-label">On This Page</p>
          <ol class="article-toc-list">
            ${article.headings
              .map(
                (heading, index) => `
                  <li class="article-toc-item article-toc-level-${heading.level}">
                    <a href="#${heading.id}"><span class="article-toc-index">${String(index + 1).padStart(2, "0")}</span>${escapeHtml(heading.text)}</a>
                  </li>
                `,
              )
              .join("")}
          </ol>
        </nav>`
      : "";
  const shell = renderPageShell({
    railBrand: article.title,
    railChip: "Adam Jackson Blog",
    headerDetail: `
      <div class="article-page-back-row">
        <a class="article-page-back-link" href="../../">Back to feed</a>
      </div>
    `,
    navActive: "feed",
    siteRoot: "../../",
    mainContent: `
      <section class="article-shell">
        <div class="article-grid">
          <aside class="article-sidebar">
            ${tocMarkup}
          </aside>
          <article class="article-main">
            <header class="article-header">
              <div class="article-summary-band">
                <p class="article-summary-label"><span class="article-kicker-dot" aria-hidden="true"></span>Article</p>
              </div>
            </header>
            <div class="article-content">
              ${article.bodyHtml}
            </div>
          </article>
        </div>
      </section>
    `,
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonicalPath)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Adam Jackson Blog" />
    <meta property="og:title" content="${escapeHtml(article.title)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:url" content="${escapeHtml(canonicalPath)}" />
    <meta property="article:published_time" content="${escapeHtml(article.date)}" />
    ${articleTags}
    <link rel="stylesheet" href="../../assets/site.css" />
  </head>
  <body class="article-detail-page">
    ${shell}
    <script>
      (function () {
        const root = document.documentElement;
        const chrome = document.querySelector(".page-chrome");
        const grid = document.querySelector(".article-grid");
        const shell = document.querySelector(".page-shell");

        const syncArticleLayout = () => {
          if (!chrome || !grid || !shell) {
            return;
          }

          const chromeHeight = chrome.getBoundingClientRect().height;
          const shellPaddingTop = parseFloat(window.getComputedStyle(shell).paddingTop) || 0;
          const sidebarTop = chromeHeight + shellPaddingTop;

          root.style.setProperty("--article-chrome-height", chromeHeight.toFixed(2) + "px");
          root.style.setProperty("--article-sidebar-top", sidebarTop.toFixed(2) + "px");
          root.style.setProperty("--article-main-min-height", "calc(100vh - " + chromeHeight.toFixed(2) + "px - 2rem)");
        };

        syncArticleLayout();
        window.addEventListener("resize", syncArticleLayout);
      })();
    </script>
  </body>
</html>
`;
}

async function copyArticleMedia(article, routeDir) {
  if (!Array.isArray(article.mediaAssets) || article.mediaAssets.length === 0) {
    return;
  }

  for (const asset of article.mediaAssets) {
    const outputPath = path.join(routeDir, "assets", asset.outputRelativePath);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await copyFile(asset.sourcePath, outputPath);
  }
}
