function bootDecor() {
  const layer = document.getElementById("decor-layer");
  if (!layer) return;
  const pack = () => place(layer);
  pack();
  const quote = document.querySelector(".quote-of-the-day");
  if (quote) {
    const relayout = () => window.setTimeout(pack, 40);
    if (quote.classList.contains("is-ready")) relayout();
    quote.addEventListener("quote:ready", relayout);
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(pack, 180);
  });
}

const ASPECT = {
  teapot: 120 / 82,
  cup: 70 / 56,
  coffee: 70 / 52,
  bike: 76 / 58,
  pin: 120 / 28,
  clapper: 24 / 24,
  masks: 46 / 48,
  razor: 56 / 88,
  record: 1,
  watch: 1,
};

const CHARMS_LEFT = [
  { kind: "teapot", size: 62 },
  { kind: "cup", size: 37 },
  { kind: "bike", size: 67 },
  { kind: "watch", size: 58 },
  { kind: "clapper", size: 41 },
  { kind: "masks", size: 50 },
  { kind: "coffee", size: 39 },
  { kind: "pin", size: 55 },
  { kind: "razor", size: 40 },
  { kind: "watch", size: 46 },
  { kind: "clapper", size: 52 },
  { kind: "masks", size: 44 },
  { kind: "cup", size: 35 },
  { kind: "coffee", size: 44 },
  { kind: "razor", size: 32 },
  { kind: "pin", size: 46 },
  { kind: "masks", size: 39 },
  { kind: "teapot", size: 48 },
];

const CHARMS_RIGHT = [
  { kind: "bike", size: 64 },
  { kind: "watch", size: 54 },
  { kind: "coffee", size: 41 },
  { kind: "masks", size: 51 },
  { kind: "teapot", size: 57 },
  { kind: "pin", size: 60 },
  { kind: "teapot", size: 53 },
  { kind: "razor", size: 36 },
  { kind: "watch", size: 44 },
  { kind: "cup", size: 39 },
  { kind: "cup", size: 43 },
  { kind: "clapper", size: 46 },
  { kind: "coffee", size: 37 },
  { kind: "pin", size: 44 },
  { kind: "masks", size: 36 },
  { kind: "clapper", size: 37 },
  { kind: "razor", size: 44 },
  { kind: "bike", size: 55 },
];

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
  const lowerStart = Math.min(splitY + 8, floorY - 360);
  const upperH = Math.max(36, splitY - TOP);
  const lowerH = Math.max(36, floorY - lowerStart - 10);
  if (leftW >= 40) {
    found.leftUpper = { x: 0, y: TOP, w: leftW, h: upperH, side: "left", band: "upper" };
    found.leftLower = {
      x: 0,
      y: lowerStart,
      w: Math.max(leftW, innerLeft - 14),
      h: lowerH,
      side: "left",
      band: "lower",
    };
  }
  if (rightW >= 40) {
    found.rightUpper = { x: postBox.right + 4, y: TOP, w: rightW, h: upperH, side: "right", band: "upper" };
    found.rightLower = {
      x: innerRight + 14,
      y: lowerStart,
      w: Math.max(40, pageW - innerRight - 14),
      h: lowerH,
      side: "right",
      band: "lower",
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
    if (rotate > 0) {
      disc.style.animationDirection = "reverse";
      disc.style.setProperty("--record-from", "-90deg");
      disc.style.setProperty("--record-to", "270deg");
    }
  }
  if (kind === "watch") {
    const spin = 26 + Math.abs(Math.round(rotate));
    node.style.setProperty("--watch-spin", `${spin}s`);
    node.style.setProperty("--watch-spin-crown", `${(spin * 10) / 14}s`);
    node.style.setProperty("--watch-tick", `${0.42 + Math.abs(rotate) / 180}s`);
  }
  if (kind === "masks") {
    node.style.setProperty("--mood-delay", `${-((Math.round(box.cx) + Math.round(box.cy)) % 16)}s`);
  }
  layer.appendChild(node);
}

function tryStamp(layer, placed, blocked, discs, kind, cx, cy, w, h, rotate, skipBlock) {
  const hit = rotBox(cx, cy, w, h, rotate);
  if (!skipBlock && blocked.some((other) => overlaps(hit, other, 10))) return false;
  if (placed.some((other) => overlaps(hit, other, GAP))) return false;
  if (hitsDisc(hit, discs, 10)) return false;
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
  return Math.round((unit(charm.size + (region.side === "left" ? 3 : 11) + idx) - 0.5) * 46);
}

function hitsDisc(hit, discs, pad) {
  return discs.some((disc) => {
    const nx = Math.max(hit.x, Math.min(disc.cx, hit.x + hit.w));
    const ny = Math.max(hit.y, Math.min(disc.cy, hit.y + hit.h));
    const dx = nx - disc.cx;
    const dy = ny - disc.cy;
    const lim = disc.r + pad;
    return dx * dx + dy * dy < lim * lim;
  });
}

function placeVinyls(layer, found, floorY, pageW) {
  const discs = [];
  const left = found.leftLower || found.leftUpper;
  if (left) {
    const w = Math.min(260, Math.max(170, Math.min(left.w, 220) * 1.15));
    const pull = w * 0.07;
    const cx = pull;
    const cy = floorY - pull;
    stamp(layer, "record", { cx, cy, w, h: w }, -18);
    discs.push({ cx, cy, r: w / 2 });
  }

  const right = found.rightUpper || found.rightLower;
  if (right) {
    const w = Math.min(220, Math.max(150, right.w * 1.35));
    const hide = 0.52;
    const cx = pageW + w * (hide - 0.5);
    const mid = TOP + (floorY - TOP) * 0.44;
    const cy = sitAbove(cx, w, 14, floorY, Math.min(mid, floorY - 6 - w / 2));
    stamp(layer, "record", { cx, cy, w, h: w }, 14);
    discs.push({ cx, cy, r: w / 2 });
  }
  return discs;
}

function shareByArea(regions, charms) {
  const live = regions.filter(Boolean);
  if (!live.length) return [];
  const upper = live.find((region) => region.band === "upper");
  const lower = live.find((region) => region.band === "lower");
  if (upper && lower) {
    const nLower = Math.min(charms.length - 3, Math.max(7, Math.round(charms.length * 0.45)));
    return [
      { region: upper, charms: charms.slice(0, charms.length - nLower) },
      { region: lower, charms: charms.slice(charms.length - nLower) },
    ];
  }
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

function pickSlots(cells, n) {
  if (n >= cells.length) return cells.slice();
  if (n <= 1) return cells.slice(0, n);
  const slots = [];
  for (let i = 0; i < n; i += 1) {
    slots.push(cells[Math.round((i * (cells.length - 1)) / (n - 1))]);
  }
  return slots;
}

function cornerCells(region) {
  const padX = 34;
  const padY = 42;
  const outerX = region.side === "left" ? region.x + padX : region.x + region.w - padX;
  const innerX = region.side === "left" ? region.x + Math.min(region.w * 0.45, 108) : region.x + region.w - Math.min(region.w * 0.45, 108);
  const y0 = region.y + region.h - padY;
  const y1 = y0 - 78;
  const y2 = y0 - 148;
  return [
    { cx: outerX, cy: y0 },
    { cx: innerX, cy: y1 },
    { cx: outerX, cy: y2 },
  ];
}

function vinylCells(region, discs, floorY) {
  const cells = [];
  const floor = floorY - 24;
  discs.forEach((disc) => {
    const inX = disc.cx + disc.r > region.x - 48 && disc.cx - disc.r < region.x + region.w + 48;
    const inY = disc.cy + disc.r > region.y - 48 && disc.cy - disc.r < region.y + region.h + 48;
    if (!inX || !inY) return;
    const angles = region.side === "left" ? [-1.05, -0.7, -0.35, 0.05, 0.38, 0.7] : [2.5, 2.85, 3.14, 3.45, 3.8, 4.1];
    angles.forEach((angle, i) => {
      const dist = disc.r + 30 + (i % 2) * 16;
      const cx = disc.cx + Math.cos(angle) * dist;
      const cy = disc.cy + Math.sin(angle) * dist;
      if (cx < region.x - 8 || cx > region.x + region.w + 16) return;
      if (cy < region.y - 8 || cy > Math.min(region.y + region.h + 8, floor)) return;
      cells.push({ cx, cy });
    });
  });
  return cells;
}

function placeCharms(layer, region, charms, placed, blocked, discs, floorY) {
  if (!charms.length) return;
  const lower = region.band === "lower";
  const aspect = region.w / Math.max(24, region.h);
  const minCols = region.w >= 64 ? 2 : 1;
  const cols = Math.max(minCols, Math.round(Math.sqrt(charms.length * aspect * 1.45)));
  const rows = Math.max(1, Math.ceil(charms.length / cols));
  const jitterScale = region.side === "right" ? 0.72 : 0.4;
  const cells = [...vinylCells(region, discs, floorY), ...(lower ? cornerCells(region) : [])];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const jitterX = (unit(row * 13 + col + (region.side === "left" ? 1 : 8) + region.y) - 0.5) * jitterScale;
      const jitterY = (unit(row * 9 + col + 4 + region.x) - 0.5) * (region.side === "right" ? 0.5 : 0.36);
      const stagger = region.side === "right" && row % 2 ? 0.34 : 0;
      const t = (row + 0.5 + jitterY) / rows;
      const u = Math.min(0.97, Math.max(0.04, (col + 0.5 + jitterX + stagger) / cols));
      const v = Math.min(0.97, Math.max(0.04, lower ? 1 - (1 - t) ** 1.35 : t));
      cells.push({
        cx: region.x + 8 + u * Math.max(12, region.w - 16),
        cy: region.y + 8 + v * Math.max(24, region.h - 16),
      });
    }
  }

  const bag = shuffle(charms, region.side === "left" ? 2 + region.y : 19 + region.y);
  const slots = pickSlots(cells, bag.length);
  const nudges =
    region.side === "right"
      ? [
          [0, 0],
          [18, -10],
          [-22, 12],
          [10, 24],
          [-16, -14],
          [26, 6],
          [-8, 22],
          [14, 32],
        ]
      : [
          [0, 0],
          [12, -8],
          [-14, 10],
          [8, 22],
          [-16, -6],
          [0, 28],
          [18, 4],
          [-10, 18],
        ];
  bag.forEach((charm, idx) => {
    const w = charm.size;
    const h = w / (ASPECT[charm.kind] || 1);
    const rot = charmTilt(charm, idx, region);
    const wanderX = region.side === "right" ? (unit(idx * 11 + region.y) - 0.5) * Math.min(38, region.w * 0.4) : 0;
    const ordered = [slots[idx], ...cells].filter(Boolean);
    for (let s = 0; s < ordered.length; s += 1) {
      const cell = ordered[s];
      for (let n = 0; n < nudges.length; n += 1) {
        const [dx, dy] = nudges[n];
        if (tryStamp(layer, placed, blocked, discs, charm.kind, cell.cx + dx + wanderX, cell.cy + dy, w, h, rot, false)) return;
      }
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
  const discs = placeVinyls(layer, found, floorY, pageW);
  shareByArea([found.leftUpper, found.leftLower], CHARMS_LEFT).forEach((bag) => {
    placeCharms(layer, bag.region, bag.charms, placed, blocked, discs, floorY);
  });
  shareByArea([found.rightUpper, found.rightLower], CHARMS_RIGHT).forEach((bag) => {
    placeCharms(layer, bag.region, bag.charms, placed, blocked, discs, floorY);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootDecor);
} else {
  bootDecor();
}
