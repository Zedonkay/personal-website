document.addEventListener("DOMContentLoaded", () => {
  const library = document.querySelector(".library");
  if (!library) return;

  const blobsRoot = library.querySelector(".library-blobs");
  const grid = library.querySelector(".library-grid");
  const outlines = library.querySelector(".library-outlines");
  const highlights = library.querySelector(".library-label-highlights");
  const titles = library.querySelector(".library-label-titles");
  const blobs = Array.from(library.querySelectorAll(".library-blob"));
  const cards = Array.from(library.querySelectorAll(".library-card"));
  const filters = Array.from(library.querySelectorAll("[data-library-filter]"));
  const blobIds = new Set(blobs.map((blob) => blob.id));

  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  const setHash = (id) => {
    const url = new URL(window.location.href);
    url.hash = id || "";
    history.replaceState(null, "", id ? url : url.pathname + url.search);
  };

  const visibleCards = () =>
    cards.filter((card) => {
      if (library.classList.contains("is-filtered") && !card.classList.contains("is-active")) return false;
      return true;
    });

  const fitGrid = () => {
    if (!grid) return 1;
    const styles = getComputedStyle(library);
    const min = parseFloat(styles.getPropertyValue("--library-cell-min")) * rem();
    const max = parseFloat(styles.getPropertyValue("--library-cell-max")) * rem();
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 18;
    const width = grid.clientWidth;
    cards.forEach((card) => {
      card.style.gridColumn = "";
    });
    if (!width || !min) return 1;

    const cellWidth = (count) => (width - gap * Math.max(0, count - 1)) / count;

    let cols = Math.max(1, Math.floor((width + gap) / (min + gap)));
    while (cols > 1 && cellWidth(cols) < min) cols -= 1;
    while (cellWidth(cols) > max && cellWidth(cols + 1) >= min) cols += 1;

    grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    const shown = visibleCards();
    const leftover = shown.length % cols;
    if (cols > 1 && leftover === 1) {
      shown[shown.length - 1].style.gridColumn = "1 / -1";
    }

    return cols;
  };

  const SVG = "http://www.w3.org/2000/svg";
  const outlineRadius = () => 1.15 * rem();
  const outlineStroke = 1.5;

  const roundedRectPath = (w, h, r, gapLeft, gapRight) => {
    r = Math.min(r, w / 2, h / 2);
    const n = (value) => Number(value.toFixed(3));
    const arc = (x, y) => `A ${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y)}`;
    const closed = [
      `M ${n(r)} 0`,
      `L ${n(w - r)} 0`,
      arc(w, r),
      `L ${n(w)} ${n(h - r)}`,
      arc(w - r, h),
      `L ${n(r)} ${n(h)}`,
      arc(0, h - r),
      `L 0 ${n(r)}`,
      arc(r, 0),
      "Z",
    ].join(" ");
    const minX = r + 0.5;
    const maxX = w - r - 0.5;
    if (!(gapRight > gapLeft + 6) || minX >= maxX) return { d: closed, open: false };
    const start = Math.min(Math.max(gapRight, minX), maxX);
    const end = Math.min(Math.max(gapLeft, minX), maxX);
    if (start - end < 6) return { d: closed, open: false };
    return {
      d: [
        `M ${n(start)} 0`,
        `L ${n(w - r)} 0`,
        arc(w, r),
        `L ${n(w)} ${n(h - r)}`,
        arc(w - r, h),
        `L ${n(r)} ${n(h)}`,
        arc(0, h - r),
        `L 0 ${n(r)}`,
        arc(r, 0),
        `L ${n(end)} 0`,
      ].join(" "),
      open: true,
    };
  };

  const fitDashes = (length, open) => {
    const targetDash = 6;
    const targetGap = 4;
    const period = targetDash + targetGap;
    if (length < 2) return { dash: length, gap: 0 };
    if (open) {
      const minPattern = targetDash * 2 + targetGap;
      if (length < minPattern) return { dash: length, gap: 0 };
      let gaps = Math.max(1, Math.round((length - targetDash) / period));
      let dash = (length - gaps * targetGap) / (gaps + 1);
      if (dash < targetDash * 0.55) {
        gaps = Math.max(1, gaps - 1);
        dash = (length - gaps * targetGap) / (gaps + 1);
      } else if (dash > targetDash * 1.65) {
        gaps += 1;
        dash = (length - gaps * targetGap) / (gaps + 1);
      }
      return { dash, gap: targetGap };
    }
    const cycles = Math.max(2, Math.round(length / period));
    const sized = length / cycles;
    return { dash: sized * (targetDash / period), gap: sized * (targetGap / period) };
  };

  const paintSvgOutline = (x, y, w, h, gapLeft, gapRight) => {
    const inset = outlineStroke / 2;
    const innerW = Math.max(0, w - outlineStroke);
    const innerH = Math.max(0, h - outlineStroke);
    const radius = Math.max(0, outlineRadius() - inset);
    const { d, open } = roundedRectPath(innerW, innerH, radius, gapLeft - inset, gapRight - inset);
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "library-outline");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.style.left = `${x}px`;
    svg.style.top = `${y}px`;
    const hit = document.createElementNS(SVG, "rect");
    hit.setAttribute("class", "library-outline-hit");
    hit.setAttribute("width", String(w));
    hit.setAttribute("height", String(h));
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("class", "library-outline-path");
    path.setAttribute("d", d);
    path.setAttribute("transform", `translate(${inset} ${inset})`);
    svg.append(hit, path);
    outlines.appendChild(svg);
    const length = path.getTotalLength();
    const { dash, gap } = fitDashes(length, open);
    path.setAttribute("stroke-dasharray", gap > 0.01 ? `${dash} ${gap}` : `${Math.max(length, 0.01)}`);
  };

  const paintOutlines = () => {
    if (!outlines || !blobsRoot) return;
    outlines.replaceChildren();
    if (highlights) highlights.replaceChildren();
    if (titles) titles.replaceChildren();
    library.classList.add("has-outlines");

    const origin = blobsRoot.getBoundingClientRect();
    const pad = 10;
    const filtered = library.classList.contains("is-filtered");
    const xPad = pad + 0.85 * rem();

    blobs.forEach((blob) => {
      const shown = Array.from(blob.querySelectorAll(".library-card")).filter((card) => {
        if (filtered && !card.classList.contains("is-active")) return false;
        const rect = card.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (!shown.length) return;

      const rows = [];
      shown.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const row = rows.find((entry) => Math.abs(entry.top - rect.top) < 8);
        if (row) row.rects.push(rect);
        else rows.push({ top: rect.top, rects: [rect] });
      });

      rows.forEach((row, index) => {
        const left = Math.min(...row.rects.map((rect) => rect.left));
        const right = Math.max(...row.rects.map((rect) => rect.right));
        const top = Math.min(...row.rects.map((rect) => rect.top));
        const bottom = Math.max(...row.rects.map((rect) => rect.bottom));
        const x = left - origin.left - pad;
        const y = top - origin.top - pad;
        const w = right - left + pad * 2;
        const h = bottom - top + pad * 2;
        let gapLeft = 0;
        let gapRight = 0;

        if (index === 0 && titles && highlights) {
          const label = blob.id || blob.dataset.group || "";
          const titleLeft = x + xPad;
          const title = document.createElement("span");
          title.className = "library-label-title";
          title.textContent = label;
          title.style.left = `${titleLeft}px`;
          title.style.top = `${y}px`;
          titles.appendChild(title);

          const titleRect = title.getBoundingClientRect();
          const highlight = document.createElement("span");
          highlight.className = "library-label-highlight";
          highlight.style.left = `${titleRect.left - origin.left - 6}px`;
          highlight.style.top = `${y}px`;
          highlight.style.width = `${titleRect.width + 12}px`;
          highlight.style.height = `${Math.max(titleRect.height, 1)}px`;
          highlights.appendChild(highlight);

          const punch = highlight.getBoundingClientRect();
          gapLeft = punch.left - (origin.left + x);
          gapRight = punch.right - (origin.left + x);
        }

        paintSvgOutline(x, y, w, h, gapLeft, gapRight);
      });
    });
  };

  const layout = () => {
    fitGrid();
    paintOutlines();
  };

  const applyFilter = (id) => {
    const active = Boolean(id && blobIds.has(id));
    library.classList.toggle("is-filtered", active);
    blobs.forEach((blob) => blob.classList.toggle("is-active", active && blob.id === id));
    cards.forEach((card) => {
      card.classList.toggle("is-active", active && card.dataset.group === id);
    });
    filters.forEach((link) => {
      const on = active && link.getAttribute("data-library-filter") === id;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-pressed", on ? "true" : "false");
    });
    setHash(active ? id : "");
    requestAnimationFrame(layout);
  };

  const clearFilter = () => {
    if (!library.classList.contains("is-filtered")) return;
    applyFilter("");
  };

  filters.forEach((link) => {
    link.setAttribute("role", "button");
    link.setAttribute("aria-pressed", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("data-library-filter");
      applyFilter(library.classList.contains("is-filtered") && link.classList.contains("is-active") ? "" : id);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".library-filters, .library-card, .library-outline, .navbar, footer")) return;
    clearFilter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearFilter();
  });

  const initial = window.location.hash.replace(/^#/, "");
  if (blobIds.has(initial)) applyFilter(initial);
  else layout();

  if (blobsRoot && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => layout()).observe(blobsRoot);
  } else {
    window.addEventListener("resize", layout);
  }

  library.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", layout, { once: true });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }
});
