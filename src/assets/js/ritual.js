function bootRitual() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll(".ritual").forEach((ritual) => {
    setupRitual(ritual, reduce.matches);
  });
}

const RUN_PX_PER_MS = 0.34;
const PARK_GAP = 8;
const HOLD_MS = 1800;
const ANIM_FALLBACK_MS = {
  "ritual-wave": 1200,
  "ritual-jump": 1600,
  "ritual-wait": 3100,
};
const PLAY_CLASSES = ["is-idle", "is-waving", "is-glance", "is-running", "is-jumping", "is-waiting", "is-waiting-once", "is-react"];

const HOVER_ACTS = ["wave", "jump", "wait", "glance", "look", "peek", "cross", "rest", "parade", "facepalm", "sleep", "explain"];
const DASH_MIN_PX = 24;

const REACT_FRAMES = {
  look: 0,
  peek: 1,
  cross: 2,
  rest: 3,
  parade: 4,
  facepalm: 5,
  sleep: 6,
  explain: 7,
};

function setupRitual(ritual, reduceMotion) {
  const pose = ritual.getAttribute("data-ritual") || "companion";

  if (reduceMotion) {
    ritual.classList.add("is-still");
    const moment = ritual.closest(".identity-moment");
    if (moment) {
      parkReveal(ritual, moment, document.querySelector(".quote-of-the-day"));
      moment.classList.add("is-settled");
    }
    return;
  }

  if (pose === "wait") {
    ritual.classList.add("is-waiting");
    attachLiveMotion(ritual);
    return;
  }

  if (pose === "reveal") {
    setupReveal(ritual);
    return;
  }

  setupCompanion(ritual);
}

function clearPlay(ritual) {
  ritual.classList.remove(...PLAY_CLASSES);
  ritual.style.removeProperty("--ritual-react-pos");
}

function restartIdle(ritual) {
  ritual.style.animation = "none";
  void ritual.offsetWidth;
  ritual.style.removeProperty("animation");
}

function restPose(ritual) {
  clearPlay(ritual);
  restartIdle(ritual);
  if (ritual.getAttribute("data-ritual") === "wait") {
    ritual.classList.add("is-waiting");
    return;
  }
  ritual.classList.add("is-idle");
}

function playAct(ritual, act, done) {
  let cancelled = false;
  const timers = [];
  let onEnd = null;

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    if (onEnd) ritual.removeEventListener("animationend", onEnd);
    done();
  };

  const afterAnimation = (name, fallbackMs) => {
    onEnd = (event) => {
      if (event.animationName && event.animationName !== name) return;
      ritual.removeEventListener("animationend", onEnd);
      onEnd = null;
      finish();
    };
    ritual.addEventListener("animationend", onEnd);
    timers.push(
      window.setTimeout(
        () => {
          if (onEnd) ritual.removeEventListener("animationend", onEnd);
          onEnd = null;
          finish();
        },
        fallbackMs || ANIM_FALLBACK_MS[name] || 3100
      )
    );
  };

  clearPlay(ritual);
  restartIdle(ritual);

  if (act === "wave") {
    ritual.classList.add("is-waving");
    afterAnimation("ritual-wave");
  } else if (act === "jump") {
    ritual.classList.add("is-jumping");
    afterAnimation("ritual-jump");
  } else if (act === "wait") {
    ritual.classList.add("is-waiting-once");
    afterAnimation("ritual-wait");
  } else if (act === "dash") {
    const duration = beginDash(ritual);
    if (duration == null) {
      finish();
    } else {
      ritual.classList.add("is-running");
      afterAnimation("ritual-run-across", duration + 120);
    }
  } else if (act === "glance") {
    ritual.classList.add("is-glance");
    timers.push(window.setTimeout(finish, HOLD_MS));
  } else {
    const frame = REACT_FRAMES[act];
    if (frame == null) {
      finish();
    } else {
      ritual.style.setProperty("--ritual-react-pos", `${(frame / 7) * 100}% 0`);
      ritual.classList.add("is-react");
      timers.push(window.setTimeout(finish, HOLD_MS));
    }
  }

  return () => {
    if (cancelled) return;
    cancelled = true;
    timers.forEach((id) => window.clearTimeout(id));
    if (onEnd) ritual.removeEventListener("animationend", onEnd);
  };
}

function pickExcept(pool, heldOut) {
  const choices = pool.length > 1 ? pool.filter((act) => act !== heldOut) : pool.slice();
  return choices[Math.floor(Math.random() * choices.length)];
}

function dashPlan(ritual) {
  const track = ritual.closest(".ritual-signoff");
  if (!track) return null;
  const box = track.getBoundingClientRect();
  const width = ritual.offsetWidth || 48;
  const maxX = Math.max(0, box.width - width);
  const from = Math.min(maxX, Math.max(0, ritual.getBoundingClientRect().left - box.left));
  const goingRight = from <= maxX / 2;
  const to = goingRight ? maxX : 0;
  const travel = Math.abs(to - from);
  if (travel < DASH_MIN_PX) return null;
  return {
    from,
    to,
    goingRight,
    duration: Math.max(1100, Math.round(travel / RUN_PX_PER_MS)),
  };
}

function pointerOnRitual(ritual, x, y) {
  const stack = document.elementsFromPoint(x, y);
  return stack.includes(ritual);
}

function hoverPool(ritual, canDash) {
  const pool = HOVER_ACTS.slice();
  if (canDash && dashPlan(ritual)) pool.push("dash");
  return pool;
}

function attachLiveMotion(ritual, options = {}) {
  let lastAct = null;
  let hovering = false;
  let cancelAct = null;
  let idleTimer = 0;

  const stopAct = () => {
    if (cancelAct) {
      cancelAct();
      cancelAct = null;
    }
  };

  const nextHoverAct = () => {
    const act = pickExcept(hoverPool(ritual, options.canDash), lastAct);
    lastAct = act;
    return act;
  };

  const scheduleIdleWave = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(
      () => {
        if (hovering || ritual.classList.contains("is-running") || ritual.classList.contains("is-still")) {
          scheduleIdleWave();
          return;
        }
        stopAct();
        cancelAct = playAct(ritual, "wave", () => {
          if (!hovering) restPose(ritual);
          cancelAct = null;
          scheduleIdleWave();
        });
      },
      7000 + Math.random() * 9000
    );
  };

  const onEnter = () => {
    if (hovering) return;
    hovering = true;
    if (ritual.classList.contains("is-running") || ritual.classList.contains("is-still")) {
      return;
    }
    stopAct();
    window.clearTimeout(idleTimer);
    cancelAct = playAct(ritual, nextHoverAct(), () => {
      cancelAct = null;
      restPose(ritual);
      if (!hovering) scheduleIdleWave();
    });
  };

  const onLeave = () => {
    if (!hovering) return;
    hovering = false;
    if (ritual.classList.contains("is-running")) {
      scheduleIdleWave();
      return;
    }
    stopAct();
    restPose(ritual);
    scheduleIdleWave();
  };

  const onPointerMove = (event) => {
    if (pointerOnRitual(ritual, event.clientX, event.clientY)) onEnter();
    else onLeave();
  };

  ritual.addEventListener("pointerenter", onEnter);
  ritual.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
  document.addEventListener(
    "pointerover",
    (event) => {
      if (event.target === ritual || ritual.contains(event.target)) onEnter();
    },
    true
  );
  document.addEventListener(
    "pointerout",
    (event) => {
      if (event.target === ritual || ritual.contains(event.target)) {
        if (!ritual.contains(event.relatedTarget)) onLeave();
      }
    },
    true
  );
  scheduleIdleWave();
}

function beginDash(ritual) {
  const plan = dashPlan(ritual);
  if (!plan) return null;
  ritual.style.setProperty("--ritual-from", `${plan.from}px`);
  ritual.style.setProperty("--ritual-to", `${plan.to}px`);
  ritual.style.setProperty("--ritual-x", `${plan.to}px`);
  ritual.style.setProperty("--ritual-run-ms", `${plan.duration}ms`);
  ritual.style.setProperty("--ritual-face", plan.goingRight ? "-1" : "1");
  ritual.dataset.side = plan.goingRight ? "right" : "left";
  return plan.duration;
}

function glyphRects(el) {
  const rects = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!/\S/.test(node.nodeValue || "")) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (rect.width > 1 && rect.height > 1) rects.push(rect);
    }
  }
  return rects;
}

function quoteEndX(quote) {
  const targets = [".quote-text", ".quote-cite"].map((selector) => quote.querySelector(selector)).filter(Boolean);
  const rects = (targets.length ? targets : [quote]).flatMap(glyphRects);
  if (!rects.length) return quote.getBoundingClientRect().right;
  return Math.max(...rects.map((rect) => rect.right));
}

function fitRevealHeight(ritual, moment, quote) {
  if (!quote || !quote.classList.contains("is-ready")) return;
  const height = Math.ceil(quote.getBoundingClientRect().height);
  if (height < 8) return;
  ritual.style.setProperty("--ritual-h", `${height}px`);
  ritual.style.width = `${Math.round((height * 192) / 208)}px`;
  moment.style.minHeight = `${height}px`;
}

function quoteLineBoxes(el) {
  const boxes = [];
  for (const rect of glyphRects(el)) {
    const line = boxes.find((item) => Math.abs(item.top - rect.top) < rect.height * 0.45);
    if (line) {
      line.left = Math.min(line.left, rect.left);
      line.right = Math.max(line.right, rect.right);
      line.top = Math.min(line.top, rect.top);
      line.bottom = Math.max(line.bottom, rect.bottom);
    } else {
      boxes.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
    }
  }
  boxes.sort((a, b) => a.top - b.top);
  boxes.forEach((line) => {
    line.width = line.right - line.left;
  });
  return boxes;
}

function setQuoteText(textEl, original, breakAt) {
  if (breakAt == null || breakAt <= 0 || breakAt >= original.length) {
    textEl.replaceChildren(document.createTextNode(original));
    return;
  }
  textEl.replaceChildren(
    document.createTextNode(original.slice(0, breakAt).replace(/\s+$/, "")),
    document.createElement("br"),
    document.createTextNode(original.slice(breakAt).replace(/^\s+/, ""))
  );
}

function wordBreaks(text) {
  const breaks = [];
  const parts = text.split(/(\s+)/);
  let cursor = 0;
  parts.forEach((part) => {
    cursor += part.length;
    if (/\S/.test(part)) breaks.push(cursor);
  });
  return breaks;
}

function contentWidth(el) {
  const box = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return Math.max(0, box.width - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0));
}

function pullLeftoverOntoNewLine(textEl, original, targetWidth, maxWidth) {
  const breaks = wordBreaks(original);
  if (breaks.length < 2) return false;

  let bestAt = null;
  let bestWidth = -1;
  for (let i = breaks.length - 2; i >= 0; i -= 1) {
    setQuoteText(textEl, original, breaks[i]);
    const lines = quoteLineBoxes(textEl);
    if (!lines.length) continue;
    const lastWidth = lines[lines.length - 1].width;
    if (lastWidth > maxWidth + 1) break;
    if (lastWidth >= targetWidth) {
      return true;
    }
    if (lastWidth > bestWidth) {
      bestWidth = lastWidth;
      bestAt = breaks[i];
    }
  }

  if (bestAt == null) {
    setQuoteText(textEl, original);
    return false;
  }
  setQuoteText(textEl, original, bestAt);
  return true;
}

function wrapQuoteForRitual(ritual, moment, quote) {
  if (!quote || !quote.classList.contains("is-ready")) return;
  const textEl = quote.querySelector(".quote-text");
  if (!textEl) return;

  const original = textEl.dataset.quoteOriginal ?? textEl.textContent;
  textEl.dataset.quoteOriginal = original;
  setQuoteText(textEl, original);
  quote.style.paddingRight = "";
  fitRevealHeight(ritual, moment, quote);

  const ritualW = ritual.offsetWidth || 48;
  const quoteBox = quote.getBoundingClientRect();
  const lines = quoteLineBoxes(textEl);
  const reserve = ritualW + PARK_GAP;
  quote.style.paddingRight = `${reserve}px`;
  fitRevealHeight(ritual, moment, quote);
  if (!lines.length) return;

  const last = lines[lines.length - 1];
  const fullLines = lines.filter((line) => quoteBox.right - line.right < reserve).length;
  // Leftover used to be "how far past the column edge," which is ~0 on two
  // full lines. Measure from Ritual's parked left edge instead, then wrap that
  // leftover once per full line (two full lines → double it onto the next).
  const leftover = Math.max(0, last.right - (quoteBox.right - reserve));
  const wrapPx = leftover * Math.max(1, fullLines);
  if (wrapPx > leftover + 1) {
    const width = contentWidth(quote);
    const after = quoteLineBoxes(textEl);
    const lastAfter = after[after.length - 1];
    if (lastAfter && lastAfter.width < wrapPx - 1) {
      pullLeftoverOntoNewLine(textEl, original, Math.min(width, wrapPx), width);
    }
  }

  for (let i = 0; i < 3; i += 1) {
    fitRevealHeight(ritual, moment, quote);
    const next = `${(ritual.offsetWidth || ritualW) + PARK_GAP}px`;
    if (quote.style.paddingRight === next) break;
    quote.style.paddingRight = next;
  }
  fitRevealHeight(ritual, moment, quote);
}

function clipQuoteToRitual(ritual, quote) {
  if (!quote) return;
  const quoteBox = quote.getBoundingClientRect();
  const ritualBox = ritual.getBoundingClientRect();
  const width = quoteBox.width || 1;
  const lead = Math.max(0, ritualBox.right - quoteBox.left);
  const remain = Math.max(0, Math.min(100, 100 - (lead / width) * 100));
  quote.style.clipPath = `inset(0 ${remain}% 0 0)`;
}

function parkReveal(ritual, moment, quote) {
  wrapQuoteForRitual(ritual, moment, quote);
  fitRevealHeight(ritual, moment, quote);
  const momentBox = moment.getBoundingClientRect();
  const ritualW = ritual.offsetWidth || 48;
  let toPx = 0;
  if (quote && quote.classList.contains("is-ready")) {
    toPx = quoteEndX(quote) - momentBox.left + PARK_GAP;
  }
  toPx = Math.min(Math.max(0, toPx), Math.max(0, momentBox.width - ritualW));
  ritual.style.setProperty("--ritual-from", "0px");
  ritual.style.setProperty("--ritual-to", `${toPx}px`);
  ritual.style.setProperty("--ritual-face", "-1");
  moment.style.setProperty("--ritual-from", "0px");
  moment.style.setProperty("--ritual-to", `${toPx}px`);
  return toPx;
}

function setupReveal(ritual) {
  const moment = ritual.closest(".identity-moment");
  const quote = document.querySelector(".quote-of-the-day");

  if (!moment) {
    restPose(ritual);
    attachLiveMotion(ritual);
    return;
  }

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    ritual.classList.remove("is-running");
    moment.classList.remove("is-revealing");
    moment.classList.add("is-settled");
    if (quote) quote.style.removeProperty("clip-path");
    playAct(ritual, "wave", () => {
      restPose(ritual);
      attachLiveMotion(ritual);
    });
  };

  const run = () => {
    if (ritual.classList.contains("is-running") || moment.classList.contains("is-settled")) {
      return;
    }
    const toPx = parkReveal(ritual, moment, quote);
    const duration = Math.max(700, Math.round(toPx / RUN_PX_PER_MS));
    ritual.style.setProperty("--ritual-run-ms", `${duration}ms`);
    moment.style.setProperty("--ritual-run-ms", `${duration}ms`);
    moment.classList.add("is-revealing");
    ritual.classList.add("is-running");
    clipQuoteToRitual(ritual, quote);
    const tick = () => {
      if (!ritual.classList.contains("is-running")) return;
      clipQuoteToRitual(ritual, quote);
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
    ritual.addEventListener("animationend", (event) => {
      if (event.animationName !== "ritual-run-across") return;
      settle();
    });
    window.setTimeout(() => {
      if (ritual.classList.contains("is-running")) settle();
    }, duration + 80);
  };

  const startRun = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(run));
  };

  if (!quote) {
    parkReveal(ritual, moment, null);
    settle();
    return;
  }

  if (quote.classList.contains("is-ready")) {
    startRun();
    return;
  }

  quote.addEventListener("quote:ready", startRun, { once: true });
  window.setTimeout(() => {
    if (!ritual.classList.contains("is-running") && !moment.classList.contains("is-settled")) {
      parkReveal(ritual, moment, quote);
      settle();
    }
  }, 2000);
}

function setupCompanion(ritual) {
  const greet = () => {
    playAct(ritual, "wave", () => {
      restPose(ritual);
      attachLiveMotion(ritual, { canDash: true });
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          greet();
          obs.disconnect();
        }
      },
      { threshold: 0.55 }
    );
    observer.observe(ritual);
  } else {
    greet();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootRitual);
} else {
  bootRitual();
}
