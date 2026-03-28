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
  const openEntries = new Set();
  const generatedLabel = formatGeneratedAt(feed?.generatedAt);

  root.innerHTML = `
    <main class="page-shell">
      <div class="page-rail" aria-label="Feed status">
        <p class="page-rail-brand">Daily research archive</p>
        <div class="page-rail-meta">
          <span class="page-rail-chip">Static feed</span>
          <span class="page-rail-note">${generatedLabel}</span>
        </div>
      </div>
      <header class="page-header">
        <div class="page-intro">
          <p class="page-kicker"><span class="page-kicker-dot" aria-hidden="true"></span>Research / Feed</p>
        </div>
      </header>
      <section id="day-feed" class="day-stack"></section>
      <div id="feed-sentinel" class="feed-sentinel"></div>
      <footer id="feed-footer" class="feed-footer"></footer>
    </main>
  `;

  const dayFeed = root.querySelector("#day-feed");
  const sentinel = root.querySelector("#feed-sentinel");
  const footer = root.querySelector("#feed-footer");

  dayFeed.addEventListener("click", (event) => {
    const button = event.target.closest(".entry-toggle");
    if (!button) {
      return;
    }

    const key = button.getAttribute("data-entry-key");
    if (!key) {
      return;
    }

    if (openEntries.has(key)) {
      openEntries.delete(key);
    } else {
      openEntries.add(key);
    }

    render();
  });

  const render = () => {
    const visibleFeedDays = days.slice(0, visibleDays);
    const firstPopulatedDayIndex = visibleFeedDays.findIndex((day) => day.items.length > 0);

    dayFeed.innerHTML = visibleFeedDays
      .map((day, index) =>
        renderDay(day, {
          dayIndex: index,
          isCollapsedDay: day.items.length > 0,
          isLatestPopulatedDay: index === firstPopulatedDayIndex,
          openEntries,
        }),
      )
      .join("");
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

function renderDay(day, { dayIndex = 0, isCollapsedDay = false, isLatestPopulatedDay = false, openEntries } = {}) {
  const hasItems = day.items.length > 0;

  return `
    <section class="day-section">
      <div class="day-layout${hasItems ? "" : " day-layout-empty"}">
        <header class="day-header">
          <h2 class="day-title">${formatDayStamp(day.date, day.items.length)}</h2>
        </header>
        ${
          hasItems
            ? `<div class="day-entries${isCollapsedDay ? " day-entries-collapsed" : ""}${isLatestPopulatedDay ? " day-entries-latest" : ""}">
                <div class="day-entries-chrome">
                  <span class="day-entries-dot" aria-hidden="true"></span>
                  <p class="day-entries-label">${escapeHtml(formatDayChromeLabel(day))}</p>
                </div>
                <div class="entry-grid">
                  ${day.items
                    .map((item, itemIndex) =>
                      renderItem(item, {
                        entryKey: `${day.date}:${dayIndex}:${itemIndex}`,
                        isCollapsible: isCollapsedDay,
                        isExpanded: openEntries?.has(`${day.date}:${dayIndex}:${itemIndex}`),
                      }),
                    )
                    .join("")}
                </div>
              </div>`
            : `<article class="empty-panel">No selected items were published into this summary.</article>`
        }
      </div>
    </section>
  `;
}

function renderItem(item, { entryKey = "", isCollapsible = false, isExpanded = false } = {}) {
  const sourceLinks = getItemSourceLinks(item);
  const sourceMarkup = renderSourceLinks(sourceLinks);

  if (isCollapsible) {
    const toggleLabel = isExpanded ? "Collapse row" : "Expand row";
    const toggleSymbol = isExpanded ? "&minus;" : "+";

    return `
      <article class="entry entry-collapsible${isExpanded ? " is-expanded" : " is-collapsed"}">
        <div class="entry-row">
          <h3 class="item-title">${escapeHtml(item.title)}</h3>
          <button
            class="entry-toggle"
            type="button"
            aria-expanded="${isExpanded ? "true" : "false"}"
            aria-label="${toggleLabel}"
            data-entry-key="${escapeAttribute(entryKey)}"
          >
            <span aria-hidden="true">${toggleSymbol}</span>
          </button>
        </div>
        ${
          isExpanded
            ? `<div class="entry-expanded">
                <div class="entry-body">
                  <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
                </div>
                <div class="entry-links">
                  ${sourceMarkup || `<span class="empty-note">No source link recorded.</span>`}
                </div>
              </div>`
            : ""
        }
      </article>
    `;
  }

  return `
    <article class="entry">
      <h3 class="item-title">${escapeHtml(item.title)}</h3>
      <div class="entry-body">
        <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
      </div>
      <div class="entry-links">
        ${sourceMarkup || `<span class="empty-note">No source link recorded.</span>`}
      </div>
    </article>
  `;
}

function renderEmptyState(message) {
  return `
    <main class="empty-state">
      <section class="empty-state-panel">
        <h1 class="empty-state-title">Nothing to show yet</h1>
        <p class="empty-state-copy">${escapeHtml(message)}</p>
      </section>
    </main>
  `;
}

function formatGeneratedAt(value) {
  if (!value) {
    return "Updated recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return `Updated ${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

function formatDayChromeLabel(day) {
  if (!Array.isArray(day?.sources) || day.sources.length === 0) {
    return "Selected items";
  }

  return day.sources
    .map((source) => {
      const label = typeof source?.label === "string" ? source.label.trim() : "";
      if (/blog and arxiv/i.test(label)) {
        return "Blog + arXiv";
      }
      if (/x\.com/i.test(label)) {
        return "X.com";
      }
      return label.replace(/\s+summary$/i, "") || "Source";
    })
    .join(" / ");
}

function formatDayStamp(value, itemCount) {
  const date = new Date(`${value}T00:00:00`);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day} : ${itemCount} items`;
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

  const sourceItems = links
    .map((link, index) => {
      const href = escapeAttribute(link.url ?? "");
      if (!href) {
        return "";
      }

      const label = formatSourceLabel(link) || `Source ${index + 1}`;
      return `<li class="source-list-item"><a class="source-link" href="${href}" target="_blank" rel="noreferrer" aria-label="Open source ${index + 1}">${label}<span aria-hidden="true">↗</span></a></li>`;
    })
    .filter(Boolean);

  if (sourceItems.length === 0) {
    return "";
  }

  return `
    <div class="source-block">
      <span class="empty-note source-block-label">Source:</span>
      <ul class="source-list">
        ${sourceItems.join("")}
      </ul>
    </div>
  `;
}

function formatSourceLabel(link) {
  const rawLabel = typeof link?.label === "string" ? link.label.trim() : "";
  if (rawLabel && !/^https?:\/\//i.test(rawLabel)) {
    return escapeHtml(rawLabel);
  }

  const href = typeof link?.url === "string" ? link.url.trim() : "";
  if (!href) {
    return "";
  }

  try {
    return escapeHtml(new URL(href).hostname.replace(/^www\./i, ""));
  } catch {
    return escapeHtml(href);
  }
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
