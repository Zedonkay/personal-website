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
  clapper: 80 / 72,
  whittle: 90 / 44,
  masks: 88 / 52,
  hammer: 92 / 40,
  driver: 24 / 96,
  record: 1,
};

const CHARMS_LEFT = [
  { kind: "teapot", size: 54 },
  { kind: "cup", size: 32 },
  { kind: "bike", size: 58 },
  { kind: "clapper", size: 36 },
  { kind: "coffee", size: 34 },
  { kind: "pin", size: 48 },
  { kind: "whittle", size: 42 },
  { kind: "hammer", size: 46 },
  { kind: "masks", size: 38 },
  { kind: "cup", size: 30 },
  { kind: "driver", size: 16 },
  { kind: "pin", size: 40 },
  { kind: "coffee", size: 38 },
  { kind: "bike", size: 50 },
  { kind: "clapper", size: 34 },
  { kind: "whittle", size: 36 },
  { kind: "hammer", size: 40 },
  { kind: "masks", size: 34 },
  { kind: "teapot", size: 42 },
  { kind: "cup", size: 28 },
];

const CHARMS_RIGHT = [
  { kind: "bike", size: 56 },
  { kind: "coffee", size: 36 },
  { kind: "masks", size: 44 },
  { kind: "pin", size: 52 },
  { kind: "teapot", size: 46 },
  { kind: "hammer", size: 40 },
  { kind: "cup", size: 34 },
  { kind: "clapper", size: 40 },
  { kind: "driver", size: 18 },
  { kind: "whittle", size: 40 },
  { kind: "cup", size: 30 },
  { kind: "pin", size: 38 },
  { kind: "coffee", size: 32 },
  { kind: "clapper", size: 32 },
  { kind: "teapot", size: 40 },
  { kind: "masks", size: 36 },
  { kind: "hammer", size: 50 },
  { kind: "whittle", size: 34 },
  { kind: "bike", size: 48 },
];

const GAP = 14;
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
  const quote = document.querySelector(".page-about .identity-moment");
  const splitY = quote ? quote.getBoundingClientRect().bottom : TOP + 220;
  const footer = document.querySelector("footer[role='contentinfo']");
  let floorY = window.innerHeight;
  if (footer && !footer.classList.contains("is-deferred")) {
    const box = footer.getBoundingClientRect();
    if (box.height > 8) floorY = Math.min(floorY, box.top);
  }

  const icons = [...document.querySelectorAll(".page-about .contact-icons a")];
  let innerLeft = postBox.left;
  let innerRight = postBox.right;
  if (icons.length) {
    const boxes = icons.map((el) => el.getBoundingClientRect());
    innerLeft = Math.min(...boxes.map((box) => box.left));
    innerRight = Math.max(...boxes.map((box) => box.right));
  }

  const found = {};
  const leftW = postBox.left - 6;
  const rightW = window.innerWidth - postBox.right - 6;
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
      w: Math.max(40, window.innerWidth - innerRight - 14),
      h: lowerH,
      side: "right",
    };
  }
  return { found, floorY };
}

function avoidRects(floorY) {
  const boxes = [
    ...document.querySelectorAll(".page-about .post-header, .page-about .profile, .page-about .clearfix, .page-about .identity-moment, .navbar"),
  ];
  document.querySelectorAll(".page-about .contact-icons a").forEach((el) => boxes.push(el));
  const mapped = boxes.map((el) => {
    const box = el.getBoundingClientRect();
    return { x: box.left, y: box.top, w: box.width, h: box.height };
  });
  mapped.push({ x: 0, y: floorY, w: window.innerWidth, h: 4000 });
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

function placeVinyls(layer, placed, found, floorY) {
  const left = found.leftLower || found.leftUpper;
  if (left) {
    const w = Math.min(260, Math.max(170, Math.min(left.w, 220) * 1.15));
    const hide = 0.64;
    const cx = w * (0.5 - hide);
    const cy = sitAbove(cx, w, -18, floorY, floorY - 6 - w / 2);
    tryStamp(layer, placed, [], "record", cx, cy, w, w, -18, true);
  }

  const right = found.rightUpper || found.rightLower;
  if (right) {
    const w = Math.min(220, Math.max(150, right.w * 1.35));
    const hide = 0.52;
    const cx = window.innerWidth + w * (hide - 0.5);
    const mid = TOP + (floorY - TOP) * 0.44;
    const cy = sitAbove(cx, w, 14, floorY, Math.min(mid, floorY - 6 - w / 2));
    tryStamp(layer, placed, [], "record", cx, cy, w, w, 14, true);
  }
}

function placeCharms(layer, region, charms, placed, blocked) {
  const cols = Math.max(2, Math.round(region.w / 54));
  const rows = Math.max(2, Math.round(region.h / 52));
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const jitterX = (unit(row * 13 + col + (region.side === "left" ? 1 : 8) + region.y) - 0.5) * 0.55;
      const jitterY = (unit(row * 9 + col + 4 + region.x) - 0.5) * 0.45;
      const u = Math.min(0.96, Math.max(0.04, (col + 0.5 + jitterX) / cols));
      const v = Math.min(0.97, Math.max(0.03, (row + 0.5 + jitterY) / rows));
      cells.push({
        cx: region.x + 8 + u * Math.max(12, region.w - 16),
        cy: region.y + 10 + v * Math.max(24, region.h - 20),
      });
    }
  }

  const bag = shuffle(charms, region.side === "left" ? 2 + region.y : 19 + region.y);
  const slots = shuffle(cells, region.side === "left" ? 5 + region.x : 23 + region.x);
  let slot = 0;
  bag.forEach((charm) => {
    const w = charm.size;
    const h = w / (ASPECT[charm.kind] || 1);
    const rot = Math.round((unit(charm.size + (region.side === "left" ? 3 : 11) + slot) - 0.5) * 42);
    while (slot < slots.length) {
      const cell = slots[slot];
      slot += 1;
      if (tryStamp(layer, placed, blocked, charm.kind, cell.cx, cell.cy, w, h, rot, false)) return;
    }
  });
}

function place(layer) {
  layer.replaceChildren();
  if (window.innerWidth < 992) return;
  const { found, floorY } = gutters();
  const blocked = avoidRects(floorY);
  const placed = [];
  placeVinyls(layer, placed, found, floorY);
  if (found.leftUpper) placeCharms(layer, found.leftUpper, CHARMS_LEFT.slice(0, 11), placed, blocked);
  if (found.leftLower) placeCharms(layer, found.leftLower, CHARMS_LEFT.slice(11), placed, blocked);
  if (found.rightUpper) placeCharms(layer, found.rightUpper, CHARMS_RIGHT.slice(0, 10), placed, blocked);
  if (found.rightLower) placeCharms(layer, found.rightLower, CHARMS_RIGHT.slice(10), placed, blocked);
}
