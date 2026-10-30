const statusEl = document.getElementById("status");
const showBtn = document.getElementById("show-btn");

function setStatus(text, kind) {
  statusEl.className = `card hint ${kind || ""}`;
  statusEl.textContent = text;
}

async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function restricted(url) {
  return !url || /^(chrome|edge|about|chrome-extension):/i.test(url);
}

function looksLikeMaps(url) {
  try {
    const u = new URL(url);
    return u.hostname.includes("google.") && (u.pathname.includes("/maps") || u.hostname.startsWith("maps."));
  } catch {
    return false;
  }
}

async function showPanel() {
  const tab = await currentTab();
  if (!tab || restricted(tab.url)) {
    throw new Error("Open a Google Maps listing in this tab first.");
  }
  if (!looksLikeMaps(tab.url)) {
    throw new Error("This is not a Maps tab. Open the business on Google Maps, then click the extension.");
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["extractor.js", "overlay.js"],
  });

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "TL_SHOW" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (globalThis.__trendLabsOverlay) globalThis.__trendLabsOverlay.show();
      },
    });
  }
}

showBtn.addEventListener("click", async () => {
  showBtn.disabled = true;
  try {
    await showPanel();
    setStatus("Panel is on the map (top right). Hover the yellow chip, auto-scroll, then Extract.", "ok");
  } catch (err) {
    setStatus(err.message || String(err), "error");
  } finally {
    showBtn.disabled = false;
  }
});

showPanel()
  .then(() => {
    setStatus("Look at the map: hover the yellow Reviews chip (top right). Turn auto-scroll on, then Extract.", "ok");
  })
  .catch((err) => setStatus(err.message || String(err), "error"));
