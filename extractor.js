/* Injected into the open Google Maps / Search tab. Safe to run more than once. */
globalThis.__trendLabsReviews = (function () {
 const scrollState = {
  on: false,
  dir: "down",
  speed: 3,
  raf: 0,
  expandTimer: 0,
  target: "reviews",
  placeSnapshot: null,
};

  function clean(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
function getCoordinatesFromUrl(url) {
  try {
    const parsedUrl = new URL(url);

    // Extract coordinates from URLs like:
    // https://www.google.com/maps/@21.1458,79.0882,15z
    const match = (
      parsedUrl.pathname +
      parsedUrl.search +
      parsedUrl.hash
    ).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

    if (match) {
      return {
        latitude: Number(match[1]),
        longitude: Number(match[2])
      };
    }

    return {
      latitude: null,
      longitude: null
    };
  } catch (error) {
    console.error("Could not extract coordinates:", error);

    return {
      latitude: null,
      longitude: null
    };
  }
}


  function visible(el) {
    if (!el) return false;
    if (el.id === "trendlabs-reviews-root") return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    return el.getClientRects().length > 0;
  }

  function parseStars(label) {
    if (!label) return null;
    const normalized = clean(label).replace(",", ".");
    const match =
      normalized.match(/(\d+(?:\.\d+)?)\s*(?:out of\s*5|\/\s*5|star)/i) ||
      normalized.match(/^(\d+(?:\.\d+)?)$/);
    if (!match) return null;
    const n = Number(match[1]);
    return Number.isFinite(n) ? n : null;
  }

  function firstText(root, selectors) {
    for (const selector of selectors) {
      const el = root.querySelector(selector);
      const value = clean(el && el.innerText);
      if (value) return value;
    }
    return "";
  }

  function starFrom(el) {
    if (!el) return null;
    const labeled = [el, ...el.querySelectorAll("[aria-label], [role='img']")];
    for (const node of labeled) {
      const stars = parseStars(node.getAttribute("aria-label"));
      if (stars != null) return stars;
    }
    const filled = el.querySelectorAll("[class*='star'][style*='fill'], .hCCjke.elGi1d, span[style*='width']");
    if (filled.length && filled.length <= 5) return filled.length;
    return null;
  }

  function findScrollParent(el) {
    let node = el && el.parentElement;
    while (node && node !== document.body) {
      if (node.id === "trendlabs-reviews-root") {
        node = node.parentElement;
        continue;
      }
      const style = getComputedStyle(node);
      const scrollable = /(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflow);
      if (scrollable && node.scrollHeight > node.clientHeight + 40) return node;
      node = node.parentElement;
    }
    return null;
  }

  function reviewCards() {
    const byId = [...document.querySelectorAll("[data-review-id]")];
    if (byId.length) return byId.filter(visible);

    const fallback = [...document.querySelectorAll("[data-review-id], .jftiEf, .gws-localreviews__google-review, .WMllNe")];
    const unique = [];
    const seen = new Set();
    for (const card of fallback) {
      if (!visible(card) || seen.has(card)) continue;
      const hasText = card.querySelector(".wiI7pd, .MyEned, [class*='review-text'], span");
      const hasStars = starFrom(card) != null;
      if (!hasText && !hasStars) continue;
      seen.add(card);
      unique.push(card);
    }
    return unique;
  }

  function parseReview(card, index) {
    const author =
      firstText(card, [".d4r55", ".TSUbDb", ".P5Bobd", "[class*='reviewer']", "a[href*='contrib']"]) ||
      "Google user";

    const meta = firstText(card, [".RfnDt", ".A503be", ".dehysf"]);
    const date =
      firstText(card, [".rsqaWe", ".p32iuc", ".xRkPPb", "[class*='rsqaWe']"]) ||
      (meta.match(/\b(\d+\s+\w+\s+ago|a\s+\w+\s+ago|\d{1,2}\s+\w+\s+\d{4}|yesterday|today)\b/i) || [])[0] ||
      "";

    const textEl =
      card.querySelector(".wiI7pd") ||
      card.querySelector(".MyEned span") ||
      card.querySelector("[class*='review-full-text']") ||
      card.querySelector(".review-snippet") ||
      card.querySelector("[data-expandable-section]");

    let text = clean(textEl && (textEl.innerText || textEl.textContent));
    if (textEl) {
      const more = textEl.parentElement && textEl.parentElement.querySelector("button");
      if (more && /more|altro|plus|más|mehr/i.test(clean(more.innerText))) {
        text = text.replace(/\s*(More|Altro|Plus|Más|Mehr)$/i, "").trim();
      }
    }

    if (!text) {
      const clone = card.cloneNode(true);
      clone.querySelectorAll("button, img, svg, [aria-hidden='true']").forEach((n) => n.remove());
      const blob = clean(clone.innerText);
      text = blob
        .replace(author, "")
        .replace(meta, "")
        .replace(date, "")
        .replace(/\b\d(?:\.\d)?\s*star[s]?\b/gi, "")
        .replace(/Local Guide.*?(photos?|reviews?)/gi, "")
        .trim();
    }

    text = text
      .replace(/\s*Translated by Google.*$/i, "")
      .replace(/\s*(See original|Original)$/i, "")
      .replace(/\s*(More|Less)$/i, "")
      .trim();

    const ownerBlock = card.querySelector(".CDe7pd, .d6kMMb, [class*='owner']");
    let ownerResponse = "";
    if (ownerBlock) {
      ownerResponse = clean(
        (ownerBlock.querySelector(".wiI7pd") || ownerBlock).innerText
      ).replace(/^Response from the owner[:\s]*/i, "");
    }

    const rating = starFrom(card) || starFrom(card.querySelector(".kvMYJc, [role='img']"));
    const id = card.getAttribute("data-review-id") || `review-${index + 1}`;
    const photos = collectPhotoUrls(card, "review").map((p) => p.url);

    return {
      id,
      author,
      rating,
      date,
      meta,
      text,
      ownerResponse,
      photos,
    };
  }

  

function placeInfo() {
  const cleanText = (value) =>
    clean(value)
      .replace(/^(address|phone|website|category)\s*:\s*/i, "")
      .trim();

  // 1. Business name
  const name =
    firstText(document, [
      "h1.DUwDvf",
      "h1.fontHeadlineLarge",
      "h1[data-attrid='title']",
      "[role='main'] h1",
      "h1"
    ]) ||
    clean(
      document.title
        .replace(/ - Google Maps.*$/i, "")
        .replace(/ - Google Search.*$/i, "")
    );

  // 2. Rating
  const ratingEl = document.querySelector(
    "div.F7nice span[aria-hidden='true']"
  );

  const rating =
    parseStars(
      ratingEl?.getAttribute("aria-label") ||
      ratingEl?.innerText
    ) ??
    parseStars(
      firstText(document, [
        "[aria-label*='stars'][role='img']",
        "span.ceNzKf"
      ])
    );

  // 3. Review count — inspect multiple possible Google Maps elements.
  const countElements = [
    ...document.querySelectorAll(
      [
        "div.F7nice",
        "button[aria-label*='review' i]",
        "button[aria-label*='avis' i]",
        "button[aria-label*='reseña' i]",
        "button[jsaction*='pane.rating.moreReviews']",
        "[aria-label*='Google reviews' i]"
      ].join(",")
    )
  ];

  let reviewCount = null;

  for (const el of countElements) {
    const text = [
      el.getAttribute("aria-label"),
      el.getAttribute("title"),
      el.innerText
    ].filter(Boolean).join(" ");

    // Match a count associated with review wording, including
    // common English and French/Spanish labels.
    const match = text.match(
      /([\d.,\s]+)\s*(?:Google\s*)?(?:reviews?|ratings?|avis|reseñas|opiniones|recensioni|bewertungen)\b/i
    );

    if (match) {
      const digits = match[1].replace(/[^\d]/g, "");
      if (digits) {
        reviewCount = Number(digits);
        break;
      }
    }
  }

  // 4. Category
  const categoryElement = document.querySelector(
    [
      "button[jsaction*='pane.rating.category']",
      "button.DkEaL",
      "[data-item-id='category']",
      "button[aria-label*='Category' i]"
    ].join(",")
  );

  const category = categoryElement
    ? cleanText(
        categoryElement.getAttribute("aria-label") ||
        categoryElement.innerText
      )
    : null;

  // 5. Address
  const addressElement = document.querySelector(
    [
      "[data-item-id='address']",
      "button[data-item-id='address']",
      "[aria-label^='Address:']"
    ].join(",")
  );

  const address = addressElement
    ? cleanText(
        addressElement.getAttribute("aria-label") ||
        addressElement.innerText ||
        addressElement.textContent
      )
    : null;

  // 6. Phone number
  const phoneElement = document.querySelector(
    [
      "[data-item-id^='phone:tel:']",
      "[data-item-id^='phone:']",
      "[aria-label^='Phone:']"
    ].join(",")
  );

  const phone = phoneElement
    ? cleanText(
        phoneElement.getAttribute("aria-label") ||
        phoneElement.innerText ||
        phoneElement.textContent
      )
    : null;

  // 7. Website
  const websiteElement = document.querySelector(
    [
      "a[data-item-id='authority']",
      "a[data-item-id^='authority']",
      "a[aria-label^='Website:']"
    ].join(",")
  );

  let website = null;

  if (websiteElement) {
    const href = websiteElement.href;

    if (href && /^https?:\/\//i.test(href)) {
      website = href;
    }
  }

  // 8. Google Maps URL and external ID
  const mapsUrl = location.href;

  let externalId = null;

  const externalIdMatch = mapsUrl.match(/!1s([^!]+)/);

  if (externalIdMatch) {
    try {
      externalId = decodeURIComponent(externalIdMatch[1]);
    } catch {
      externalId = externalIdMatch[1];
    }
  }

  // 9. Coordinates
  const coordinates = getCoordinatesFromUrl(mapsUrl);

  const result = {
    name: name || null,
    category: category || null,
    address: address || null,
    phone: phone || null,
    website: website || null,
    rating,
    reviewCount,
    externalId,
    url: mapsUrl,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude
  };

  // Debug: inspect what the extension actually extracts.
  console.log("[TrendLabs] Extracted business details:", result);

  return result;
}


  function isMapsPage() {
    const host = location.hostname;
    const path = location.pathname;
    return (
      host.includes("google.") &&
      (path.includes("/maps") || host.startsWith("maps.") || /google\.[^/]+\/search/.test(location.href))
    );
  }

  function clickMatching(els, pattern) {
    let n = 0;
    for (const el of els) {
      if (!visible(el)) continue;
      const label = clean(el.getAttribute("aria-label") || el.innerText || el.textContent);
      if (pattern.test(label)) {
        el.click();
        n += 1;
      }
    }
    return n;
  }

  function clickFirst(els, pattern) {
    for (const el of els) {
      if (!visible(el)) continue;
      const label = clean(el.getAttribute("aria-label") || el.innerText || el.textContent);
      if (!pattern.test(label) || label.length > 80) continue;
      el.click();
      return true;
    }
    return false;
  }

  function openReviewsTab() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    if (clickMatching(tabs, /review|recension|avis|reseña|bewertung/i) > 0) return true;
    const buttons = [...document.querySelectorAll("button, a")];
    return clickMatching(buttons, /^(reviews?|recensioni|avis|reseñas|bewertungen)\b/i) > 0;
  }

  function openPhotosTab() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    if (clickFirst(tabs, /^(photos?|fotos?|photo|foto)\b/i)) return true;
    const hero = document.querySelector(
      '[jsaction*="heroHeaderImage"], button[jsaction*="pane.hero"], button[aria-label*="Photo of"], a[aria-label*="Photo of"]'
    );
    if (hero && visible(hero) && !hero.closest("[data-review-id]")) {
      hero.click();
      return true;
    }
    const buttons = [...document.querySelectorAll("button, a, [role='button']")];
    if (clickFirst(buttons, /^(photos?|see photos|all photos|view photos|fotos?)\b/i)) return true;
    return clickFirst(buttons, /\b\d[\d,]*\s+photos?\b/i);
  }

  function openSeeAllPhotos() {
    const els = [...document.querySelectorAll("button, a, [role='button']")];
    return clickFirst(els, /see all photos|view all photos|all \d[\d,]* photos|show all photos/i);
  }

  function openAllPhotosFilter() {
    const chips = [...document.querySelectorAll('[role="tab"], [role="radio"], button, a')];
    return clickFirst(chips, /^(all|all photos|by owner|from the owner)$/i);
  }

  function expandTruncated() {
    const buttons = [...document.querySelectorAll("[data-review-id] button, .MyEned button, .wiI7pd ~ button")];
    let n = 0;
    for (const btn of buttons) {
      if (!visible(btn)) continue;
      if (btn.getAttribute("aria-expanded") === "false") {
        btn.click();
        n += 1;
        continue;
      }
      const label = clean(btn.innerText || btn.getAttribute("aria-label"));
      if (/^(more|see more|read more|altro|plus|más|mehr|voir plus|mostra altro)$/i.test(label)) {
        btn.click();
        n += 1;
      }
    }
    return n;
  }

  function findReviewScroller() {
    const cards = reviewCards();
    if (cards[0]) {
      const parent = findScrollParent(cards[0]);
      if (parent) return parent;
    }

    const hints = document.querySelectorAll(".m6QErb.DxyBCb, .m6QErb.DxyBCb.kA9KIf, [role='main']");
    for (const el of hints) {
      if (!visible(el)) continue;
      if (el.scrollHeight > el.clientHeight + 40) return el;
      const inner = findScrollParent(el.querySelector("[data-review-id], .jftiEf"));
      if (inner) return inner;
    }

    const candidates = [...document.querySelectorAll("div")].filter((el) => {
      if (!visible(el) || el.id === "trendlabs-reviews-root") return false;
      const box = el.getBoundingClientRect();
      if (box.height < 220 || box.left > window.innerWidth * 0.62) return false;
      const style = getComputedStyle(el);
      const scrollable = /(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflow);
      return scrollable && el.scrollHeight > el.clientHeight + 80;
    });
    candidates.sort((a, b) => b.clientHeight - a.clientHeight);
    return candidates[0] || document.scrollingElement;
  }

  function isPhotoUrl(url) {
    if (!url || url.startsWith("data:")) return false;
    if (/streetviewpixels|maps\.gstatic|khms\d|\/maps\/vt|google\.com\/maps\/embed/i.test(url)) return false;
    if (/\/a\/|\/a-\//.test(url)) return false;
    return /googleusercontent\.com|ggpht\.com|lh\d+\.google/i.test(url);
  }

  function upgradePhotoUrl(raw) {
    try {
      const abs = new URL(raw, location.href).href.split("?")[0];
      if (/=/.test(abs)) return abs.replace(/=[^/]*$/, "=s0");
      return abs;
    } catch {
      return raw;
    }
  }

  function photoKey(url) {
    const m = String(url).match(/\/p\/([^/=?#]+)/) || String(url).match(/\/d\/([^/=?#]+)/);
    return m ? m[1] : upgradePhotoUrl(url);
  }

  function srcFromImg(img) {
    const srcset = img.getAttribute("srcset") || img.getAttribute("data-srcset") || "";
    if (srcset) {
      const parts = srcset
        .split(",")
        .map((s) => s.trim().split(/\s+/)[0])
        .filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
    return img.currentSrc || img.src || img.getAttribute("data-src") || img.getAttribute("data-thumbnail") || "";
  }

  function bgUrl(el) {
    const style = el.getAttribute("style") || "";
    const fromAttr = style.match(/url\((['"]?)([^"')]+)\1\)/);
    if (fromAttr) return fromAttr[2];
    return "";
  }

  function collectPhotoUrls(root, source) {
    const found = new Map();

    function add(raw, extra) {
      const url = upgradePhotoUrl(raw);
      if (!isPhotoUrl(url)) return;
      const key = photoKey(url);
      if (found.has(key)) return;
      found.set(key, {
        url,
        thumb: raw,
        source: extra.source || source,
        alt: extra.alt || "",
      });
    }

    root.querySelectorAll("img").forEach((img) => {
      if (img.closest("#trendlabs-reviews-root")) return;
      const w = img.naturalWidth || img.width || 0;
      const h = img.naturalHeight || img.height || 0;
      if (w && h && w < 40 && h < 40) return;
      add(srcFromImg(img), { alt: img.getAttribute("alt") || "", source });
    });

    root.querySelectorAll('[style*="url("], [style*="googleusercontent"]').forEach((el) => {
      if (el.closest("#trendlabs-reviews-root")) return;
      const url = bgUrl(el);
      if (url) add(url, { alt: el.getAttribute("aria-label") || "", source });
    });

    root.querySelectorAll("[href*='googleusercontent'], [href*='/p/'], [data-src*='googleusercontent'], [data-thumbnail]").forEach((el) => {
      if (el.closest("#trendlabs-reviews-root")) return;
      add(el.getAttribute("href") || el.getAttribute("data-src") || el.getAttribute("data-thumbnail") || "", {
        alt: el.getAttribute("aria-label") || "",
        source,
      });
    });

    return [...found.values()];
  }

  function harvestPhotoIds() {
    const ids = new Set();
    const addText = (text) => {
      if (!text || text.length < 12) return;
      let m;
      const fromPath = /\/p\/(AF1Qip[A-Za-z0-9_-]+)/g;
      while ((m = fromPath.exec(text))) ids.add(m[1]);
      const fromJson = /(?:^|[^A-Za-z0-9_-])(AF1Qip[A-Za-z0-9_-]{8,})/g;
      while ((m = fromJson.exec(text))) ids.add(m[1]);
    };

    document.querySelectorAll("script").forEach((s) => {
      const t = s.textContent;
      if (t && (t.includes("AF1Qip") || t.includes("/p/"))) addText(t);
    });
    document.querySelectorAll("[src], [srcset], [style], [data-src], [href]").forEach((el) => {
      addText(el.getAttribute("src") || "");
      addText(el.getAttribute("srcset") || "");
      addText(el.getAttribute("style") || "");
      addText(el.getAttribute("data-src") || "");
      addText(el.getAttribute("href") || "");
    });
    return ids;
  }

  function photosFromHarvest() {
    return [...harvestPhotoIds()].map((id) => ({
      url: `https://lh3.googleusercontent.com/p/${id}=s0`,
      thumb: `https://lh3.googleusercontent.com/p/${id}=w200-h200-k-no`,
      source: "place",
      alt: "",
    }));
  }

  function extractImages() {
    const byKey = new Map();
    photosFromHarvest().forEach((p) => byKey.set(photoKey(p.url), p));
    collectPhotoUrls(document, "place").forEach((p) => byKey.set(photoKey(p.url), p));
    reviewCards().forEach((card) => {
      collectPhotoUrls(card, "review").forEach((p) => {
        byKey.set(photoKey(p.url), { ...p, source: "review" });
      });
    });
    return [...byKey.values()];
  }

  function photoTiles() {
    return [...document.querySelectorAll("img[src*='googleusercontent.com/p/'], img[src*='ggpht.com/p/'], [style*='googleusercontent.com/p/'], a[href*='googleusercontent.com/p/'], button[aria-label*='Photo']")].filter(
      (el) => visible(el) && !el.closest("#trendlabs-reviews-root") && !el.closest("[data-review-id]")
    );
  }

  function findPhotoScroller() {
    const tiles = photoTiles();
    const sample = tiles[Math.min(8, Math.max(0, tiles.length - 1))] || tiles[0];
    if (sample) {
      const parent = findScrollParent(sample);
      if (parent) return parent;
    }
    return findReviewScroller();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function loadAllPhotos(onProgress) {
    openPhotosTab();
    await sleep(700);
    openSeeAllPhotos();
    await sleep(450);
    openAllPhotosFilter();
    await sleep(350);

    let last = 0;
    let stable = 0;
    const started = Date.now();
    const harvestedStart = harvestPhotoIds().size;
    while (Date.now() - started < 28000) {
      const scroller = findPhotoScroller();
      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
        scroller.scrollBy(0, 360);
      }
      const n = Math.max(collectPhotoUrls(document, "place").length, harvestedStart);
      if (typeof onProgress === "function") onProgress(n);
      if (n <= last) {
        stable += 1;
        if (stable >= 5) break;
      } else {
        stable = 0;
        last = n;
      }
      await sleep(420);
    }
    return { ok: true, count: extractImages().length };
  }

  function snapshotReviews() {
    expandTruncated();
    return reviewCards()
      .map(parseReview)
      .filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i)
      .filter((r) => r.text.length >= 8 || r.rating != null);
  }

 
async function extract() {
  if (!isMapsPage()) {
    return {
      ok: false,
      error: "Open a Google Maps place, then try again.",
    };
  }

  // STEP 1: Extract overview first.
  const place = placeInfo();
  scrollState.placeSnapshot = place;

  console.log("[TrendLabs] Overview extracted:", place);

  // STEP 2: Open Reviews after capturing overview.
  openReviewsTab();
  await sleep(1000);

  // STEP 3: Extract currently loaded reviews.
  const reviews = snapshotReviews();
  const images = extractImages();

  console.log(
    "[TrendLabs] Reviews extracted:",
    reviews.length
  );

  return {
    ok: true,
    place,
    reviews,
    images,
    foundOnPage: reviews.length,
  };
}

  async function extractFull(onProgress) {
    if (!isMapsPage()) {
      return {
        ok: false,
        error: "Open a Google Maps place, then try again.",
      };
    }

    const place = placeInfo();
    if (typeof onProgress === "function") onProgress({ stage: "reviews", reviews: 0, images: 0 });
    const reviews = snapshotReviews();
    if (typeof onProgress === "function") onProgress({ stage: "reviews", reviews: reviews.length, images: extractImages().length });

    await loadAllPhotos((n) => {
      if (typeof onProgress === "function") onProgress({ stage: "photos", reviews: reviews.length, images: n });
    });

    const images = extractImages();
    return {
      ok: true,
      place,
      reviews,
      images,
      foundOnPage: reviews.length,
    };
  }

  function loadMore() {
    openReviewsTab();
    const expanded = expandTruncated();
    const scroller = findReviewScroller();
    let scrolled = false;
    if (scroller) {
      const delta = scrollState.dir === "up" ? -Math.max(240, scroller.clientHeight * 0.85) : Math.max(240, scroller.clientHeight * 0.85);
      scroller.scrollTop += delta;
      scrolled = true;
    }
    return {
      ok: true,
      expanded,
      scrolled,
      visible: reviewCards().length,
    };
  }

  function findActiveScroller() {
    return scrollState.target === "photos" ? findPhotoScroller() : findReviewScroller();
  }

  function loopScroll() {
    if (!scrollState.on) return;
    const el = findActiveScroller();
    if (el) {
      const delta = scrollState.dir === "up" ? -scrollState.speed : scrollState.speed;
      el.scrollTop += delta;
    }
    scrollState.raf = requestAnimationFrame(loopScroll);
  }

  
function startAutoScroll(opts = {}) {
  if (!isMapsPage()) {
    return {
      ok: false,
      error: "Open a Google Maps place, then try again.",
    };
  }

  if (opts.direction) {
    scrollState.dir = opts.direction;
  }

  if (opts.speed != null) {
    scrollState.speed =
      Number(opts.speed) || scrollState.speed;
  }

  if (opts.target) {
    scrollState.target = opts.target;
  }

  // STEP 1: Capture Overview BEFORE changing sections.
  if (scrollState.target !== "photos") {
    scrollState.placeSnapshot = placeInfo();

    console.log(
      "[TrendLabs] Step 1: Overview captured:",
      scrollState.placeSnapshot
    );

    // STEP 2: Now open the Reviews section.
    openReviewsTab();
  } else {
    openPhotosTab();
  }

  // Start auto-scroll only once.
  if (scrollState.on) {
    return scrollStatus();
  }

  scrollState.on = true;
  scrollState.raf = requestAnimationFrame(loopScroll);

  if (!scrollState.expandTimer) {
    scrollState.expandTimer = setInterval(() => {
      if (scrollState.target === "photos") return;
      expandTruncated();
    }, 800);
  }

  return {
    ...scrollStatus(),
    overviewCaptured: !!scrollState.placeSnapshot,
    place: scrollState.placeSnapshot,
  };
}


  function stopAutoScroll() {
    scrollState.on = false;
    if (scrollState.raf) cancelAnimationFrame(scrollState.raf);
    scrollState.raf = 0;
    if (scrollState.expandTimer) {
      clearInterval(scrollState.expandTimer);
      scrollState.expandTimer = 0;
    }
    return scrollStatus();
  }

  function setScrollOpts(opts = {}) {
    if (opts.direction) scrollState.dir = opts.direction;
    if (opts.speed != null) scrollState.speed = Number(opts.speed) || scrollState.speed;
    if (opts.target) {
      scrollState.target = opts.target;
      if (scrollState.on) {
        if (scrollState.target === "photos") openPhotosTab();
        else openReviewsTab();
      }
    }
    return scrollStatus();
  }

  function scrollStatus() {
    const el = findActiveScroller();
    const count = scrollState.target === "photos" ? collectPhotoUrls(document, "place").length : reviewCards().length;
    const atEnd = !!(el && el.scrollTop + el.clientHeight >= el.scrollHeight - 12);
    const atStart = !!(el && el.scrollTop <= 12);
    return {
      ok: true,
      on: scrollState.on,
      direction: scrollState.dir,
      speed: scrollState.speed,
      target: scrollState.target,
      count,
      hasScroller: !!el,
      atEnd,
      atStart,
    };
  }

  return {
    extract,
    extractFull,
    extractImages,
    loadAllPhotos,
    loadMore,
    openReviewsTab,
    openPhotosTab,
    expandTruncated,
    isMapsPage,
    findReviewScroller,
    findPhotoScroller,
    startAutoScroll,
    stopAutoScroll,
    setScrollOpts,
    scrollStatus,
  };
})();
