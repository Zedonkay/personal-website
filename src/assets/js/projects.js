document.addEventListener("DOMContentLoaded", () => {
  const projects = document.querySelector(".projects");
  if (!projects) return;

  const groups = Array.from(projects.querySelectorAll(".project-group"));
  const filters = Array.from(projects.querySelectorAll("[data-project-filter]"));
  const groupIds = new Set(groups.map((group) => group.id).filter(Boolean));

  const parseHash = () => window.location.hash.replace(/^#/, "");

  const setHash = (id) => {
    const url = new URL(window.location.href);
    url.hash = id || "";
    history.replaceState(null, "", id ? url : url.pathname + url.search);
  };

  const applyFilter = (id) => {
    const active = Boolean(id && groupIds.has(id));
    const selected = active ? id : "";
    projects.classList.toggle("is-filtered", active);
    groups.forEach((group) => group.classList.toggle("is-active", active && group.id === selected));
    filters.forEach((link) => {
      const on = active && link.getAttribute("data-project-filter") === selected;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-pressed", on ? "true" : "false");
    });
    setHash(selected);
  };

  const clearFilter = () => {
    if (!projects.classList.contains("is-filtered")) return;
    applyFilter("");
  };

  filters.forEach((link) => {
    link.setAttribute("role", "button");
    link.setAttribute("aria-pressed", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("data-project-filter");
      applyFilter(projects.classList.contains("is-filtered") && link.classList.contains("is-active") ? "" : id);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".project-filters, .project-group, .navbar, footer")) return;
    clearFilter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearFilter();
  });

  window.addEventListener("hashchange", () => applyFilter(parseHash()));

  const initial = parseHash();
  if (initial) applyFilter(initial);
});
