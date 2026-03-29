const DEFAULT_RAIL_CONTACTS = [
  {
    key: "email",
    href: "mailto:adam.jackson@createfuture.com",
    label: "Email Adam Jackson",
    icon: "envelope",
  },
  {
    key: "github",
    href: "https://github.com/adam-jackson-cf",
    label: "Adam Jackson on GitHub",
    icon: "github",
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/adam-jackson-ff/",
    label: "Adam Jackson on LinkedIn",
    icon: "linkedin",
  },
];

export function renderPageShell({
  railBrand = "",
  railChip = "",
  railContacts = DEFAULT_RAIL_CONTACTS,
  railSearch = null,
  navActive = "feed",
  siteRoot = "./",
  mainContent = "",
} = {}) {
  return `
    <div class="page-frame">
      <div class="page-chrome">
        <div class="page-rail" aria-label="Feed status">
          <div class="page-chrome-inner page-rail-inner">
            <div class="page-rail-nav-area">${renderPrimaryNav(navActive, siteRoot)}</div>
            <div class="page-rail-meta">
              ${railChip ? `<span class="page-rail-chip">${escapeHtml(railChip)}</span>` : ""}
              ${renderRailContacts(railContacts)}
            </div>
          </div>
        </div>
        <header class="page-header">
          <div class="page-chrome-inner page-intro">
            <div class="page-intro-main">${renderRailBrand(railBrand)}</div>
            ${railSearch ? `<div class="page-intro-aside">${renderRailSearch(railSearch)}</div>` : ""}
          </div>
        </header>
      </div>
      <main class="page-shell">
        ${mainContent}
      </main>
    </div>
  `;
}

function renderRailSearch(config) {
  if (!config) {
    return "";
  }

  const {
    formId = "rail-search-form",
    inputId = "rail-search-input",
    buttonLabel = "Search",
    placeholder = "Search article titles",
    value = "",
  } = config;

  return `
    <form class="page-rail-search" id="${escapeAttribute(formId)}" role="search">
      <label class="sr-only" for="${escapeAttribute(inputId)}">Search article titles</label>
      <input
        class="page-rail-search-input"
        id="${escapeAttribute(inputId)}"
        name="q"
        type="search"
        value="${escapeAttribute(value)}"
        placeholder="${escapeAttribute(placeholder)}"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="page-rail-search-button" type="submit">${escapeHtml(buttonLabel)}</button>
    </form>
  `;
}

function renderRailContacts(contacts) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return "";
  }

  const items = contacts
    .map((contact) => {
      const href = typeof contact?.href === "string" ? contact.href.trim() : "";
      const label = typeof contact?.label === "string" ? contact.label.trim() : "";
      const icon = typeof contact?.icon === "string" ? contact.icon.trim() : "";

      if (!href || !label || !icon) {
        return "";
      }

      const external = !href.startsWith("mailto:");

      return `
        <li class="page-rail-contact-item">
          <a
            class="page-rail-contact-link"
            href="${escapeAttribute(href)}"
            aria-label="${escapeAttribute(label)}"
            title="${escapeAttribute(label)}"
            ${external ? 'target="_blank" rel="noreferrer"' : ""}
          >
            ${renderRailContactIcon(icon)}
          </a>
        </li>
      `;
    })
    .filter(Boolean);

  if (items.length === 0) {
    return "";
  }

  return `<ul class="page-rail-contact-list">${items.join("")}</ul>`;
}

function renderRailContactIcon(icon) {
  const shared = 'viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"';

  switch (icon) {
    case "envelope":
      return `<svg class="page-rail-contact-icon" xmlns="http://www.w3.org/2000/svg" ${shared}><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/></svg>`;
    case "github":
      return `<svg class="page-rail-contact-icon" xmlns="http://www.w3.org/2000/svg" ${shared}><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>`;
    case "linkedin":
      return `<svg class="page-rail-contact-icon" xmlns="http://www.w3.org/2000/svg" ${shared}><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>`;
    default:
      return "";
  }
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
        ? `<a class="page-nav-link${isActive ? " is-active" : ""}" href="${item.href}"${isActive ? ' aria-current="page"' : ""}><span class="page-nav-link-label">${escapeHtml(item.label)}</span></a>`
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
      <div class="page-nav-links">
        ${navItems}
      </div>
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
