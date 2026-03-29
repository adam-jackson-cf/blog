import { getSettings, setSettings } from "./storage.js";

const refs = {
  form: document.querySelector("#settings-form"),
  serviceUrl: document.querySelector("#service-url"),
  healthButton: document.querySelector("#health-button"),
  status: document.querySelector("#settings-status"),
};

void init();

async function init() {
  const settings = await getSettings();
  refs.serviceUrl.value = settings.serviceUrl;
  refs.form?.addEventListener("submit", handleSubmit);
  refs.healthButton?.addEventListener("click", handleHealthCheck);
}

async function handleSubmit(event) {
  event.preventDefault();

  try {
    const settings = await setSettings({
      serviceUrl: refs.serviceUrl.value.trim(),
    });
    refs.serviceUrl.value = settings.serviceUrl;
    setStatus(`Saved service URL: ${settings.serviceUrl}`, "success");
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : "Unable to save settings.",
      "error",
    );
  }
}

async function handleHealthCheck() {
  try {
    const settings = await getSettings();
    const response = await fetch(`${settings.serviceUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed with ${response.status}`);
    }

    setStatus(
      `Local capture service responded at ${settings.serviceUrl}`,
      "success",
    );
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : "Health check failed.",
      "error",
    );
  }
}

function setStatus(message, tone = "") {
  refs.status.textContent = message;

  if (tone) {
    refs.status.dataset.tone = tone;
  } else {
    refs.status.removeAttribute("data-tone");
  }
}
