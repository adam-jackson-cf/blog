const PAGE_SIZE = 7;
const app = document.querySelector("#app");

const feed = window.__DAILY_SUMMARY_FEED__;

if (!app) {
  throw new Error("App root not found.");
}

if (!feed || !Array.isArray(feed.days)) {
  app.innerHTML = renderEmptyState("Summary feed not found. Run `npm run build` to generate the page data.");
} else {
  createBlog(app, feed.days);
}

function createBlog(root, days) {
  let visibleDays = Math.min(PAGE_SIZE, days.length);

  root.innerHTML = `
    <main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section class="surface overflow-hidden p-8 sm:p-10">
        <div class="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div class="space-y-4">
            <span class="pill">Daily summary blog</span>
            <div class="space-y-3">
              <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
                Selected items from the daily blog and arXiv summaries.
              </h1>
              <p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                This page reads the markdown summaries in <code class="rounded bg-stone-100 px-1.5 py-0.5 text-sm text-stone-800">docs/daily-source-scans</code>
                and renders only each selected item’s summary and source link.
              </p>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            ${renderMetric("Days available", String(days.length))}
            ${renderMetric(
              "Selected items",
              String(days.reduce((count, day) => count + day.items.length, 0)),
            )}
            ${renderMetric("Batch size", "7 days")}
          </div>
        </div>
      </section>
      <section id="day-feed" class="space-y-8"></section>
      <div id="feed-sentinel" class="h-10 w-full"></div>
      <footer id="feed-footer" class="pb-8 text-center text-sm text-muted-foreground"></footer>
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
    <section class="space-y-4">
      <div class="surface flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Summary day</p>
          <h2 class="text-2xl font-semibold text-stone-900">${formatDate(day.date)}</h2>
          <p class="text-sm text-muted-foreground">${escapeHtml(day.coverageWindow || "Coverage window unavailable")}</p>
        </div>
        <span class="pill">${day.items.length ? `${day.items.length} item${day.items.length === 1 ? "" : "s"}` : "No selected items"}</span>
      </div>
      ${
        day.items.length
          ? `<div class="grid gap-4 lg:grid-cols-2">${day.items.map(renderItem).join("")}</div>`
          : `<article class="surface p-6 text-sm text-muted-foreground">No selected items were published into this summary.</article>`
      }
    </section>
  `;
}

function renderItem(item) {
  const sourceMarkup = item.source
    ? `<a class="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-orange-700" href="${escapeAttribute(
        item.source,
      )}" target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a>`
    : "";

  return `
    <article class="surface flex h-full flex-col gap-4 p-6">
      <div class="space-y-3">
        <h3 class="text-xl font-semibold leading-tight text-stone-900">${escapeHtml(item.title)}</h3>
        <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
      </div>
      <div class="mt-auto border-t border-border/70 pt-4">
        ${sourceMarkup || `<span class="text-sm text-muted-foreground">No source link recorded.</span>`}
      </div>
    </article>
  `;
}

function renderMetric(label, value) {
  return `
    <div class="surface p-4">
      <p class="text-xs uppercase tracking-[0.16em] text-muted-foreground">${label}</p>
      <p class="mt-2 text-2xl font-semibold text-stone-900">${value}</p>
    </div>
  `;
}

function renderEmptyState(message) {
  return `
    <main class="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
      <section class="surface w-full p-8 text-center">
        <span class="pill">Daily summary blog</span>
        <h1 class="mt-4 text-3xl font-semibold text-stone-900">Nothing to show yet</h1>
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

