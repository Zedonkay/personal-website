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
  const dashLength = 3;
  const dashGap = 2.25;
  const dashPeriod = dashLength + dashGap;

  const snap = (value) => Math.round(value * 2) / 2;

  const cardRadiusPx = () => {
    const card = cards.find((entry) => entry.getBoundingClientRect().width > 0) || cards[0];
    if (!card) return 9;
    const value = parseFloat(getComputedStyle(card).borderTopLeftRadius);
    return Number.isFinite(value) ? value : 9;
  };

  const periodOffset = (start) => {
    const offset = start % dashPeriod;
    return offset < 0 ? offset + dashPeriod : offset;
  };

  const alignSharedEdges = (boxes) => {
    const tol = 2.5;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const yOverlap = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        const xOverlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        if (yOverlap > 8) {
          if (Math.abs(a.x + a.w - b.x) <= tol) {
            const mid = (a.x + a.w + b.x) / 2;
            a.w = mid - a.x;
            b.w += b.x - mid;
            b.x = mid;
          } else if (Math.abs(b.x + b.w - a.x) <= tol) {
            const mid = (b.x + b.w + a.x) / 2;
            b.w = mid - b.x;
            a.w += a.x - mid;
            a.x = mid;
          }
        }
        if (xOverlap > 8) {
          if (Math.abs(a.y + a.h - b.y) <= tol) {
            const mid = (a.y + a.h + b.y) / 2;
            a.h = mid - a.y;
            b.h += b.y - mid;
            b.y = mid;
          } else if (Math.abs(b.y + b.h - a.y) <= tol) {
            const mid = (b.y + b.h + a.y) / 2;
            b.h = mid - b.y;
            a.h += a.y - mid;
            a.y = mid;
          }
        }
      }
    }
  };

  const unionRanges = (ranges) => {
    const sorted = ranges
      .map(([start, end]) => [Math.min(start, end), Math.max(start, end)])
      .filter(([start, end]) => end - start > 0.75)
      .sort((left, right) => left[0] - right[0]);
    const merged = [];
    sorted.forEach(([start, end]) => {
      const last = merged[merged.length - 1];
      if (!last || start > last[1] + 0.75) merged.push([start, end]);
      else last[1] = Math.max(last[1], end);
    });
    return merged;
  };

  const collectAxis = (lines, vertical) => {
    const groups = [];
    lines.forEach((line) => {
      const aligned = vertical ? Math.abs(line.x1 - line.x2) <= 0.51 : Math.abs(line.y1 - line.y2) <= 0.51;
      if (!aligned) return;
      const pos = snap(vertical ? (line.x1 + line.x2) / 2 : (line.y1 + line.y2) / 2);
      const a = vertical ? line.y1 : line.x1;
      const b = vertical ? line.y2 : line.x2;
      const group = groups.find((entry) => Math.abs(entry.pos - pos) <= 0.6);
      if (group) group.ranges.push([a, b]);
      else groups.push({ pos, ranges: [[a, b]] });
    });
    return groups;
  };

  const paintStrokeSvg = (lines, arcs) => {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "library-outlines-svg");
    svg.setAttribute("overflow", "visible");

    const addPath = (d, offset) => {
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("class", "library-outline-path");
      path.setAttribute("d", d);
      path.setAttribute("stroke-dasharray", `${dashLength} ${dashGap}`);
      path.setAttribute("stroke-dashoffset", String(periodOffset(offset)));
      svg.appendChild(path);
    };

    collectAxis(lines, true).forEach(({ pos, ranges }) => {
      unionRanges(ranges).forEach(([y1, y2]) => {
        addPath(`M ${pos} ${snap(y1)} L ${pos} ${snap(y2)}`, y1);
      });
    });
    collectAxis(lines, false).forEach(({ pos, ranges }) => {
      unionRanges(ranges).forEach(([x1, x2]) => {
        addPath(`M ${snap(x1)} ${pos} L ${snap(x2)} ${pos}`, x1);
      });
    });
    arcs.forEach((arc) => {
      addPath(
        `M ${snap(arc.sx)} ${snap(arc.sy)} A ${snap(arc.rx)} ${snap(arc.ry)} 0 0 1 ${snap(arc.ex)} ${snap(arc.ey)}`,
        arc.offset
      );
    });

    outlines.appendChild(svg);
  };

  const emitBoxGeometry = (box, lines, arcs, rx, ry) => {
    rx = Math.min(Math.max(rx, 0), box.w / 2);
    ry = Math.min(Math.max(ry, 0), box.h / 2);
    if (box.w < 4 || box.h < 4) return;
    const x0 = box.x;
    const y0 = box.y;
    const x1 = box.x + box.w;
    const y1 = box.y + box.h;
    const round = rx >= 1 && ry >= 1;

    const pushH = (from, to, y) => {
      const left = Math.min(from, to);
      const right = Math.max(from, to);
      if (right - left > 0.75) lines.push({ x1: left, y1: y, x2: right, y2: y });
    };
    const pushV = (x, from, to) => {
      const top = Math.min(from, to);
      const bottom = Math.max(from, to);
      if (bottom - top > 0.75) lines.push({ x1: x, y1: top, x2: x, y2: bottom });
    };

    const topL = round ? x0 + rx : x0;
    const topR = round ? x1 - rx : x1;
    if (box.gapTo > box.gapFrom + 6) {
      pushH(topL, Math.min(box.gapFrom, topR), y0);
      pushH(Math.max(box.gapTo, topL), topR, y0);
    } else {
      pushH(topL, topR, y0);
    }
    pushV(x1, round ? y0 + ry : y0, round ? y1 - ry : y1);
    pushH(topL, topR, y1);
    pushV(x0, round ? y0 + ry : y0, round ? y1 - ry : y1);

    if (!round) return;

    arcs.push({ sx: x1 - rx, sy: y0, ex: x1, ey: y0 + ry, rx, ry, offset: x1 - rx });
    arcs.push({ sx: x1, sy: y1 - ry, ex: x1 - rx, ey: y1, rx, ry, offset: y1 - ry });
    arcs.push({ sx: x0 + rx, sy: y1, ex: x0, ey: y1 - ry, rx, ry, offset: x0 + rx });
    arcs.push({ sx: x0, sy: y0 + ry, ex: x0 + rx, ey: y0, rx, ry, offset: y0 + ry });
  };

  const paintHit = (box) => {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "library-outline");
    svg.setAttribute("width", String(box.w));
    svg.setAttribute("height", String(box.h));
    svg.style.left = `${box.x}px`;
    svg.style.top = `${box.y}px`;
    const hit = document.createElementNS(SVG, "rect");
    hit.setAttribute("class", "library-outline-hit");
    hit.setAttribute("width", String(box.w));
    hit.setAttribute("height", String(box.h));
    svg.appendChild(hit);
    outlines.appendChild(svg);
  };

  const paintOutlines = () => {
    if (!outlines || !blobsRoot) return;
    outlines.replaceChildren();
    if (highlights) highlights.replaceChildren();
    if (titles) titles.replaceChildren();
    library.classList.add("has-outlines");

    const origin = blobsRoot.getBoundingClientRect();
    const gridStyles = grid ? getComputedStyle(grid) : null;
    const gapX = parseFloat(gridStyles && gridStyles.columnGap);
    const gapY = parseFloat(gridStyles && gridStyles.rowGap);
    const padX = (Number.isFinite(gapX) ? gapX : 18) / 2;
    const padY = (Number.isFinite(gapY) ? gapY : padX * 2) / 2;
    const filtered = library.classList.contains("is-filtered");
    const titleInset = padX + 0.85 * rem();
    const boxes = [];

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
        boxes.push({
          x: left - origin.left - padX,
          y: top - origin.top - padY,
          w: right - left + padX * 2,
          h: bottom - top + padY * 2,
          gapFrom: 0,
          gapTo: 0,
          label: index === 0 ? blob.id || blob.dataset.group || "" : "",
        });
      });
    });

    alignSharedEdges(boxes);
    boxes.forEach((box) => {
      const right = snap(box.x + box.w);
      const bottom = snap(box.y + box.h);
      box.x = snap(box.x);
      box.y = snap(box.y);
      box.w = right - box.x;
      box.h = bottom - box.y;
      paintHit(box);

      if (!(box.label && titles && highlights)) return;

      const title = document.createElement("span");
      title.className = "library-label-title";
      title.textContent = box.label;
      title.style.left = `${box.x + titleInset}px`;
      title.style.top = `${box.y}px`;
      titles.appendChild(title);

      const titleRect = title.getBoundingClientRect();
      const highlight = document.createElement("span");
      highlight.className = "library-label-highlight";
      highlight.style.left = `${titleRect.left - origin.left - 6}px`;
      highlight.style.top = `${box.y}px`;
      highlight.style.width = `${titleRect.width + 12}px`;
      highlight.style.height = `${Math.max(titleRect.height, 1)}px`;
      highlights.appendChild(highlight);

      const punch = highlight.getBoundingClientRect();
      box.gapFrom = snap(punch.left - origin.left);
      box.gapTo = snap(punch.right - origin.left);
    });

    const lines = [];
    const arcs = [];
    const cardR = cardRadiusPx();
    const rx = cardR + padX;
    const ry = cardR + padY;
    boxes.forEach((box) => emitBoxGeometry(box, lines, arcs, rx, ry));
    paintStrokeSvg(lines, arcs);
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
