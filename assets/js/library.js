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

  const paintOutlines = () => {
    if (!outlines || !blobsRoot) return;
    outlines.replaceChildren();
    if (highlights) highlights.replaceChildren();
    if (titles) titles.replaceChildren();
    library.classList.add("has-outlines");

    const origin = blobsRoot.getBoundingClientRect();
    const pad = 10;
    const filtered = library.classList.contains("is-filtered");
    const xPad = 14;

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
        const box = document.createElement("div");
        box.className = "library-outline";
        box.style.left = `${left - origin.left - pad}px`;
        box.style.top = `${top - origin.top - pad}px`;
        box.style.width = `${right - left + pad * 2}px`;
        box.style.height = `${bottom - top + pad * 2}px`;
        outlines.appendChild(box);

        if (index !== 0 || !titles || !highlights) return;

        const label = blob.id || blob.dataset.group || "";
        const titleLeft = left - origin.left - pad + xPad;
        const titleTop = top - origin.top - pad;
        const title = document.createElement("span");
        title.className = "library-label-title";
        title.textContent = label;
        title.style.left = `${titleLeft}px`;
        title.style.top = `${titleTop}px`;
        titles.appendChild(title);

        const titleRect = title.getBoundingClientRect();
        const highlight = document.createElement("span");
        highlight.className = "library-label-highlight";
        highlight.style.left = `${titleRect.left - origin.left - 6}px`;
        highlight.style.top = `${titleTop}px`;
        highlight.style.width = `${titleRect.width + 12}px`;
        highlight.style.height = `${Math.max(titleRect.height, 1)}px`;
        highlights.appendChild(highlight);
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
