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
  { side: "left", x: 0.18, y: 0.09, kind: "record", size: 56, r: -12 },
  { side: "left", x: 0.74, y: 0.2, kind: "teapot", size: 22, r: -14 },
  { side: "left", x: 0.28, y: 0.31, kind: "cup", size: 16, r: 14 },
  { side: "left", x: 0.66, y: 0.42, kind: "bike", size: 26, r: -8 },
  { side: "left", x: 0.24, y: 0.53, kind: "reel", size: 18, r: 18 },
  { side: "left", x: 0.74, y: 0.61, kind: "coffee", size: 16, r: 8 },
  { side: "left", x: 0.3, y: 0.72, kind: "whittle", size: 24, r: -16 },
  { side: "left", x: 0.7, y: 0.82, kind: "hammer", size: 24, r: 18 },
  { side: "left", x: 0.28, y: 0.92, kind: "masks", size: 20, r: -6 },
  { side: "right", x: 0.78, y: 0.08, kind: "reel", size: 18, r: -12 },
  { side: "right", x: 0.86, y: 0.22, kind: "record", size: 52, r: 10 },
  { side: "right", x: 0.26, y: 0.34, kind: "coffee", size: 16, r: -12 },
  { side: "right", x: 0.68, y: 0.44, kind: "bike", size: 26, r: 10 },
  { side: "right", x: 0.24, y: 0.54, kind: "teapot", size: 22, r: 16 },
  { side: "right", x: 0.82, y: 0.64, kind: "driver", size: 10, r: -16 },
  { side: "right", x: 0.3, y: 0.72, kind: "whittle", size: 22, r: 14 },
  { side: "right", x: 0.72, y: 0.82, kind: "masks", size: 20, r: 8 },
  { side: "right", x: 0.32, y: 0.92, kind: "cup", size: 16, r: -10 },
  { side: "bottom", x: 0.08, y: 0.28, kind: "pin", size: 28, r: -22 },
  { side: "bottom", x: 0.2, y: 0.68, kind: "teapot", size: 20, r: 8 },
  { side: "bottom", x: 0.8, y: 0.3, kind: "hammer", size: 24, r: -12 },
  { side: "bottom", x: 0.9, y: 0.62, kind: "reel", size: 18, r: 8 },
  { side: "bottom", x: 0.1, y: 0.82, kind: "bike", size: 24, r: 6 },
  { side: "bottom", x: 0.9, y: 0.84, kind: "pin", size: 26, r: 18 },
];

const GAP = 36;
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
  const social = document.querySelector(".page-about .social");
  const postBox = post ? post.getBoundingClientRect() : { left: 200, right: window.innerWidth - 200, bottom: window.innerHeight };
  const height = Math.max(240, window.innerHeight - TOP - 16);
  const found = {};
  const leftW = postBox.left - 18;
  const rightW = window.innerWidth - postBox.right - 18;
  if (leftW >= 48) found.left = { x: 10, y: TOP, w: leftW, h: height };
  if (rightW >= 48) found.right = { x: postBox.right + 10, y: TOP, w: rightW, h: height };

  const socialBox = social ? social.getBoundingClientRect() : null;
  const floorTop = socialBox ? socialBox.top - 8 : postBox.bottom + 8;
  const y = Math.min(floorTop, window.innerHeight - 150);
  found.bottom = {
    x: 12,
    y: Math.max(TOP, y),
    w: window.innerWidth - 24,
    h: Math.max(48, window.innerHeight - Math.max(TOP, y) - 12),
  };
  return found;
}

function avoidRects() {
  return [
    ...document.querySelectorAll(
      ".page-about .post-header, .page-about .profile, .page-about .clearfix, .page-about .identity-moment, .page-about .social, .navbar"
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
    const cx = region.x + region.w * item.x;
    const cy = region.y + region.h * item.y;
    const box = {
      cx,
      cy,
      w,
      h,
    };
    const hit = rotBox(cx, cy, w, h, item.r);
    const inside =
      hit.x >= region.x - 8 && hit.y >= region.y - 8 && hit.x + hit.w <= region.x + region.w + 8 && hit.y + hit.h <= region.y + region.h + 8;
    if (!inside) return;
    if (blocked.some((other) => overlaps(hit, other, 18))) return;
    if (placed.some((other) => overlaps(hit, other, GAP))) return;
    placed.push(hit);
    stamp(layer, item, box);
  });
}
