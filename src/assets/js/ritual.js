document.addEventListener("DOMContentLoaded", () => {
  const ritual = document.querySelector(".ritual");
  if (!ritual) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches) {
    ritual.classList.add("is-still");
    return;
  }

  ritual.classList.add("is-waving");
  ritual.addEventListener(
    "animationend",
    (event) => {
      if (event.animationName && event.animationName !== "ritual-wave") return;
      ritual.classList.remove("is-waving");
      ritual.classList.add("is-idle");
    },
    { once: true }
  );

  const quote = document.querySelector(".quote-of-the-day");
  if (!quote) return;

  quote.addEventListener("mouseenter", () => {
    if (reduce.matches) return;
    ritual.classList.add("is-glance");
  });
  quote.addEventListener("mouseleave", () => {
    ritual.classList.remove("is-glance");
  });
});
