document.addEventListener("DOMContentLoaded", () => {
  const layer = document.getElementById("decor-layer");
  if (!layer) return;
  const pack = () => place(layer);
  pack();
  const quote = document.querySelector(".quote-of-the-day");
  if (quote) quote.addEventListener("quote:ready", () => window.setTimeout(pack, 40));
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(pack, 180);
  });
});

const ASPECT = {
  teapot: 110 / 76,
  cup: 70 / 56,
  coffee: 70 / 52,
  bike: 96 / 58,
  pin: 120 / 28,
  whittle: 90 / 44,
  masks: 88 / 52,
  hammer: 92 / 40,
  driver: 24 / 96,
  record: 1,
};

const CHARMS_LEFT = [
  { kind: "teapot", size: 50 },
  { kind: "cup", size: 40 },
  { kind: "bike", size: 55 },
  { kind: "coffee", size: 40 },
  { kind: "pin", size: 50 },
  { kind: "whittle", size: 46 },
  { kind: "hammer", size: 50 },
  { kind: "masks", size: 42 },
];

const CHARMS_RIGHT = [
  { kind: "cup", size: 40 },
  { kind: "teapot", size: 50 },
  { kind: "bike", size: 54 },
  { kind: "coffee", size: 40 },
  { kind: "hammer", size: 48 },
  { kind: "driver", size: 16 },
  { kind: "whittle", size: 44 },
  { kind: "pin", size: 50 },
  { kind: "masks", size: 42 },
];

const GAP = 20;
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

function gutters() {
  const post = document.querySelector(".page-about .post") || document.querySelector(".post");
  const postBox = post ? post.getBoundingClientRect() : { left: 200, right: window.innerWidth - 200 };
  const height = Math.max(240, window.innerHeight - TOP - 12);
  const found = {};
  const leftW = postBox.left - 14;
  const rightW = window.innerWidth - postBox.right - 14;
  if (leftW >= 48) found.left = { x: 8, y: TOP, w: leftW, h: height, side: "left" };
  if (rightW >= 48) found.right = { x: postBox.right + 8, y: TOP, w: rightW, h: height, side: "right" };
  return found;
}

function quoteBottom() {
  const moment = document.querySelector(".page-about .identity-moment");
  return moment ? moment.getBoundingClientRect().bottom : 0;
}

function avoidRects() {
  const boxes = [
    ...document.querySelectorAll(
      ".page-about .post-header, .page-about .profile, .page-about .clearfix, .page-about .identity-moment, .page-about .contact-note, .navbar"
    ),
  ];
  document.querySelectorAll(".page-about .contact-icons a").forEach((el) => boxes.push(el));
  return boxes.map((el) => {
    const box = el.getBoundingClientRect();
    return { x: box.left, y: box.top, w: box.width, h: box.height };
  });
}

function stamp(layer, kind, box, rotate) {
  const template = document.getElementById(`charm-${kind}`);
  if (!template || !template.content) return;
  const node = template.content.firstElementChild.cloneNode(true);
  node.style.left = `${box.cx}px`;
  node.style.top = `${box.cy}px`;
  node.style.width = `${box.w}px`;
  node.style.height = `${box.h}px`;
  node.style.setProperty("--tilt", `${rotate}deg`);
  if (kind === "record") {
    const disc = node.querySelector(".decor-record") || node;
    disc.style.animationDuration = `${80 + Math.abs(Math.round(rotate))}s`;
    if (rotate > 0) disc.style.animationDirection = "reverse";
  }
  layer.appendChild(node);
}

function tryStamp(layer, placed, blocked, kind, cx, cy, w, h, rotate, skipBlock) {
  const hit = rotBox(cx, cy, w, h, rotate);
  if (!skipBlock && blocked.some((other) => overlaps(hit, other, 10))) return false;
  if (placed.some((other) => overlaps(hit, other, GAP))) return false;
  placed.push(hit);
  stamp(layer, kind, { cx, cy, w, h }, rotate);
  return true;
}

function colX(region, col) {
  return region.x + region.w * (col === 0 ? 0.3 : 0.7);
}

function evenTs(count, from, to) {
  if (count <= 1) return [(from + to) / 2];
  return Array.from({ length: count }, (_, i) => from + ((to - from) * i) / (count - 1));
}

function vinylBox(region) {
  const w = Math.min(200, Math.max(128, region.w * 0.92));
  const cx = region.side === "left" ? region.x + w * 0.48 : region.x + region.w - w * 0.48;
  return { w, cx };
}

function placeGutter(layer, region, charms, placed, blocked, belowT) {
  const vinyl = vinylBox(region);
  const vinylY = region.y + region.h * 0.13;
  tryStamp(layer, placed, blocked, "record", vinyl.cx, vinylY, vinyl.w, vinyl.w, region.side === "left" ? -12 : 10, true);

  const nBelow = Math.max(3, Math.round(charms.length * (1 - belowT)));
  const nAbove = Math.max(1, charms.length - nBelow);
  const above = charms.slice(0, nAbove);
  const below = charms.slice(nAbove);
  const charmStart = 0.13 + vinyl.w / region.h / 2 + 0.04;
  const aboveTs = evenTs(above.length, Math.min(charmStart, belowT - 0.08), Math.max(charmStart, belowT - 0.05));
  const belowTs = evenTs(below.length, Math.min(0.97, belowT + 0.04), 0.97);

  above.forEach((charm, i) => {
    const t = aboveTs[i];
    const col = region.side === "left" ? 1 - (i % 2) : i % 2;
    const w = charm.size;
    const h = w / (ASPECT[charm.kind] || 1);
    tryStamp(layer, placed, blocked, charm.kind, colX(region, col), region.y + region.h * t, w, h, col === 0 ? -14 : 12, false);
  });

  below.forEach((charm, i) => {
    const t = belowTs[i];
    const col = region.side === "left" ? i % 2 : 1 - (i % 2);
    const w = charm.size;
    const h = w / (ASPECT[charm.kind] || 1);
    tryStamp(layer, placed, blocked, charm.kind, colX(region, col), region.y + region.h * t, w, h, col === 0 ? 10 : -16, false);
  });

  if (region.side === "right") {
    const w = Math.min(156, region.w * 0.82);
    const cx = region.x + region.w - w * 0.48;
    const cy = region.y + region.h * Math.max(0.86, belowT + 0.08);
    tryStamp(layer, placed, blocked, "record", cx, cy, w, w, -8, true);
  } else {
    const w = Math.min(148, region.w * 0.8);
    const cx = region.x + w * 0.48;
    const cy = region.y + region.h * Math.max(0.88, belowT + 0.1);
    tryStamp(layer, placed, blocked, "record", cx, cy, w, w, 8, true);
  }
}

function place(layer) {
  layer.replaceChildren();
  if (window.innerWidth < 992) return;
  const found = gutters();
  const blocked = avoidRects();
  const placed = [];
  const quoteY = quoteBottom();

  ["left", "right"].forEach((side) => {
    const region = found[side];
    if (!region) return;
    const belowT = quoteY ? Math.min(0.88, Math.max(0.45, (quoteY + 16 - region.y) / region.h)) : 0.72;
    placeGutter(layer, region, side === "left" ? CHARMS_LEFT : CHARMS_RIGHT, placed, blocked, belowT);
  });
}
