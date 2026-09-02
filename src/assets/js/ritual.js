document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".ritual").forEach((ritual) => {
    setupRitual(ritual, reduce.matches);
  });
});

const RUN_PX_PER_MS = 0.34;
const HOLD_MS = 1800;
const ANIM_FALLBACK_MS = {
  "ritual-wave": 1200,
  "ritual-jump": 1600,
  "ritual-wait": 3100,
};
const PLAY_CLASSES = ["is-idle", "is-waving", "is-glance", "is-running", "is-jumping", "is-waiting", "is-waiting-once", "is-react"];

const HOVER_ACTS = ["wave", "jump", "wait", "glance", "look", "peek", "cross", "rest", "parade", "facepalm", "sleep", "explain"];
const HOVER_ACTS_DASH = HOVER_ACTS.concat("dash");

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
  ritual.style.removeProperty("--ritual-frame");
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
      ritual.style.setProperty("--ritual-frame", String(frame));
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

function shuffle(list) {
  const items = list.slice();
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = items[i];
    items[i] = items[j];
    items[j] = swap;
  }
  return items;
}

function pointerOnRitual(ritual, x, y) {
  const stack = document.elementsFromPoint(x, y);
  return stack.includes(ritual);
}

function attachLiveMotion(ritual, options = {}) {
  let queue = shuffle(options.canDash ? HOVER_ACTS_DASH : HOVER_ACTS);
  let index = 0;
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
    const act = queue[index];
    index += 1;
    if (index >= queue.length) {
      queue = shuffle(options.canDash ? HOVER_ACTS_DASH : HOVER_ACTS);
      if (queue[0] === act && queue.length > 1) {
        const swapWith = 1 + Math.floor(Math.random() * (queue.length - 1));
        const swap = queue[0];
        queue[0] = queue[swapWith];
        queue[swapWith] = swap;
      }
      index = 0;
    }
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
      if (hovering) restPose(ritual);
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
  const track = ritual.closest(".ritual-signoff");
  if (!track) return null;
  const box = track.getBoundingClientRect();
  const width = ritual.offsetWidth || 48;
  const goingRight = ritual.dataset.side !== "right";
  const from = goingRight ? 0 : Math.max(0, box.width - width);
  const to = goingRight ? Math.max(0, box.width - width) : 0;
  const duration = Math.max(1100, Math.round(Math.abs(to - from) / RUN_PX_PER_MS));
  ritual.style.setProperty("--ritual-from", `${from}px`);
  ritual.style.setProperty("--ritual-to", `${to}px`);
  ritual.style.setProperty("--ritual-x", `${to}px`);
  ritual.style.setProperty("--ritual-run-ms", `${duration}ms`);
  ritual.style.setProperty("--ritual-face", goingRight ? "-1" : "1");
  ritual.dataset.side = goingRight ? "right" : "left";
  return duration;
}

function quoteEndX(quote) {
  const range = document.createRange();
  range.selectNodeContents(quote);
  const rects = [...range.getClientRects()].filter((rect) => rect.width > 1 && rect.height > 1);
  if (!rects.length) return quote.getBoundingClientRect().right;
  return Math.max(...rects.map((rect) => rect.right));
}

function fitRevealHeight(ritual, moment, quote) {
  if (!quote || !quote.classList.contains("is-ready")) return;
  const height = Math.ceil(quote.getBoundingClientRect().height);
  if (height < 8) return;
  ritual.style.setProperty("--ritual-h", `${height}px`);
  moment.style.minHeight = `${height}px`;
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
  fitRevealHeight(ritual, moment, quote);
  const momentBox = moment.getBoundingClientRect();
  const ritualW = ritual.offsetWidth || 48;
  let toPx = 0;
  if (quote && quote.classList.contains("is-ready")) {
    toPx = quoteEndX(quote) - momentBox.left + 8;
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

  if (!quote) {
    parkReveal(ritual, moment, null);
    settle();
    return;
  }

  if (quote.classList.contains("is-ready")) {
    run();
    return;
  }

  quote.addEventListener("quote:ready", run, { once: true });
  window.setTimeout(() => {
    if (!ritual.classList.contains("is-running") && !moment.classList.contains("is-settled")) {
      parkReveal(ritual, moment, quote);
      settle();
    }
  }, 450);
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
