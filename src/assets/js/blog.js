document.addEventListener("DOMContentLoaded", () => {
  const blog = document.querySelector(".blog-index");
  if (!blog) return;

  const posts = Array.from(blog.querySelectorAll(".post-list > li"));
  const filters = Array.from(blog.querySelectorAll("[data-blog-filter]"));
  const empty = blog.querySelector(".blog-filter-empty");
  const filterIds = new Set(filters.map((link) => link.getAttribute("data-blog-filter")).filter(Boolean));

  const parseHash = () => window.location.hash.replace(/^#/, "");

  const setHash = (id) => {
    const url = new URL(window.location.href);
    url.hash = id || "";
    history.replaceState(null, "", id ? url : url.pathname + url.search);
  };

  const tokenList = (value) =>
    String(value || "")
      .split(/\s+/)
      .filter(Boolean);

  const matches = (item, id) => {
    if (!id) return true;
    const sep = id.indexOf("-");
    if (sep < 0) return false;
    const kind = id.slice(0, sep);
    const value = id.slice(sep + 1);
    if (kind === "tag") return tokenList(item.getAttribute("data-blog-tags")).includes(value);
    if (kind === "category") return tokenList(item.getAttribute("data-blog-categories")).includes(value);
    if (kind === "form") return item.getAttribute("data-blog-form") === value;
    if (kind === "series") return item.getAttribute("data-blog-series") === value;
    if (kind === "year") return item.getAttribute("data-blog-year") === value;
    return false;
  };

  const applyFilter = (id) => {
    const active = Boolean(id && (filterIds.has(id) || posts.some((item) => matches(item, id))));
    const selected = active ? id : "";
    blog.classList.toggle("is-filtered", active);
    let shown = 0;
    posts.forEach((item) => {
      const on = matches(item, selected);
      item.classList.toggle("is-active", active && on);
      if (!active || on) shown += 1;
    });
    filters.forEach((link) => {
      const on = active && link.getAttribute("data-blog-filter") === selected;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (empty) empty.hidden = !active || shown > 0;
    setHash(selected);
  };

  const clearFilter = () => {
    if (!blog.classList.contains("is-filtered")) return;
    applyFilter("");
  };

  filters.forEach((link) => {
    link.setAttribute("role", "button");
    link.setAttribute("aria-pressed", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const id = link.getAttribute("data-blog-filter");
      applyFilter(blog.classList.contains("is-filtered") && link.classList.contains("is-active") ? "" : id);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".blog-filters, .post-list, .navbar, footer")) return;
    clearFilter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") clearFilter();
  });

  window.addEventListener("hashchange", () => applyFilter(parseHash()));

  const initial = parseHash();
  if (initial) applyFilter(initial);
});
