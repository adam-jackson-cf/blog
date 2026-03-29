import {
  bindEntryToggles,
  escapeHtml,
  renderCollapsibleEntry,
  renderEmptyState,
  renderPageShell,
} from "./ui.js";

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
  let titleQuery = "";

  root.innerHTML = renderPageShell({
    railChip: "Adam Jackson Blog",
    railBrand: "Research Feed: AI Native | Agentics | Devex",
    railSearch: {
      formId: "feed-search-form",
      inputId: "feed-search-input",
      buttonLabel: "Filter",
      placeholder: "Search title",
    },
    navActive: "feed",
    siteRoot: "./",
    mainContent: `
      <section id="day-feed" class="day-stack"></section>
      <div id="feed-sentinel" class="feed-sentinel"></div>
      <footer id="feed-footer" class="feed-footer"></footer>
    `,
  });

  const dayFeed = root.querySelector("#day-feed");
  const sentinel = root.querySelector("#feed-sentinel");
  const footer = root.querySelector("#feed-footer");
  const searchForm = root.querySelector("#feed-search-form");
  const searchInput = root.querySelector("#feed-search-input");
  const railMeta = root.querySelector(".page-rail-meta");
  const searchAside = root.querySelector(".page-intro-aside");

  bindEntryToggles(dayFeed, openEntries, render);

  if (railMeta && searchAside) {
    const syncSearchAsideWidth = () => {
      searchAside.style.width = `${Math.ceil(railMeta.getBoundingClientRect().width)}px`;
    };

    syncSearchAsideWidth();
    window.addEventListener("resize", syncSearchAsideWidth);

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(syncSearchAsideWidth);
      resizeObserver.observe(railMeta);
    }
  }

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    titleQuery = searchInput?.value.trim() ?? "";
    visibleDays = PAGE_SIZE;
    render();
  });

  searchInput?.addEventListener("search", () => {
    const nextValue = searchInput.value.trim();
    if (!nextValue && titleQuery) {
      titleQuery = "";
      visibleDays = PAGE_SIZE;
      render();
    }
  });

  function render() {
    const normalizedQuery = titleQuery.toLowerCase();
    const groupedDays = normalizedQuery
      ? days
          .map((day, sourceDayIndex) => ({
            ...day,
            sourceDayIndex,
            items: day.items.filter((item) => item.title.toLowerCase().includes(normalizedQuery)),
          }))
          .filter((day) => day.items.length > 0)
      : days.map((day, sourceDayIndex) => ({
          ...day,
          sourceDayIndex,
        }));

    const visibleFeedDays = groupedDays.slice(0, visibleDays);

    const firstPopulatedDayIndex = visibleFeedDays.findIndex((day) => day.items.length > 0);

    dayFeed.innerHTML = visibleFeedDays.length
      ? visibleFeedDays
          .map((day, index) =>
            renderDay(day, {
              isLatestPopulatedDay: index === firstPopulatedDayIndex,
              openEntries,
            }),
          )
          .join("")
      : renderSearchEmpty(titleQuery);

    footer.innerHTML = normalizedQuery
      ? visibleDays < groupedDays.length
        ? `Showing <span class="font-semibold text-foreground">${countItems(visibleFeedDays)}</span> matching items across <span class="font-semibold text-foreground">${visibleFeedDays.length}</span> of <span class="font-semibold text-foreground">${groupedDays.length}</span> days. Scroll for seven more.`
        : `Showing <span class="font-semibold text-foreground">${countItems(groupedDays)}</span> matching items across <span class="font-semibold text-foreground">${groupedDays.length}</span> days.`
      : visibleDays < days.length
        ? `Showing <span class="font-semibold text-foreground">${visibleDays}</span> of <span class="font-semibold text-foreground">${days.length}</span> days. Scroll for seven more.`
        : `Showing all <span class="font-semibold text-foreground">${days.length}</span> available days.`;
  }

  render();

  if (visibleDays >= days.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting || titleQuery) {
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

function renderSearchEmpty(query) {
  return `
    <section class="day-section">
      <article class="empty-panel">No article titles matched "${escapeHtml(query)}".</article>
    </section>
  `;
}

function countItems(days) {
  return days.reduce((total, day) => total + day.items.length, 0);
}

function renderDay(day, { isLatestPopulatedDay = false, openEntries } = {}) {
  const hasItems = day.items.length > 0;

  return `
    <section class="day-section">
      <div class="day-layout${hasItems ? "" : " day-layout-empty"}">
        <header class="day-header">
          <h2 class="day-title">${formatDayStamp(day.date)}</h2>
        </header>
        ${
          hasItems
            ? `<div class="day-entries day-entries-collapsed${isLatestPopulatedDay ? " day-entries-latest" : ""}">
                <div class="day-entries-chrome">
                  <span class="day-entries-dot" aria-hidden="true"></span>
                  <p class="day-entries-label">${escapeHtml(formatDayChromeLabel(day))}</p>
                </div>
                <div class="entry-grid">
                  ${day.items
                    .map((item, itemIndex) => {
                      const entryKey = item.id || `${day.date}:${itemIndex}`;
                      return (
                      renderCollapsibleEntry(item, {
                        entryKey,
                        isExpanded: openEntries?.has(entryKey),
                      })
                    );
                    })
                    .join("")}
                </div>
              </div>`
            : `<article class="empty-panel">No selected items were published into this summary.</article>`
        }
      </div>
    </section>
  `;
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

function formatDayStamp(value) {
  const date = new Date(`${value}T00:00:00`);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
