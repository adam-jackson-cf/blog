const PAGE_SIZE = 7;
const app = document.querySelector("#app");

const feed = window.__DAILY_SUMMARY_FEED__;

if (!app) {
  throw new Error("App root not found.");
}

if (!feed || !Array.isArray(feed.days)) {
  app.innerHTML = renderEmptyState("Summary feed not found. Run `bun run build` to generate the page data.");
} else {
  createBlog(app, feed.days);
}

function createBlog(root, days) {
  let visibleDays = Math.min(PAGE_SIZE, days.length);

  root.innerHTML = `
    <main class="page-shell">
      <header class="masthead">
        <div class="masthead-grid">
          <div class="space-y-4">
            <h1 class="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Daily summary blog
            </h1>
            <p class="lede">
              Selected items from the daily blog, arXiv, and X.com scans, sourced from
              <code class="inline-code">docs/daily-source-scans</code>.
            </p>
          </div>
          <dl class="stats" aria-label="Feed summary">
            ${renderStat("Days available", String(days.length))}
            ${renderStat(
              "Selected items",
              String(days.reduce((count, day) => count + day.items.length, 0)),
            )}
            ${renderStat("Batch size", "7 days")}
          </dl>
        </div>
      </header>
      <section id="day-feed" class="day-stack"></section>
      <div id="feed-sentinel" class="h-10 w-full"></div>
      <footer id="feed-footer" class="feed-footer pb-8 text-center"></footer>
    </main>
  `;

  const dayFeed = root.querySelector("#day-feed");
  const sentinel = root.querySelector("#feed-sentinel");
  const footer = root.querySelector("#feed-footer");

  const render = () => {
    dayFeed.innerHTML = days.slice(0, visibleDays).map(renderDay).join("");
    footer.innerHTML =
      visibleDays < days.length
        ? `Showing <span class="font-semibold text-foreground">${visibleDays}</span> of <span class="font-semibold text-foreground">${days.length}</span> days. Scroll for seven more.`
        : `Showing all <span class="font-semibold text-foreground">${days.length}</span> available days.`;
  };

  render();

  if (visibleDays >= days.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) {
        return;
      }
      visibleDays = Math.min(visibleDays + PAGE_SIZE, days.length);
      render();
      if (visibleDays >= days.length) {
        observer.disconnect();
      }
    },
    { rootMargin: "720px 0px" },
  );

  observer.observe(sentinel);
}

function renderDay(day) {
  return `
    <section class="day-section space-y-4">
      <div class="day-header">
        <div class="space-y-1">
          <h2 class="text-2xl font-semibold tracking-tight text-foreground">${formatDate(day.date)}</h2>
          <p class="day-meta">${escapeHtml(day.coverageWindow || "Coverage window unavailable")}</p>
        </div>
        <p class="day-count">${day.items.length ? `${day.items.length} item${day.items.length === 1 ? "" : "s"}` : "No selected items"}</p>
      </div>
      ${
        day.items.length
          ? `<div class="collection"><div class="item-grid">${day.items.map(renderItem).join("")}</div></div>`
          : `<article class="surface p-6 empty-note">No selected items were published into this summary.</article>`
      }
    </section>
  `;
}

function renderItem(item) {
  const sourceMarkup = renderSourceLinks(getItemSourceLinks(item));

  return `
    <article class="item-card">
      <div class="space-y-3">
        <p class="empty-note">${escapeHtml(item.streamLabel || "Summary item")}</p>
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
      </div>
      <div class="source-row">
        ${sourceMarkup || `<span class="empty-note">No source link recorded.</span>`}
      </div>
    </article>
  `;
}

function renderStat(label, value) {
  return `
    <div class="stat">
      <dt class="stat-label">${label}</dt>
      <dd class="stat-value">${value}</dd>
    </div>
  `;
}

function renderEmptyState(message) {
  return `
    <main class="empty-state">
      <section class="surface w-full p-8 text-center">
        <h1 class="text-3xl font-semibold tracking-tight text-foreground">Nothing to show yet</h1>
        <p class="mt-3 text-base text-muted-foreground">${escapeHtml(message)}</p>
      </section>
    </main>
  `;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function renderSourceLinks(links) {
  if (!Array.isArray(links) || links.length === 0) {
    return "";
  }

  const count = links.length;
  const linksMarkup = links
    .map((link, index) => {
      const href = escapeAttribute(link.url ?? "");
      const text = escapeHtml(link.label ?? "");
      const label = text || href;
      if (!href) {
        return "";
      }

      return `<a class="source-link" href="${href}" target="_blank" rel="noreferrer">${label}<span aria-hidden="true">↗</span></a>`;
    })
    .filter(Boolean)
    .join(count > 1 ? " <span class=\"empty-note\">·</span> " : "");

  if (!linksMarkup) {
    return "";
  }

  const prefix = count === 1 ? "Source:" : "Sources:";
  return `<span class="empty-note">${prefix} ${linksMarkup}</span>`;
}

function getItemSourceLinks(item) {
  if (Array.isArray(item?.sourceLinks) && item.sourceLinks.length) {
    return item.sourceLinks;
  }

  const links = [];
  const seen = new Set();
  const add = (label, url) => {
    const href = normalizeSourceUrl(url);
    if (!href || seen.has(href)) {
      return;
    }
    seen.add(href);
    links.push({ label: label || href, url: href });
  };

  if (item?.sourceUrl) {
    add(item.source, item.sourceUrl);
  }

  if (typeof item?.source === "string") {
    const sourceText = item.source.trim();
    if (sourceText) {
      for (const raw of sourceText.replace(/\s+and\s+/gi, ",").split(/[;,]/)) {
        const part = raw.trim();
        if (!part) {
          continue;
        }
        if (/^@[a-z0-9_]{1,15}$/i.test(part)) {
          add(part, `https://x.com/${part.slice(1)}`);
        } else {
          add(part, part);
        }
      }
    }
  }

  return links;
}

function normalizeSourceUrl(value) {
  if (!value) {
    return "";
  }

  const cleaned = String(value).trim().replace(/[)\].,;!?]+$/g, "");
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(cleaned)) {
    return `https://${cleaned}`;
  }

  return "";
}
