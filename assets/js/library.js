document.addEventListener("DOMContentLoaded", () => {
  const library = document.querySelector(".library");
  if (!library) return;

  const blobs = Array.from(library.querySelectorAll(".library-blob"));
  const filters = Array.from(library.querySelectorAll("[data-library-filter]"));
  const blobIds = new Set(blobs.map((blob) => blob.id));

  const setHash = (id) => {
    const url = new URL(window.location.href);
    url.hash = id || "";
    history.replaceState(null, "", id ? url : url.pathname + url.search);
  };

  const applyFilter = (id) => {
    const active = Boolean(id && blobIds.has(id));
    library.classList.toggle("is-filtered", active);
    blobs.forEach((blob) => blob.classList.toggle("is-active", active && blob.id === id));
    filters.forEach((link) => {
      const on = active && link.getAttribute("data-library-filter") === id;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-pressed", on ? "true" : "false");
    });
    setHash(active ? id : "");
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
    if (target.closest(".library-filters, .library-blob, .navbar, footer")) return;
    clearFilter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearFilter();
  });

  const initial = window.location.hash.replace(/^#/, "");
  if (blobIds.has(initial)) applyFilter(initial);
});
