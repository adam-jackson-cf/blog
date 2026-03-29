export const DEFAULT_SERVICE_URL = "http://127.0.0.1:4177";
export const SETTINGS_KEY = "researchNoteSettings";
export const DRAFT_KEY = "researchNoteDraft";
export const PENDING_CAPTURE_KEY = "researchNotePendingCapture";

export async function getSettings() {
  const stored = (await chrome.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY];
  return {
    serviceUrl: normalizeServiceUrl(stored?.serviceUrl) || DEFAULT_SERVICE_URL,
  };
}

export async function setSettings(nextSettings) {
  const settings = {
    serviceUrl:
      normalizeServiceUrl(nextSettings?.serviceUrl) || DEFAULT_SERVICE_URL,
  };

  await chrome.storage.local.set({
    [SETTINGS_KEY]: settings,
  });

  return settings;
}

export async function getDraft() {
  return (await chrome.storage.local.get(DRAFT_KEY))[DRAFT_KEY] ?? null;
}

export async function setDraft(draft) {
  await chrome.storage.local.set({
    [DRAFT_KEY]: draft,
  });
}

export async function clearDraft() {
  await chrome.storage.local.remove(DRAFT_KEY);
}

export async function setPendingCaptureContext(context) {
  await chrome.storage.session.set({
    [PENDING_CAPTURE_KEY]: context,
  });
}

export async function popPendingCaptureContext() {
  const context =
    (await chrome.storage.session.get(PENDING_CAPTURE_KEY))[
      PENDING_CAPTURE_KEY
    ] ?? null;
  await chrome.storage.session.remove(PENDING_CAPTURE_KEY);
  return context;
}

function normalizeServiceUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  try {
    const url = new URL(value.trim());
    return url.origin;
  } catch {
    return "";
  }
}
