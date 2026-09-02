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
  teapot: 120 / 82,
  cup: 70 / 56,
  coffee: 70 / 52,
  bike: 76 / 58,
  pin: 120 / 28,
  clapper: 24 / 24,
  masks: 88 / 52,
  hammer: 1,
  record: 1,
};

const CHARMS_LEFT = [
  { kind: "teapot", size: 62 },
  { kind: "cup", size: 37 },
  { kind: "bike", size: 67 },
  { kind: "clapper", size: 41 },
  { kind: "coffee", size: 39 },
  { kind: "pin", size: 55 },
  { kind: "hammer", size: 53 },
  { kind: "masks", size: 44 },
  { kind: "cup", size: 35 },
  { kind: "coffee", size: 44 },
  { kind: "pin", size: 46 },
  { kind: "masks", size: 39 },
  { kind: "teapot", size: 48 },
];

const CHARMS_RIGHT = [
  { kind: "bike", size: 64 },
  { kind: "coffee", size: 41 },
  { kind: "masks", size: 51 },
  { kind: "pin", size: 60 },
  { kind: "teapot", size: 53 },
  { kind: "hammer", size: 46 },
  { kind: "cup", size: 39 },
  { kind: "clapper", size: 46 },
  { kind: "coffee", size: 37 },
  { kind: "pin", size: 44 },
  { kind: "clapper", size: 37 },
  { kind: "hammer", size: 58 },
  { kind: "bike", size: 55 },
];

const HAMMER_ANGLES = [-78, -54, -22, 16, 41, 68, -86, 82, -36, 57];
const GAP = 22;
const TOP = 72;

function pageBox(el) {
  const box = el.getBoundingClientRect();
  return {
    left: box.left + window.scrollX,
    top: box.top + window.scrollY,
    right: box.right + window.scrollX,
    bottom: box.bottom + window.scrollY,
    width: box.width,
    height: box.height,
  };
}

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

function floorLine() {
  const footer = document.querySelector("footer[role='contentinfo']");
  if (footer && !footer.classList.contains("is-deferred")) {
    const box = pageBox(footer);
    if (box.height > 8) return box.top;
  }
  const post = document.querySelector(".page-about .post") || document.querySelector(".post");
  if (post) return pageBox(post).bottom + 10;
  return document.documentElement.scrollHeight;
}

function gutters() {
  const post = document.querySelector(".page-about .post") || document.querySelector(".post");
  const postBox = post ? pageBox(post) : { left: 200, right: document.documentElement.clientWidth - 200 };
  const quote = document.querySelector(".page-about .identity-moment");
  const splitY = quote ? pageBox(quote).bottom : TOP + 220;
  const floorY = floorLine();
  const pageW = document.documentElement.clientWidth;

  const icons = [...document.querySelectorAll(".page-about .contact-icons a")];
  let innerLeft = postBox.left;
  let innerRight = postBox.right;
  if (icons.length) {
    const boxes = icons.map((el) => pageBox(el));
    innerLeft = Math.min(...boxes.map((box) => box.left));
    innerRight = Math.max(...boxes.map((box) => box.right));
  }

  const found = {};
  const leftW = postBox.left - 6;
  const rightW = pageW - postBox.right - 6;
  const upperH = Math.max(36, splitY - TOP);
  const lowerH = Math.max(36, floorY - splitY - 10);
  if (leftW >= 40) {
    found.leftUpper = { x: 0, y: TOP, w: leftW, h: upperH, side: "left" };
    found.leftLower = { x: 0, y: splitY + 8, w: Math.max(leftW, innerLeft - 14), h: lowerH, side: "left" };
  }
  if (rightW >= 40) {
    found.rightUpper = { x: postBox.right + 4, y: TOP, w: rightW, h: upperH, side: "right" };
    found.rightLower = {
      x: innerRight + 14,
      y: splitY + 8,
      w: Math.max(40, pageW - innerRight - 14),
      h: lowerH,
      side: "right",
    };
  }
  return { found, floorY, pageW };
}

function avoidRects(floorY) {
  const boxes = [
    ...document.querySelectorAll(".page-about .post-header, .page-about .profile, .page-about .clearfix, .page-about .identity-moment, .navbar"),
  ];
  document.querySelectorAll(".page-about .contact-icons a").forEach((el) => boxes.push(el));
  const mapped = boxes.map((el) => {
    const box = pageBox(el);
    return { x: box.left, y: box.top, w: box.width, h: box.height };
  });
  mapped.push({ x: 0, y: floorY, w: document.documentElement.clientWidth, h: 4000 });
  return mapped;
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

function unit(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function shuffle(list, seed) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(unit(seed + i) * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function sitAbove(cx, w, rotate, floorY, preferredCy) {
  let cy = preferredCy;
  const hit = rotBox(cx, cy, w, w, rotate);
  const overflow = hit.y + hit.h - (floorY - 6);
  if (overflow > 0) cy -= overflow;
  return cy;
}

function charmTilt(charm, idx, region) {
  if (charm.kind === "hammer") {
    const pick = Math.floor(unit(idx * 17 + charm.size + region.x + region.y) * HAMMER_ANGLES.length);
    return HAMMER_ANGLES[pick];
  }
  return Math.round((unit(charm.size + (region.side === "left" ? 3 : 11) + idx) - 0.5) * 46);
}

function placeVinyls(layer, placed, found, floorY, pageW) {
  const left = found.leftLower || found.leftUpper;
  if (left) {
    const w = Math.min(260, Math.max(170, Math.min(left.w, 220) * 1.15));
    const pull = w * 0.07;
    const cx = pull;
    const cy = floorY - pull;
    tryStamp(layer, placed, [], "record", cx, cy, w, w, -18, true);
  }

  const right = found.rightUpper || found.rightLower;
  if (right) {
    const w = Math.min(220, Math.max(150, right.w * 1.35));
    const hide = 0.52;
    const cx = pageW + w * (hide - 0.5);
    const mid = TOP + (floorY - TOP) * 0.44;
    const cy = sitAbove(cx, w, 14, floorY, Math.min(mid, floorY - 6 - w / 2));
    tryStamp(layer, placed, [], "record", cx, cy, w, w, 14, true);
  }
}

function shareByArea(regions, charms) {
  const live = regions.filter(Boolean);
  if (!live.length) return [];
  const areas = live.map((region) => Math.max(1, region.w * region.h));
  const total = areas.reduce((sum, area) => sum + area, 0);
  const bags = [];
  let used = 0;
  live.forEach((region, i) => {
    const n = i === live.length - 1 ? charms.length - used : Math.round((areas[i] / total) * charms.length);
    bags.push({ region, charms: charms.slice(used, used + n) });
    used += n;
  });
  return bags;
}

function placeCharms(layer, region, charms, placed, blocked) {
  if (!charms.length) return;
  const aspect = region.w / Math.max(24, region.h);
  const minCols = region.w >= 64 ? 2 : 1;
  const cols = Math.max(minCols, Math.round(Math.sqrt(charms.length * aspect * 1.45)));
  const rows = Math.max(1, Math.ceil(charms.length / cols));
  const jitterScale = region.side === "right" ? 0.72 : 0.4;
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const jitterX = (unit(row * 13 + col + (region.side === "left" ? 1 : 8) + region.y) - 0.5) * jitterScale;
      const jitterY = (unit(row * 9 + col + 4 + region.x) - 0.5) * (region.side === "right" ? 0.5 : 0.36);
      const stagger = region.side === "right" && row % 2 ? 0.34 : 0;
      const u = Math.min(0.94, Math.max(0.06, (col + 0.5 + jitterX + stagger) / cols));
      const v = Math.min(0.94, Math.max(0.06, (row + 0.5 + jitterY) / rows));
      cells.push({
        cx: region.x + 8 + u * Math.max(12, region.w - 16),
        cy: region.y + 10 + v * Math.max(24, region.h - 20),
      });
    }
  }

  const bag = shuffle(charms, region.side === "left" ? 2 + region.y : 19 + region.y);
  const slots = cells.slice(0, bag.length);
  const nudges =
    region.side === "right"
      ? [
          [0, 0],
          [18, -10],
          [-22, 12],
          [10, 20],
          [-16, -14],
          [26, 6],
          [-8, 18],
        ]
      : [
          [0, 0],
          [12, -8],
          [-14, 10],
          [8, 16],
          [-16, -6],
          [0, -18],
          [18, 4],
        ];
  bag.forEach((charm, idx) => {
    const w = charm.size;
    const h = w / (ASPECT[charm.kind] || 1);
    const rot = charmTilt(charm, idx, region);
    const cell = slots[idx] || cells[idx % cells.length];
    const wanderX = region.side === "right" ? (unit(idx * 11 + region.y) - 0.5) * Math.min(38, region.w * 0.4) : 0;
    for (let n = 0; n < nudges.length; n += 1) {
      const [dx, dy] = nudges[n];
      if (tryStamp(layer, placed, blocked, charm.kind, cell.cx + dx + wanderX, cell.cy + dy, w, h, rot, false)) return;
    }
  });
}

function place(layer) {
  layer.replaceChildren();
  const field = layer.parentElement;
  if (window.innerWidth < 992) {
    if (field) field.style.removeProperty("--decor-h");
    return;
  }
  const { found, floorY, pageW } = gutters();
  if (field) field.style.setProperty("--decor-h", `${Math.max(0, floorY)}px`);
  const blocked = avoidRects(floorY);
  const placed = [];
  placeVinyls(layer, placed, found, floorY, pageW);
  shareByArea([found.leftUpper, found.leftLower], CHARMS_LEFT).forEach((bag) => {
    placeCharms(layer, bag.region, bag.charms, placed, blocked);
  });
  shareByArea([found.rightUpper, found.rightLower], CHARMS_RIGHT).forEach((bag) => {
    placeCharms(layer, bag.region, bag.charms, placed, blocked);
  });
}
