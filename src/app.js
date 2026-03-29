import {
  bindEntryToggles,
  escapeHtml,
  renderCollapsibleEntry,
  renderEmptyState,
  renderPageShell,
} from "./ui.js";

const PAGE_SIZE = 7;
const SHORT_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const SEARCH_TOOLTIP =
  "Tab to search. Press Enter to apply the filter. Press Esc to reset.";
const app = document.querySelector("#app");

const feed = window.__DAILY_SUMMARY_FEED__;

if (!app) {
  throw new Error("App root not found.");
}

if (!feed || !Array.isArray(feed.days)) {
  app.innerHTML = renderEmptyState(
    "Summary feed not found. Run `bun run build` to generate the page data.",
  );
} else {
  createBlog(app, feed.days);
}

function createBlog(root, days) {
  let visibleDays = Math.min(PAGE_SIZE, days.length);
  const entryState = new Map();
  let titleQuery = "";

  root.innerHTML = renderPageShell({
    railChip: "Adam Jackson Blog",
    railBrand: "Research Feed: AI Native | Agentics | Devex",
    railSearch: {
      formId: "feed-search-form",
      inputId: "feed-search-input",
      buttonLabel: "Filter",
      placeholder: "Tab to search",
      tooltip: SEARCH_TOOLTIP,
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

  bindEntryToggles(dayFeed, entryState, render);

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

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    if (searchInput.value || titleQuery) {
      searchInput.value = "";
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
            items: day.items.filter((item) =>
              item.title.toLowerCase().includes(normalizedQuery),
            ),
          }))
          .filter((day) => day.items.length > 0)
      : days.map((day, sourceDayIndex) => ({
          ...day,
          sourceDayIndex,
        }));

    const visibleFeedDays = groupedDays.slice(0, visibleDays);

    const firstPopulatedDayIndex = visibleFeedDays.findIndex(
      (day) => day.items.length > 0,
    );

    dayFeed.innerHTML = visibleFeedDays.length
      ? visibleFeedDays
          .map((day, index) =>
            renderDay(day, {
              isLatestPopulatedDay: index === firstPopulatedDayIndex,
              entryState,
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

function renderDay(day, { isLatestPopulatedDay = false, entryState } = {}) {
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
                  ${renderDayChromeSources(day)}
                </div>
                <div class="entry-grid">
              ${day.items
                .map((item, itemIndex) => {
                  const entryKey = item.id || `${day.date}:${itemIndex}`;
                  const defaultExpanded = item.stream === "article";
                  const isExpanded = entryState?.has(entryKey)
                    ? entryState.get(entryKey)
                    : defaultExpanded;

                  return renderCollapsibleEntry(item, {
                    entryKey,
                    isExpanded,
                  });
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

function renderDayChromeSources(day) {
  const sourceLabels = getDaySourceLabels(day);
  if (sourceLabels.length === 0) {
    return `<p class="day-entries-label">Selected items</p>`;
  }

  return `
    <div class="day-source-badges" aria-label="Sources present for ${escapeHtml(formatDayStamp(day.date))}">
      ${sourceLabels.map((label) => `<span class="day-source-chip">${escapeHtml(label)}</span>`).join("")}
    </div>
  `;
}

function getDaySourceLabels(day) {
  if (!Array.isArray(day?.sources) || day.sources.length === 0) {
    return [];
  }

  const labels = day.sources
    .map((source) => {
      const label =
        typeof source?.label === "string" ? source.label.trim() : "";
      if (/research note/i.test(label)) {
        return "Notes";
      }
      if (/blog and arxiv/i.test(label)) {
        return "Blog + arXiv";
      }
      if (/x\.com/i.test(label)) {
        return "X.com";
      }
      return label.replace(/\s+summary$/i, "") || "Source";
    })
    .filter(Boolean);

  return [...new Set(labels)];
}

function formatDayStamp(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  const monthLabel = SHORT_MONTH_LABELS[Number(month) - 1];

  return monthLabel ? `${day} ${monthLabel} ${year}` : value;
}
