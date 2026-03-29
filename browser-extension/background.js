import { setPendingCaptureContext } from "./storage.js";

const CAPTURE_MENU_ID = "capture-research-note";
const CAPTURE_COMMAND_ID = "capture-research-note";

chrome.runtime.onInstalled.addListener(() => {
  void registerContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  void registerContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CAPTURE_MENU_ID) {
    return;
  }

  void queueCaptureAndOpenPopup({
    pageUrl: info.pageUrl || tab?.url || "",
    linkUrl: info.linkUrl || "",
    srcUrl: info.srcUrl || "",
    selectionText: info.selectionText || "",
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== CAPTURE_COMMAND_ID) {
    return;
  }

  void queueCaptureAndOpenPopup({
    pageUrl: tab?.url || "",
    linkUrl: "",
    srcUrl: "",
    selectionText: "",
  });
});

async function registerContextMenus() {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: CAPTURE_MENU_ID,
    title: "Capture research note",
    contexts: ["page", "selection", "image", "link"],
  });
}

async function queueCaptureAndOpenPopup(context) {
  await setPendingCaptureContext(context);
  await chrome.action.openPopup();
}
