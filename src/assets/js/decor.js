document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("decor-layer");
  if (!layer) return;
  place(layer);
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => place(layer), 180);
  });
});

const ASPECT = {
  teapot: 110 / 76,
  cup: 70 / 56,
  coffee: 70 / 52,
  bike: 96 / 58,
  reel: 1,
  pin: 120 / 28,
  whittle: 90 / 44,
  masks: 88 / 52,
  hammer: 92 / 40,
  driver: 24 / 96,
  record: 1,
};

const LAYOUT = [
  { side: "left", x: 0.06, y: 0.08, kind: "record", size: 188, r: -14 },
  { side: "left", x: 0.7, y: 0.2, kind: "teapot", size: 50, r: -14 },
  { side: "left", x: 0.28, y: 0.32, kind: "cup", size: 40, r: 12 },
  { side: "left", x: 0.64, y: 0.44, kind: "bike", size: 55, r: -8 },
  { side: "left", x: 0.26, y: 0.56, kind: "reel", size: 36, r: 16 },
  { side: "left", x: 0.72, y: 0.64, kind: "coffee", size: 40, r: 8 },
  { side: "left", x: 0.3, y: 0.76, kind: "whittle", size: 46, r: -16 },
  { side: "left", x: 0.68, y: 0.88, kind: "hammer", size: 50, r: 18 },
  { side: "right", x: 0.78, y: 0.1, kind: "reel", size: 34, r: -12 },
  { side: "right", x: 0.9, y: 0.24, kind: "record", size: 168, r: 12 },
  { side: "right", x: 0.28, y: 0.36, kind: "coffee", size: 40, r: -12 },
  { side: "right", x: 0.68, y: 0.48, kind: "bike", size: 54, r: 10 },
  { side: "right", x: 0.26, y: 0.58, kind: "teapot", size: 48, r: 16 },
  { side: "right", x: 0.8, y: 0.68, kind: "driver", size: 16, r: -16 },
  { side: "right", x: 0.32, y: 0.78, kind: "whittle", size: 44, r: 14 },
  { side: "right", x: 0.7, y: 0.9, kind: "masks", size: 42, r: 8 },
  { side: "bottom", x: 0.1, y: 0.22, kind: "pin", size: 50, r: -22 },
  { side: "bottom", x: 0.2, y: 0.58, kind: "teapot", size: 44, r: 10 },
  { side: "bottom", x: 0.12, y: 0.82, kind: "masks", size: 40, r: -6 },
  { side: "bottom", x: 0.8, y: 0.24, kind: "hammer", size: 48, r: -12 },
  { side: "bottom", x: 0.9, y: 0.52, kind: "record", size: 152, r: -8 },
  { side: "bottom", x: 0.88, y: 0.84, kind: "cup", size: 38, r: -10 },
  { side: "bottom", x: 0.08, y: 0.42, kind: "bike", size: 52, r: 6 },
];

const GAP = 22;
const TOP = 72;

function rotBox(cx, cy, w, h, deg) {
  const rad = (Math.abs(deg) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rw = w * cos + h * sin;
  const rh = w * sin + h * cos;
  return { x: cx - rw / 2, y: cy - rh / 2, w: rw, h: rh };
}

function overlaps(a, b, gap) {
  return !(a.x + a.w + gap < b.x || b.x + b.w + gap < a.x || a.y + a.h + gap < b.y || b.y + b.h + gap < a.y);
}

function regions() {
  const post = document.querySelector(".page-about .post") || document.querySelector(".post");
  const moment = document.querySelector(".page-about .identity-moment");
  const postBox = post ? post.getBoundingClientRect() : { left: 200, right: window.innerWidth - 200, bottom: window.innerHeight };
  const height = Math.max(240, window.innerHeight - TOP - 16);
  const found = {};
  const leftW = postBox.left - 18;
  const rightW = window.innerWidth - postBox.right - 18;
  if (leftW >= 48) found.left = { x: 10, y: TOP, w: leftW, h: height };
  if (rightW >= 48) found.right = { x: postBox.right + 10, y: TOP, w: rightW, h: height };

  const belowQuote = moment ? moment.getBoundingClientRect().bottom + 10 : postBox.bottom + 8;
  const floorY = Math.min(belowQuote, window.innerHeight - 160);
  found.bottom = {
    x: 12,
    y: Math.max(TOP, floorY),
    w: window.innerWidth - 24,
    h: Math.max(80, window.innerHeight - Math.max(TOP, floorY) - 8),
  };
  return found;
}

function avoidRects() {
  return [
    ...document.querySelectorAll(
      ".page-about .post-header, .page-about .profile, .page-about .clearfix, .page-about .identity-moment, .page-about .contact-icons, .page-about .contact-note, .navbar"
    ),
  ].map((el) => {
    const box = el.getBoundingClientRect();
    return { x: box.left, y: box.top, w: box.width, h: box.height };
  });
}

function stamp(layer, item, box) {
  const template = document.getElementById(`charm-${item.kind}`);
  if (!template || !template.content) return;
  const node = template.content.firstElementChild.cloneNode(true);
  node.style.left = `${box.cx}px`;
  node.style.top = `${box.cy}px`;
  node.style.width = `${box.w}px`;
  node.style.height = `${box.h}px`;
  node.style.setProperty("--tilt", `${item.r}deg`);
  if (item.kind === "record") {
    const disc = node.querySelector(".decor-record") || node;
    disc.style.animationDuration = `${88 + Math.round(item.r)}s`;
    if (item.r > 0) disc.style.animationDirection = "reverse";
  }
  layer.appendChild(node);
}

function place(layer) {
  layer.replaceChildren();
  if (window.innerWidth < 992) return;
  const found = regions();
  const blocked = avoidRects();
  const placed = [];

  LAYOUT.forEach((item) => {
    const region = found[item.side];
    if (!region || region.h < 24 || region.w < 24) return;
    const aspect = ASPECT[item.kind] || 1;
    const w = item.size;
    const h = w / aspect;
    const pad = item.kind === "record" ? w * 0.38 : w / 2;
    const cx = Math.min(region.x + region.w - pad * 0.35, Math.max(region.x + pad * 0.35, region.x + region.w * item.x));
    const cy = Math.min(region.y + region.h - h * 0.25, Math.max(region.y + h * 0.25, region.y + region.h * item.y));
    const hit = rotBox(cx, cy, w, h, item.r);
    if (blocked.some((other) => overlaps(hit, other, 12))) return;
    if (placed.some((other) => overlaps(hit, other, GAP))) return;
    placed.push(hit);
    stamp(layer, item, { cx, cy, w, h });
  });
}
