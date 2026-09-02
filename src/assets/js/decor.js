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
  teapot: 108 / 78,
  cup: 72 / 58,
  coffee: 72 / 56,
  bike: 96 / 58,
  reel: 1,
  pin: 120 / 32,
  whittle: 92 / 70,
  masks: 88 / 52,
  wrench: 100 / 40,
  driver: 28 / 96,
  bolt: 1,
  record: 1,
};

const LAYOUT = [
  { side: "left", x: 0.08, y: 0.09, kind: "record", s: 0.98, r: -16 },
  { side: "left", x: 0.72, y: 0.22, kind: "teapot", s: 0.36, r: -18 },
  { side: "left", x: 0.24, y: 0.32, kind: "cup", s: 0.24, r: 16 },
  { side: "left", x: 0.62, y: 0.42, kind: "bike", s: 0.54, r: -10 },
  { side: "left", x: 0.22, y: 0.52, kind: "reel", s: 0.3, r: 22 },
  { side: "left", x: 0.7, y: 0.58, kind: "coffee", s: 0.26, r: 8 },
  { side: "left", x: 0.3, y: 0.68, kind: "whittle", s: 0.36, r: -24 },
  { side: "left", x: 0.76, y: 0.76, kind: "wrench", s: 0.4, r: 28 },
  { side: "left", x: 0.26, y: 0.84, kind: "bolt", s: 0.2, r: 12 },
  { side: "left", x: 0.64, y: 0.9, kind: "masks", s: 0.32, r: -8 },
  { side: "left", x: 0.28, y: 0.97, kind: "pin", s: 0.5, r: -30 },
  { side: "right", x: 0.78, y: 0.07, kind: "reel", s: 0.28, r: -14 },
  { side: "right", x: 0.92, y: 0.2, kind: "record", s: 0.78, r: 14 },
  { side: "right", x: 0.24, y: 0.3, kind: "coffee", s: 0.24, r: -16 },
  { side: "right", x: 0.7, y: 0.4, kind: "bike", s: 0.5, r: 12 },
  { side: "right", x: 0.22, y: 0.5, kind: "teapot", s: 0.34, r: 20 },
  { side: "right", x: 0.78, y: 0.56, kind: "driver", s: 0.15, r: -26 },
  { side: "right", x: 0.28, y: 0.66, kind: "whittle", s: 0.34, r: 18 },
  { side: "right", x: 0.74, y: 0.72, kind: "wrench", s: 0.38, r: -20 },
  { side: "right", x: 0.26, y: 0.82, kind: "masks", s: 0.3, r: 10 },
  { side: "right", x: 0.18, y: 0.92, kind: "record", s: 0.52, r: -10 },
  { side: "right", x: 0.68, y: 0.88, kind: "cup", s: 0.22, r: -12 },
  { side: "right", x: 0.86, y: 0.98, kind: "pin", s: 0.44, r: 24 },
];

const TOP = 72;

function gutters() {
  const post = document.querySelector(".page-about .post") || document.querySelector(".post");
  const box = post ? post.getBoundingClientRect() : { left: 200, right: window.innerWidth - 200 };
  const height = Math.max(280, window.innerHeight - TOP - 20);
  const leftWidth = box.left - 16;
  const rightWidth = window.innerWidth - box.right - 16;
  const regions = {};
  if (leftWidth >= 56) {
    regions.left = { x: 12, y: TOP, w: leftWidth, h: height };
  }
  if (rightWidth >= 56) {
    regions.right = { x: box.right + 8, y: TOP, w: rightWidth, h: height };
  }
  return regions;
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
  const regions = gutters();
  LAYOUT.forEach((item) => {
    const region = regions[item.side];
    if (!region) return;
    const aspect = ASPECT[item.kind] || 1;
    const w = Math.max(22, Math.min(region.w * 0.92, region.w * item.s));
    const h = w / aspect;
    if (h > region.h * 0.42) return;
    const cx = region.x + region.w * item.x;
    const cy = region.y + region.h * item.y;
    const minX = item.kind === "record" ? region.x + w * 0.22 : region.x + w / 2;
    const maxX = item.kind === "record" ? region.x + region.w - w * 0.22 : region.x + region.w - w / 2;
    const box = {
      cx: Math.min(maxX, Math.max(minX, cx)),
      cy: Math.min(region.y + region.h - h / 2, Math.max(region.y + h / 2, cy)),
      w,
      h,
    };
    stamp(layer, item, box);
  });
}
