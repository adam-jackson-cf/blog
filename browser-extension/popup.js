import {
  clearDraft,
  getDraft,
  getSettings,
  popPendingCaptureContext,
  setDraft,
} from "./storage.js";

const refs = {
  form: document.querySelector("#capture-form"),
  title: document.querySelector("#title"),
  summary: document.querySelector("#summary"),
  body: document.querySelector("#body"),
  sourceUrl: document.querySelector("#source-url"),
  refreshButton: document.querySelector("#refresh-button"),
  saveButton: document.querySelector("#save-button"),
  serviceStatus: document.querySelector("#service-status"),
  message: document.querySelector("#message"),
  savedPanel: document.querySelector("#saved-panel"),
  savedList: document.querySelector("#saved-list"),
  captureMeta: document.querySelector("#capture-meta"),
  pageTitle: document.querySelector("#page-title"),
  pageSource: document.querySelector("#page-source"),
  capturePreview: document.querySelector("#capture-preview"),
  captureImage: document.querySelector("#capture-image"),
};

const state = {
  settings: null,
  capture: null,
  isSaving: false,
};

void init();

async function init() {
  bindEvents();
  state.settings = await getSettings();
  await Promise.all([
    refreshServiceStatus(),
    loadCapture({ preserveDraft: true }),
  ]);
}

function bindEvents() {
  refs.form?.addEventListener("submit", handleSubmit);
  refs.refreshButton?.addEventListener("click", handleRefresh);

  for (const field of [refs.title, refs.summary, refs.body, refs.sourceUrl]) {
    field?.addEventListener("input", () => {
      void persistDraft();
    });
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (!state.capture || !state.settings) {
    return;
  }

  const payload = buildPayloadFromForm();
  setSavingState(true);
  setMessage("Saving note into the local research feed…");

  try {
    const response = await fetch(
      `${state.settings.serviceUrl}/api/research-notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || `Request failed with ${response.status}`);
    }

    await clearDraft();
    renderSavedResult(result);
    setMessage("Note saved and feed rebuilt.", "success");
    await refreshServiceStatus();
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Failed to save note.",
      "error",
    );
  } finally {
    setSavingState(false);
  }
}

async function handleRefresh() {
  await persistDraft();
  await loadCapture({ preserveDraft: true });
}

async function loadCapture({ preserveDraft = false } = {}) {
  setMessage("", "");
  refs.savedPanel.hidden = true;

  try {
    const pendingContext = await popPendingCaptureContext();
    const capture = await collectCapture(pendingContext);
    const draft = preserveDraft ? await getDraft() : null;
    state.capture = mergeDraftIntoCapture(capture, draft);
    renderCapture(state.capture);
  } catch (error) {
    state.capture = null;
    renderCapture(null);
    setMessage(
      error instanceof Error ? error.message : "Unable to capture this page.",
      "error",
    );
  }
}

async function collectCapture(pendingContext) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error("This extension can only capture standard http(s) pages.");
  }

  const [{ result: pageData = {} } = {}] = await chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: extractPageData,
      args: [pendingContext || null],
    },
  );

  let screenshotDataUrl = "";
  try {
    screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
  } catch {
    screenshotDataUrl = "";
  }

  const canonicalUrl =
    normalizeUrl(pageData.canonicalUrl) || normalizeUrl(tab.url) || "";
  const sourceUrl =
    normalizeUrl(pendingContext?.linkUrl || pendingContext?.srcUrl) ||
    canonicalUrl;
  const sourceTitle =
    pageData.pageTitle || tab.title || getDomainLabel(sourceUrl);

  return {
    title: sourceTitle,
    summary: pageData.sourceDescription || "",
    body: pageData.selectedText || "",
    sourceUrl,
    sourceTitle,
    pageTitle: sourceTitle,
    sourceDescription: pageData.sourceDescription || "",
    sourceDomain: getDomainLabel(sourceUrl),
    canonicalUrl,
    previewImageUrl: normalizeUrl(pageData.previewImageUrl),
    faviconUrl: normalizeUrl(pageData.faviconUrl || tab.favIconUrl),
    screenshotDataUrl,
    htmlSnapshot:
      typeof pageData.htmlSnapshot === "string" ? pageData.htmlSnapshot : "",
    selectedText: pageData.selectedText || "",
    author: pageData.author || "",
    publisher: pageData.publisher || "",
    pageUrl: normalizeUrl(tab.url),
  };
}

async function refreshServiceStatus() {
  if (!state.settings) {
    return;
  }

  try {
    const response = await fetch(`${state.settings.serviceUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with ${response.status}`);
    }

    refs.serviceStatus.textContent = `Local capture service ready at ${state.settings.serviceUrl}`;
    refs.serviceStatus.dataset.tone = "success";
  } catch {
    refs.serviceStatus.textContent = `Local capture service unavailable at ${state.settings.serviceUrl}. Your draft stays in the popup until the service is back.`;
    refs.serviceStatus.dataset.tone = "error";
  }
}

function mergeDraftIntoCapture(capture, draft) {
  if (
    !draft ||
    draft.sourceKey !== (capture.canonicalUrl || capture.sourceUrl)
  ) {
    return capture;
  }

  return {
    ...capture,
    title: draft.title || capture.title,
    summary: draft.summary || capture.summary,
    body: draft.body || capture.body,
    sourceUrl: draft.sourceUrl || capture.sourceUrl,
  };
}

function renderCapture(capture) {
  const isReady = Boolean(capture);
  refs.form.querySelectorAll("input, textarea, button").forEach((element) => {
    if (element !== refs.refreshButton) {
      element.disabled = !isReady;
    }
  });

  refs.captureMeta.hidden = !isReady;
  refs.capturePreview.hidden = !capture?.screenshotDataUrl;

  refs.title.value = capture?.title || "";
  refs.summary.value = capture?.summary || "";
  refs.body.value = capture?.body || "";
  refs.sourceUrl.value = capture?.sourceUrl || "";
  refs.pageTitle.textContent = capture?.pageTitle || "";
  refs.pageSource.textContent = capture?.sourceUrl || "";

  if (capture?.screenshotDataUrl) {
    refs.captureImage.src = capture.screenshotDataUrl;
  } else {
    refs.captureImage.removeAttribute("src");
  }
}

async function persistDraft() {
  if (!state.capture) {
    return;
  }

  await setDraft({
    sourceKey: state.capture.canonicalUrl || state.capture.sourceUrl,
    title: refs.title.value.trim(),
    summary: refs.summary.value.trim(),
    body: refs.body.value.trim(),
    sourceUrl: refs.sourceUrl.value.trim(),
  });
}

function buildPayloadFromForm() {
  const sourceUrl = refs.sourceUrl.value.trim();

  return {
    ...state.capture,
    title: refs.title.value.trim(),
    summary: refs.summary.value.trim(),
    body: refs.body.value.trim(),
    sourceUrl,
    sourceDomain: getDomainLabel(sourceUrl),
  };
}

function renderSavedResult(result) {
  refs.savedPanel.hidden = false;
  refs.savedList.innerHTML = [
    renderSavedRow("Note ID", result.noteId),
    renderSavedRow("Note file", result.paths?.noteFile),
    renderSavedRow("Feed data", result.feed?.outFile),
  ]
    .filter(Boolean)
    .join("");
}

function renderSavedRow(label, value) {
  if (!value) {
    return "";
  }

  return `
    <div class="saved-row">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function setSavingState(isSaving) {
  state.isSaving = isSaving;
  refs.saveButton.disabled = isSaving || !state.capture;
  refs.refreshButton.disabled = isSaving;
  refs.saveButton.textContent = isSaving ? "Saving…" : "Save note";
}

function setMessage(message, tone = "") {
  if (!message) {
    refs.message.hidden = true;
    refs.message.removeAttribute("data-tone");
    refs.message.textContent = "";
    return;
  }

  refs.message.hidden = false;
  refs.message.textContent = message;

  if (tone) {
    refs.message.dataset.tone = tone;
  } else {
    refs.message.removeAttribute("data-tone");
  }
}

function normalizeUrl(value) {
  if (!value) {
    return "";
  }

  try {
    return new URL(String(value).trim()).href;
  } catch {
    return "";
  }
}

function getDomainLabel(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function extractPageData(pendingContext) {
  const readMeta = (...selectors) => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const value =
        element?.getAttribute("content") || element?.getAttribute("href") || "";
      if (value.trim()) {
        try {
          return new URL(value.trim(), location.href).href;
        } catch {
          return value.trim();
        }
      }
    }

    return "";
  };

  return {
    canonicalUrl:
      readMeta('link[rel="canonical"]', 'meta[property="og:url"]') ||
      location.href,
    pageTitle:
      document.title ||
      readMeta('meta[property="og:title"]') ||
      location.hostname,
    sourceDescription: readMeta(
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ),
    previewImageUrl: readMeta(
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ),
    faviconUrl:
      document.querySelector('link[rel~="icon"]')?.href ||
      document.querySelector('link[rel="apple-touch-icon"]')?.href ||
      "",
    author: readMeta(
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[name="parsely-author"]',
    ),
    publisher: readMeta(
      'meta[property="og:site_name"]',
      'meta[name="publisher"]',
      'meta[property="article:publisher"]',
    ),
    selectedText:
      pendingContext?.selectionText ||
      String(window.getSelection?.() || "").trim(),
    htmlSnapshot: document.documentElement?.outerHTML || "",
  };
}
