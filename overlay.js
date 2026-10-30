(() => {
  if (globalThis.__trendLabsOverlay) {
    globalThis.__trendLabsOverlay.show();
    return;
  }

  const HOST_ID = "trendlabs-reviews-root";
  const api = () => globalThis.__trendLabsReviews;

  const CSS = `
:host {
  display: block !important;
  position: fixed !important;
  top: 88px;
  right: 58px;
  z-index: 2147483646 !important;
  width: max-content;
  max-width: calc(100vw - 24px);
  pointer-events: none;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: #1a1a1a;
  line-height: 1.4;
}
.wrap {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 6px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  background: #f6c94c;
  color: #1a1a1a;
  border-radius: 999px;
  padding: 8px 12px 8px 8px;
  font: 700 13px/1 "Segoe UI", system-ui, sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}
.chip .mark {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: #1a1a1a;
  color: #f6c94c;
  font-size: 12px;
}
.panel {
  display: none;
  width: 300px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 110px);
  margin-top: 6px;
  background: #f7f1e1;
  border: 1px solid #e7e0cc;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

.wrap.is-open .panel { display: block; }
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  background: #f6c94c;
  cursor: grab;
  user-select: none;
}
.head strong { font-size: 13px; }
.head span { display: block; font-size: 10px; color: #5a4a12; }
.min {
  border: 0;
  background: rgba(26, 26, 26, 0.08);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
.body {
  padding: 12px;
  display: grid;
  gap: 10px;
  max-height: calc(100vh - 175px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.body::-webkit-scrollbar {
  width: 8px;
}

.body::-webkit-scrollbar-track {
  background: #eee7d5;
  border-radius: 10px;
}

.body::-webkit-scrollbar-thumb {
  background: #c7b978;
  border-radius: 10px;
}

.body::-webkit-scrollbar-thumb:hover {
  background: #a9974d;
}
.row, label.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
select, button, input { font-family: inherit; }
select {
  border: 1px solid #e7e0cc;
  background: #fff;
  border-radius: 8px;
  padding: 6px 8px;
  font: 600 12px/1 "Segoe UI", system-ui, sans-serif;
}
.toggle {
  border: 1px solid #e7e0cc;
  min-width: 64px;
  border-radius: 999px;
  padding: 7px 12px;
  font: 700 12px/1 "Segoe UI", system-ui, sans-serif;
  cursor: pointer;
  background: #fff;
  color: #6b6b6b;
}
.toggle.on { background: #1a1a1a; color: #f6c94c; border-color: #1a1a1a; }
.status { margin: 0; font-size: 12px; color: #6b6b6b; }
.status.ok { color: #2d6a1f; }
.status.err { color: #7a2e2e; }
.extract {
  width: 100%;
  border: 0;
  background: #f6c94c;
  color: #1a1a1a;
  border-radius: 30px;
  padding: 11px 12px;
  font: 700 13px/1 "Segoe UI", system-ui, sans-serif;
  cursor: pointer;
}
.extract:disabled { opacity: 0.55; }
.filters { display: none; grid-template-columns: 1fr 1fr; gap: 6px 8px; font-size: 11px; }
.filters.show { display: grid; }
.filters label { display: flex; gap: 6px; align-items: center; }
.list {
  display: none;
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fff;
  border: 1px solid #e7e0cc;
  border-radius: 8px;
  box-sizing: border-box;
}
.list.show { display: block; }
.item { padding: 8px 10px; border-bottom: 1px solid #f0ead8; font-size: 11px; }
.item:last-child { border-bottom: 0; }
.item b { display: block; }
.item p { margin: 3px 0 0; color: #444; }
.export {
  display: none;
  gap: 6px;
  padding-top: 2px;
}
.export.show {
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: sticky;
  bottom: 0;
  background: #f7f1e1;
  padding: 8px 0 0;
  z-index: 5;
}
.export button {
  border: 1px solid #e7e0cc;
  background: #fff;
  border-radius: 8px;
  padding: 8px 6px;
  font: 600 11px/1 "Segoe UI", system-ui, sans-serif;
  cursor: pointer;
}
.export button.primary {
  background: #1a1a1a;
  color: #f7f1e1;
  border-color: #1a1a1a;
  grid-column: 1 / -1;
}
.thumbs {
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  background: #fff;
  border: 1px solid #e7e0cc;
  border-radius: 8px;
  box-sizing: border-box;
}

.thumbs::-webkit-scrollbar {
  width: 7px;
}

.thumbs::-webkit-scrollbar-track {
  background: #f0ead8;
  border-radius: 10px;
}

.thumbs::-webkit-scrollbar-thumb {
  background: #c7b978;
  border-radius: 10px;
}

.thumbs::-webkit-scrollbar-thumb:hover {
  background: #a9974d;
}
.thumbs.show { display: grid; }
.thumbs a {
  display: block;
  height: 58px;
  border-radius: 4px;
  overflow: hidden;
  background: #eee;
}
.thumbs img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`;

  let payload = { place: null, reviews: [], images: [] };
  let selected = new Set();
  let countTimer = 0;
  let drag = null;
  let pinned = false;
  let hideTimer = 0;

  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.cssText = "position:fixed;top:88px;right:58px;z-index:2147483646;display:block;width:max-content;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = CSS;

  const root = document.createElement("div");
  root.className = "wrap";
  root.innerHTML = `
    <button class="chip" type="button">
      <span class="mark">7</span>
      <span class="chip-label">Reviews</span>
    </button>
    <section class="panel">
      <header class="head">
        <div>
          <strong>DE master</strong>
          <span>Hover to open · click chip to keep open</span>
        </div>
        <button class="min" type="button" title="Hide">–</button>
      </header>
      <div class="body">
        <div class="row">
          <span>Auto-scroll</span>
          <button class="toggle" id="tl-scroll" type="button">Off</button>
        </div>
        <label class="field">Scroll
          <select id="tl-target">
            <option value="reviews" selected>Reviews</option>
            <option value="photos">Photos</option>
          </select>
        </label>
        <label class="field">Direction
          <select id="tl-dir">
            <option value="down" selected>Down</option>
            <option value="up">Up</option>
          </select>
        </label>
        <label class="field">Speed
          <select id="tl-speed">
            <option value="1.6">Slow</option>
            <option value="3.2" selected>Medium</option>
            <option value="7">Fast</option>
          </select>
        </label>
        <p class="status" id="tl-status">Extract saves reviews, then opens Photos and loads the full gallery.</p>
        <button class="extract" id="tl-extract" type="button">Extract reviews &amp; all photos</button>
        <div class="filters" id="tl-filters">
          <label>Min stars
            <select id="tl-stars">
              <option value="0">Any</option>
              <option value="3">3+</option>
              <option value="4" selected>4+</option>
              <option value="5">5</option>
            </select>
          </label>
          <label><input id="tl-text" type="checkbox" checked /> Text only</label>
          <label><input id="tl-anon" type="checkbox" checked /> Initials</label>
          <label><input id="tl-quotes" type="checkbox" checked /> Quotes</label>
        </div>
        <div class="list" id="tl-list"></div>
        <div class="thumbs" id="tl-thumbs"></div>
        <div class="export" id="tl-export">
  <button class="primary" id="tl-copy-html" type="button">Copy HTML</button>
  <button id="tl-copy-json" type="button">Copy JSON</button>
  <button id="tl-copy-csv" type="button">Copy CSV</button>

  <button
    class="primary"
    id="tl-save-database"
    type="button"
  >
    Save to Database
  </button>
</div>
      </div>
    </section>
  `;

  shadow.append(style, root);
  document.documentElement.appendChild(host);

  const $ = (id) => shadow.getElementById(id);
  const chip = root.querySelector(".chip");
  const chipLabel = root.querySelector(".chip-label");
  const head = root.querySelector(".head");
  const minBtn = root.querySelector(".min");
  const scrollBtn = $("tl-scroll");
  const dirSel = $("tl-dir");
  const speedSel = $("tl-speed");
  const targetSel = $("tl-target");
  const statusEl = $("tl-status");
  const extractBtn = $("tl-extract");

  function setStatus(text, kind) {
    statusEl.className = `status ${kind || ""}`;
    statusEl.textContent = text;
  }

  function isOpen() {
    return root.classList.contains("is-open");
  }

  function setOpen(next) {
    root.classList.toggle("is-open", next);
  }

  function open() {
    clearTimeout(hideTimer);
    setOpen(true);
  }

  function collapse() {
    pinned = false;
    setOpen(false);
  }

  function pin() {
    pinned = true;
    setOpen(true);
  }

  function show() {
    host.style.display = "block";
    pin();
  }

  function hide() {
    collapse();
  }

  function toggle() {
    if (isOpen() && pinned) collapse();
    else pin();
  }

  function usingControl() {
    const el = shadow.activeElement;
    return !!(el && /^(SELECT|INPUT|TEXTAREA)$/.test(el.tagName));
  }

  function scheduleHide() {
    if (pinned) return;
    const engine = api();
    if (engine && engine.scrollStatus().on) return;
    if (usingControl()) return;
    hideTimer = setTimeout(() => {
      if (pinned || usingControl()) return;
      if (api() && api().scrollStatus().on) return;
      setOpen(false);
    }, 500);
  }

  function opts() {
    return {
      direction: dirSel.value,
      speed: Number(speedSel.value),
      target: targetSel.value,
    };
  }

  function applyOpts() {
    const engine = api();
    if (engine) engine.setScrollOpts(opts());
  }

  function liveStatus() {
    const engine = api();
    if (!engine) return;
    const s = engine.scrollStatus();
    const noun = s.target === "photos" ? "photos" : "reviews";
    const bits = [`${s.count} ${noun}`];
    if (s.on) bits.unshift("Scrolling");
    if (s.atEnd && s.direction === "down") bits.push("end of list");
    if (s.atStart && s.direction === "up") bits.push("top of list");
    if (!s.hasScroller) bits.push(s.target === "photos" ? "open Photos" : "open the Reviews tab");
    setStatus(bits.join(" · "), s.on ? "ok" : "");
    chipLabel.textContent = s.count ? `${s.target === "photos" ? "Photos" : "Reviews"} · ${s.count}` : "Reviews";
  }

  function startCountLoop() {
    if (countTimer) return;
    countTimer = setInterval(liveStatus, 400);
  }

  function stopCountLoop() {
    if (!countTimer) return;
    clearInterval(countTimer);
    countTimer = 0;
  }

  function setScrolling(on) {
    const engine = api();
    if (!engine) {
      setStatus("Extractor did not load. Refresh Maps and try again.", "err");
      return;
    }
    if (on) {
      pin();
      engine.startAutoScroll(opts());
      scrollBtn.textContent = "On";
      scrollBtn.classList.add("on");
      startCountLoop();
      liveStatus();
    } else {
      engine.stopAutoScroll();
      scrollBtn.textContent = "Off";
      scrollBtn.classList.remove("on");
      stopCountLoop();
      liveStatus();
    }
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function initialName(name) {
    const parts = clean(name).split(" ").filter(Boolean);
    if (parts.length < 2) return parts[0] || "Google user";
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function visibleReviews() {
    const min = Number($("tl-stars").value);
    const needText = $("tl-text").checked;
    return payload.reviews.filter((r) => {
      if (needText && clean(r.text).length < 12) return false;
      if (r.rating != null && r.rating < min) return false;
      if (r.rating == null && min > 0) return false;
      return true;
    });
  }

  function formatText(review) {
    let text = clean(review.text);
    if ($("tl-quotes").checked && text && !/^["“]/.test(text)) text = `“${text.replace(/^"|"$/g, "")}”`;
    return text;
  }

  function formatCite(review) {
    const name = $("tl-anon").checked ? initialName(review.author) : review.author;
    const bits = [name];
    if (review.rating) bits.push(`${review.rating}★`);
    bits.push("Google review");
    return bits.join(" · ");
  }

  function toHtml(reviews) {
    const place = payload.place || {};
    const articles = reviews
      .map((r) => `    <article class="review">\n      <p>${escapeHtml(formatText(r))}</p>\n      <cite>${escapeHtml(formatCite(r))}</cite>\n    </article>`)
      .join("\n");
    const images = payload.images || [];
    const photos = images.length
      ? `\n  <div class="photos">\n${images
          .map((img) => `    <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || place.name || "Google photo")}" />`)
          .join("\n")}\n  </div>`
      : "";
    return `<section class="section" id="reviews">
  <p class="kicker">From Google Maps</p>
  <h2>${escapeHtml(place.name || "What people wrote")}</h2>
  <div class="reviews">
${articles}
  </div>${photos}
</section>
`;
  }

  function csvCell(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
  }

  function csvLines(rows) {
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  function toJson(reviews) {
    return JSON.stringify(
      {
        place: payload.place,
        extractedAt: new Date().toISOString(),
        count: reviews.length,
        imageCount: (payload.images || []).length,
        reviews: reviews.map((r) => ({
          author: $("tl-anon").checked ? initialName(r.author) : r.author,
          authorFull: r.author,
          rating: r.rating,
          date: r.date,
          text: clean(r.text),
          ownerResponse: r.ownerResponse || "",
          photos: r.photos || [],
        })),
        images: (payload.images || []).map((img) => ({
          url: img.url,
          source: img.source || "place",
          alt: img.alt || "",
        })),
      },
      null,
      2
    );
  }

  function toCsv(reviews) {
    const reviewRows = [["type", "author", "rating", "date", "text", "photos"]];
    for (const r of reviews) {
      reviewRows.push([
        "review",
        $("tl-anon").checked ? initialName(r.author) : r.author,
        r.rating ?? "",
        r.date,
        clean(r.text),
        (r.photos || []).join(" | "),
      ]);
    }
    const imageRows = [["type", "url", "source", "alt"]];
    for (const img of payload.images || []) {
      imageRows.push(["image", img.url, img.source || "place", img.alt || ""]);
    }
    return [csvLines(reviewRows), "", csvLines(imageRows)].join("\n");
  }

  function renderThumbs() {
    const thumbs = $("tl-thumbs");
    const images = payload.images || [];
    thumbs.innerHTML = images
      .slice(0, 40)
      .map((img) => `<a href="${escapeHtml(img.url)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(img.thumb || img.url)}" alt="" /></a>`)
      .join("");
    thumbs.classList.toggle("show", images.length > 0);
  }

  function renderList() {
    const rows = visibleReviews();
    selected = new Set(rows.map((r) => r.id));
    $("tl-list").innerHTML = rows
      .slice(0, 40)
      .map((r) => {
        const preview = clean(r.text) || "(rating only)";
        const n = (r.photos || []).length;
        return `<article class="item"><b>${escapeHtml(r.author)} ${r.rating ? `· ${r.rating}★` : ""}${n ? ` · ${n} photo${n === 1 ? "" : "s"}` : ""}</b><p>${escapeHtml(preview)}</p></article>`;
      })
      .join("");
    if (rows.length > 40) {
      $("tl-list").insertAdjacentHTML("beforeend", `<article class="item"><p>+ ${rows.length - 40} more selected</p></article>`);
    }
    renderThumbs();
    $("tl-list").classList.toggle("show", rows.length > 0);
    $("tl-filters").classList.toggle("show", payload.reviews.length > 0);
    $("tl-export").classList.toggle("show", rows.length > 0 || (payload.images || []).length > 0);
  }

  async function extract() {
    const engine = api();
    if (!engine) {
      setStatus("Extractor did not load. Refresh Maps.", "err");
      return;
    }
    engine.stopAutoScroll();
    scrollBtn.textContent = "Off";
    scrollBtn.classList.remove("on");
    stopCountLoop();
    pin();
    extractBtn.disabled = true;
    setStatus("Saving reviews, then loading every photo in the gallery…");
    try {
      const run = engine.extractFull
        ? engine.extractFull((info) => {
            if (!info) return;
            if (info.stage === "reviews") {
              setStatus(`Saved ${info.reviews} reviews. Opening the Photos gallery…`);
            } else {
              setStatus(`Loading all photos… ${info.images} found`);
            }
          })
        : Promise.resolve(engine.extract());
      const result = await run;
      if (!result || !result.ok) {
        setStatus((result && result.error) || "No reviews yet. Open Reviews and auto-scroll first.", "err");
        return;
      }
      payload = { images: [], ...result };
      renderList();
      const nRev = result.reviews.length;
      const nImg = (result.images || []).length;
      if (!nRev && !nImg) {
        setStatus("Nothing yet. Open the listing, auto-scroll Reviews or Photos, then Extract.", "err");
      } else {
        setStatus(`Extracted ${nRev} review${nRev === 1 ? "" : "s"} and ${nImg} photo${nImg === 1 ? "" : "s"}.`, "ok");
      }
    } finally {
      extractBtn.disabled = false;
    }
  }

  async function copy(text, label) {
    await navigator.clipboard.writeText(text);
    setStatus(label, "ok");
  }

  function picked() {
    return visibleReviews().filter((r) => selected.has(r.id));
  }

  ["pointerdown", "mousedown", "mouseup", "click", "dblclick", "touchstart", "wheel"].forEach((type) => {
    root.addEventListener(type, (e) => e.stopPropagation());
  });

  root.addEventListener("mouseenter", open);
  root.addEventListener("mouseleave", scheduleHide);

  chip.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned) collapse();
    else pin();
  });

  minBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    collapse();
  });

  scrollBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const on = !scrollBtn.classList.contains("on");
    setScrolling(on);
  });

  dirSel.addEventListener("change", applyOpts);
  speedSel.addEventListener("change", applyOpts);
  targetSel.addEventListener("change", applyOpts);
  dirSel.addEventListener("mousedown", pin);
  speedSel.addEventListener("mousedown", pin);
  targetSel.addEventListener("mousedown", pin);
  extractBtn.addEventListener("click", (e) => {
    e.preventDefault();
    extract();
  });

  ["tl-stars", "tl-text", "tl-anon", "tl-quotes"].forEach((id) => {
    $(id).addEventListener("change", renderList);
  });

  $("tl-copy-html").addEventListener("click", () => copy(toHtml(picked()), `Copied ${picked().length} reviews and ${(payload.images || []).length} images as HTML.`));
  $("tl-copy-json").addEventListener("click", () => copy(toJson(picked()), `Copied JSON (${picked().length} reviews, ${(payload.images || []).length} images).`));
  $("tl-copy-csv").addEventListener("click", () => copy(toCsv(picked()), `Copied CSV (${picked().length} reviews, ${(payload.images || []).length} images).`));

 
$("tl-save-database").addEventListener("click", async () => {
  const button = $("tl-save-database");

  if (!payload?.place?.name) {
    setStatus("Extract a Google Maps business first.", "err");
    return;
  }

  // Replace these with valid IDs from your Laravel database.
  const JOB_ID = 2;
  const SOURCE_ID = 1;

  button.disabled = true;

  try {
    const place = payload.place;
    const reviews = payload.reviews || [];

    const business = {
      name: place.name,
      category: place.category || null,
      address: place.address || null,
      phone: place.phone || null,
      website: place.website || null,
      rating: place.rating ?? null,
      review_count: place.reviewCount ?? null,
      maps_url: place.url || window.location.href,
      external_id: place.externalId || null,
      latitude: place.latitude ?? null,
      longitude: place.longitude ?? null
    };

    const reviewData = reviews.map((review) => {
      const timestamp = review.date
        ? Date.parse(review.date)
        : NaN;

      return {
        external_review_id: review.id || null,
        author: review.author || "Google user",
        rating: review.rating ?? null,
        review_date: Number.isNaN(timestamp)
          ? null
          : new Date(timestamp).toISOString().slice(0, 10),
        review_text: review.text || "",
        owner_response: review.ownerResponse || null,
        source_url: business.maps_url
      };
    });

    const photos = (payload.images || [])
      .filter((photo) => photo.url)
      .map((photo) => ({
        photo_url: photo.url,
        photo_key: null,
        photo_type: photo.source || "business",
        source_url: business.maps_url
      }));

    setStatus("Sending business, reviews, and photos to Laravel...");

    const response = await fetch(
      "http://127.0.0.1:8000/api/import/business",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          job_id: JOB_ID,
          source_id: SOURCE_ID,
          business,
          reviews: reviewData,
          photos
        })
      }
    );

    // Read the response once, even if Laravel returns HTML or invalid JSON.
    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText || "Empty response from Laravel." };
    }

    if (!response.ok || result.success !== true) {
      console.error("Laravel API response:", {
        status: response.status,
        body: result
      });

      throw new Error(
        result.message ||
        result.error ||
        `Request failed with HTTP ${response.status}`
      );
    }

    const data = result.data || {};

    setStatus(
      `Saved ${data.business_name || business.name}. ` +
      `${data.reviews_created ?? 0} new reviews, ` +
      `${data.reviews_updated ?? 0} updated.`,
      "ok"
    );

  } catch (error) {
    console.error("Laravel database save failed:", error);
    setStatus(`Save failed: ${error.message}`, "err");
  } finally {
    button.disabled = false;
  }
});

  head.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    const box = host.getBoundingClientRect();
    drag = { dx: e.clientX - box.left, dy: e.clientY - box.top };
    head.style.cursor = "grabbing";
    pin();
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    host.style.left = `${Math.max(8, e.clientX - drag.dx)}px`;
    host.style.top = `${Math.max(8, e.clientY - drag.dy)}px`;
    host.style.right = "auto";
  });

  window.addEventListener("pointerup", () => {
    drag = null;
    head.style.cursor = "grab";
  });

  chrome.runtime.onMessage.addListener((msg, _sender, send) => {
    if (msg && msg.type === "TL_SHOW") {
      show();
      send({ ok: true });
      return true;
    }
    if (msg && msg.type === "TL_TOGGLE") {
      toggle();
      send({ ok: true });
      return true;
    }
    return undefined;
  });

  globalThis.__trendLabsOverlay = { show, hide, toggle, open, collapse };
})();
