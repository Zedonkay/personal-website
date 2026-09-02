document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".quote-of-the-day");
  const bankEl = document.getElementById("quote-bank");
  if (!root || !bankEl) return;

  let items = [];
  try {
    items = JSON.parse(bankEl.textContent);
  } catch (err) {
    return;
  }
  if (!Array.isArray(items) || items.length === 0) return;

  const mode = (root.getAttribute("data-selection") || "daily").toLowerCase();
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  let index;
  if (mode === "random") {
    index = Math.floor(Math.random() * items.length);
    if (items.length > 1) {
      try {
        const last = sessionStorage.getItem("quote-index");
        if (last !== null) {
          const lastIndex = Number(last);
          if (Number.isInteger(lastIndex) && lastIndex === index) {
            index = (index + 1 + Math.floor(Math.random() * (items.length - 1))) % items.length;
          }
        }
        sessionStorage.setItem("quote-index", String(index));
      } catch (err) {
        // sessionStorage can throw in private mode; keep the first pick
      }
    }
  } else {
    index = dayOfYear % items.length;
  }
  const quote = items[index];
  if (!quote || !quote.text) return;

  const textEl = root.querySelector(".quote-text");
  const footer = root.querySelector(".quote-footer");
  const cite = root.querySelector(".quote-cite");
  if (!textEl) return;

  textEl.textContent = quote.text;

  const attribution = quote.attribution || "";
  const source = quote.source || "";
  const url = quote.url || "";
  const label = [attribution, source].filter(Boolean).join(", ");

  if (cite && label) {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = label;
      if (/^https?:/i.test(url)) {
        link.rel = "noopener noreferrer";
        link.target = "_blank";
      }
      cite.replaceChildren(link);
    } else {
      cite.textContent = label;
    }
    if (footer) footer.hidden = false;
  }

  root.classList.add("is-ready");
  root.dispatchEvent(new CustomEvent("quote:ready", { bubbles: true }));
});
