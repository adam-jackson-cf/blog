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
  const totalItems = days.reduce((count, day) => count + day.items.length, 0);

  root.innerHTML = `
    <main class="page-shell">
      <header class="page-header">
        <div class="page-intro">
          <p class="page-kicker"><span class="page-kicker-dot" aria-hidden="true"></span>Research / Feed</p>
          <div class="page-hero">
            <div class="page-copy">
              <h1 class="page-title">Daily research.</h1>
              <p class="page-description">Selected items from the daily blog, arXiv, and X.com scans, arranged as a working feed instead of a dump.</p>
            </div>
            <dl class="page-stats" aria-label="Feed overview">
              ${renderStat("Days", String(days.length))}
              ${renderStat("Items", String(totalItems))}
              ${renderStat("Window", formatCoverageRange(days))}
            </dl>
          </div>
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
    dayFeed.innerHTML = days
      .slice(0, visibleDays)
      .map((day, index) =>
        renderDay(day, {
          dayIndex: index,
          isCollapsedDay: day.items.length > 0,
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

function renderDay(day, { dayIndex = 0, isCollapsedDay = false, openEntries } = {}) {
  const hasItems = day.items.length > 0;

  return `
    <section class="day-section">
      <div class="day-layout${hasItems ? "" : " day-layout-empty"}">
        <header class="day-header">
          <h2 class="day-title">${formatDayStamp(day.date, day.items.length)}</h2>
        </header>
        ${
          hasItems
            ? `<div class="day-entries${isCollapsedDay ? " day-entries-collapsed" : ""}">
                <div class="day-entries-chrome">
                  <span class="day-entries-dot" aria-hidden="true"></span>
                  <p class="day-entries-label">${escapeHtml(formatDayChromeLabel(day))}</p>
                </div>
                ${day.items
                .map((item, itemIndex) =>
                  renderItem(item, {
                    entryKey: `${day.date}:${dayIndex}:${itemIndex}`,
                    isCollapsible: isCollapsedDay,
                    isExpanded: openEntries?.has(`${day.date}:${dayIndex}:${itemIndex}`),
                  }),
                )
                .join("")}</div>`
            : `<article class="empty-panel">No selected items were published into this summary.</article>`
        }
      </div>
    </section>
  `;
}

function renderItem(item, { entryKey = "", isCollapsible = false, isExpanded = false } = {}) {
  const sourceMarkup = renderSourceLinks(getItemSourceLinks(item));

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
                <div class="entry-meta">
                  <p class="entry-stream">${escapeHtml(item.streamLabel || "Summary item")}</p>
                  <div class="entry-links">
                    ${sourceMarkup || `<span class="empty-note">No source link recorded.</span>`}
                  </div>
                </div>
                <div class="entry-body">
                  <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
                </div>
              </div>`
            : ""
        }
      </article>
    `;
  }

  return `
    <article class="entry">
      <div class="entry-meta">
        <p class="entry-stream">${escapeHtml(item.streamLabel || "Summary item")}</p>
        <div class="entry-links">
          ${sourceMarkup || `<span class="empty-note">No source link recorded.</span>`}
        </div>
      </div>
      <div class="entry-body">
        <h3 class="item-title">${escapeHtml(item.title)}</h3>
        <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
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

function renderStat(label, value) {
  return `
    <div class="page-stat">
      <dt class="page-stat-label">${label}</dt>
      <dd class="page-stat-value">${value}</dd>
    </div>
  `;
}

function formatCoverageRange(days) {
  if (!Array.isArray(days) || days.length === 0) {
    return "No data";
  }

  const newest = days[0]?.date;
  const oldest = days[days.length - 1]?.date;

  if (!newest || !oldest) {
    return "No data";
  }

  if (newest === oldest) {
    return formatRangeDate(newest);
  }

  return `${formatRangeDate(oldest)} - ${formatRangeDate(newest)}`;
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

function formatRangeDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
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

  const count = links.length;
  const linksMarkup = links
    .map((link, index) => {
      const href = escapeAttribute(link.url ?? "");
      if (!href) {
        return "";
      }

      const label = formatSourceLabel(link) || `Source ${index + 1}`;
      return `<a class="source-link" href="${href}" target="_blank" rel="noreferrer" aria-label="Open source ${index + 1}">${label}<span aria-hidden="true">↗</span></a>`;
    })
    .filter(Boolean)
    .join(count > 1 ? " <span class=\"empty-note\">·</span> " : "");

  if (!linksMarkup) {
    return "";
  }

  const prefix = count === 1 ? "Source:" : "Sources:";
  return `<span class="empty-note">${prefix} ${linksMarkup}</span>`;
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
