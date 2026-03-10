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
              Selected items from the daily blog and arXiv scans, sourced from
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
  const sourceMarkup = item.source
    ? `<a class="source-link" href="${escapeAttribute(
        item.source,
      )}" target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a>`
    : "";

  return `
    <article class="item-card">
      <div class="space-y-3">
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
