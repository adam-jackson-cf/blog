export function renderPageShell({
  railBrand = "",
  railChip = "",
  railNote = "",
  navActive = "feed",
  siteRoot = "./",
  mainContent = "",
} = {}) {
  return `
    <div class="page-frame">
      <div class="page-chrome">
        <div class="page-rail" aria-label="Feed status">
          <div class="page-chrome-inner page-rail-inner">
            ${renderPrimaryNav(navActive, siteRoot)}
            <div class="page-rail-meta">
              ${railChip ? `<span class="page-rail-chip">${escapeHtml(railChip)}</span>` : ""}
              ${railNote ? `<span class="page-rail-note">${escapeHtml(railNote)}</span>` : ""}
            </div>
          </div>
        </div>
        <header class="page-header">
          <div class="page-chrome-inner page-intro">
            ${renderRailBrand(railBrand)}
          </div>
        </header>
      </div>
      <main class="page-shell">
        ${mainContent}
      </main>
    </div>
  `;
}

function renderRailBrand(value) {
  const title = typeof value === "string" ? value.trim() : "";
  const [firstPart, ...rest] = title.split(":");

  if (!firstPart) {
    return "";
  }

  if (rest.length === 0) {
    return `<h1 class="page-rail-brand"><span class="page-rail-brand-line page-rail-brand-line-primary">${escapeHtml(firstPart)}</span></h1>`;
  }

  const secondaryLine = rest.join(":").trim();

  return `
    <h1 class="page-rail-brand">
      <span class="page-rail-brand-line page-rail-brand-line-primary">${escapeHtml(`${firstPart}:`)}</span>
      <span class="page-rail-brand-line page-rail-brand-line-secondary">
        <span class="page-rail-brand-dot" aria-hidden="true"></span>
        ${renderRailBrandSecondaryLine(secondaryLine)}
      </span>
    </h1>
  `;
}

function renderRailBrandSecondaryLine(value) {
  const parts = String(value)
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return escapeHtml(value);
  }

  return parts
    .map((part, index) => {
      const segment = `<span class="page-rail-brand-segment">${escapeHtml(part)}</span>`;
      if (index === parts.length - 1) {
        return segment;
      }
      return `${segment}<span class="page-rail-brand-divider" aria-hidden="true">\\</span>`;
    })
    .join("");
}

export function renderPrimaryNav(activeKey = "feed", siteRoot = "./") {
  const normalizedRoot = siteRoot.endsWith("/") ? siteRoot : `${siteRoot}/`;
  const items = [
    { key: "feed", label: "Research Feed", href: normalizedRoot },
    { key: "applied-ai", label: "Applied AI", href: `${normalizedRoot}applied-ai/` },
  ];

  const navItems = items
    .map((item, index) => {
      const isActive = item.key === activeKey;
      const itemMarkup = item.href
        ? `<a class="page-nav-link${isActive ? " is-active" : ""}" href="${item.href}"${isActive ? ' aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`
        : `<span class="page-nav-text${isActive ? " is-active" : ""}">${escapeHtml(item.label)}</span>`;

      if (index === items.length - 1) {
        return itemMarkup;
      }

      return `${itemMarkup}<span class="page-nav-separator" aria-hidden="true">|</span>`;
    })
    .join("");

  return `
    <nav class="page-kicker page-nav" aria-label="Primary">
      <span class="page-kicker-dot" aria-hidden="true"></span>
      ${navItems}
    </nav>
  `;
}

export function bindEntryToggles(container, openEntries, render) {
  container.addEventListener("click", (event) => {
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
}

export function renderCollapsibleEntry(item, { entryKey = "", isExpanded = false } = {}) {
  const sourceMarkup = renderSourceLinks(getItemSourceLinks(item));
  const toggleLabel = isExpanded ? "Collapse row" : "Expand row";
  const toggleSymbol = isExpanded ? "&minus;" : "+";

  return `
    <article class="entry entry-collapsible${isExpanded ? " is-expanded" : " is-collapsed"}">
      <button
        class="entry-row entry-toggle"
        type="button"
        aria-expanded="${isExpanded ? "true" : "false"}"
        aria-label="${toggleLabel}"
        data-entry-key="${escapeAttribute(entryKey)}"
      >
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="entry-toggle-icon" aria-hidden="true">${toggleSymbol}</span>
      </button>
      ${
        isExpanded
          ? `<div class="entry-expanded">
              ${renderEntryBody(item)}
              ${sourceMarkup ? `<div class="entry-links">${sourceMarkup}</div>` : ""}
            </div>`
          : ""
      }
    </article>
  `;
}

export function renderEmptyState(message) {
  return `
    <main class="empty-state">
      <section class="empty-state-panel">
        <h1 class="empty-state-title">Nothing to show yet</h1>
        <p class="empty-state-copy">${escapeHtml(message)}</p>
      </section>
    </main>
  `;
}

export function formatGeneratedAt(value) {
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

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value) {
  return escapeHtml(value);
}

function renderEntryBody(item) {
  if (typeof item?.bodyHtml === "string" && item.bodyHtml.trim()) {
    return `<div class="entry-body">${item.bodyHtml}</div>`;
  }

  return `
    <div class="entry-body">
      <p class="entry-copy">${escapeHtml(item.summary || "No summary text found for this selected item.")}</p>
    </div>
  `;
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
