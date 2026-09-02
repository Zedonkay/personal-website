document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".ritual").forEach((ritual) => {
    setupRitual(ritual, reduce.matches);
  });
});

const RUN_MS = 5800;
const HOLD_MS = 1800;
const ANIM_FALLBACK_MS = {
  "ritual-wave": 1200,
  "ritual-jump": 1600,
  "ritual-wait": 3100,
};
const PLAY_CLASSES = ["is-idle", "is-waving", "is-glance", "is-running", "is-jumping", "is-waiting", "is-waiting-once", "is-react"];

const HOVER_ACTS = ["wave", "jump", "wait", "glance", "look", "peek", "cross", "rest", "parade", "facepalm", "sleep", "explain"];

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
    if (moment) moment.classList.add("is-settled");
    return;
  }

  if (pose === "wait") {
    ritual.classList.add("is-waiting");
    attachHover(ritual);
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

function restPose(ritual) {
  clearPlay(ritual);
  if (ritual.getAttribute("data-ritual") === "wait") {
    ritual.classList.add("is-waiting");
    return;
  }
  ritual.classList.add("is-idle");
}

function afterAnimation(ritual, name, done) {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    ritual.removeEventListener("animationend", onEnd);
    done();
  };
  const onEnd = (event) => {
    if (event.animationName && event.animationName !== name) return;
    finish();
  };
  ritual.addEventListener("animationend", onEnd);
  window.setTimeout(finish, ANIM_FALLBACK_MS[name] || 3100);
}

function playAct(ritual, act, done) {
  clearPlay(ritual);

  if (act === "wave") {
    ritual.classList.add("is-waving");
    afterAnimation(ritual, "ritual-wave", done);
    return;
  }

  if (act === "jump") {
    ritual.classList.add("is-jumping");
    afterAnimation(ritual, "ritual-jump", done);
    return;
  }

  if (act === "wait") {
    ritual.classList.add("is-waiting-once");
    afterAnimation(ritual, "ritual-wait", done);
    return;
  }

  if (act === "glance") {
    ritual.classList.add("is-glance");
    window.setTimeout(done, HOLD_MS);
    return;
  }

  const frame = REACT_FRAMES[act];
  if (frame == null) {
    done();
    return;
  }
  ritual.style.setProperty("--ritual-frame", String(frame));
  ritual.classList.add("is-react");
  window.setTimeout(done, HOLD_MS);
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

function attachHover(ritual) {
  let queue = shuffle(HOVER_ACTS);
  let index = 0;
  let busy = false;

  ritual.addEventListener("mouseenter", () => {
    if (busy || ritual.classList.contains("is-running") || ritual.classList.contains("is-still")) {
      return;
    }
    busy = true;
    const act = queue[index];
    index += 1;
    if (index >= queue.length) {
      queue = shuffle(HOVER_ACTS);
      if (queue[0] === act && queue.length > 1) {
        const swapWith = 1 + Math.floor(Math.random() * (queue.length - 1));
        const swap = queue[0];
        queue[0] = queue[swapWith];
        queue[swapWith] = swap;
      }
      index = 0;
    }
    playAct(ritual, act, () => {
      restPose(ritual);
      busy = false;
    });
  });
}

function setupReveal(ritual) {
  const moment = ritual.closest(".identity-moment");
  const quote = document.querySelector(".quote-of-the-day");

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    ritual.classList.remove("is-running");
    if (moment) {
      moment.classList.remove("is-revealing");
      moment.classList.add("is-settled");
    }
    playAct(ritual, "wave", () => {
      restPose(ritual);
      attachHover(ritual);
    });
  };

  const run = () => {
    if (ritual.classList.contains("is-running") || (moment && moment.classList.contains("is-settled"))) {
      return;
    }
    if (moment) moment.classList.add("is-revealing");
    ritual.classList.add("is-running");
    ritual.addEventListener("animationend", (event) => {
      if (event.animationName !== "ritual-run-across") return;
      settle();
    });
    window.setTimeout(() => {
      if (ritual.classList.contains("is-running")) settle();
    }, RUN_MS);
  };

  if (!quote) {
    settle();
    return;
  }

  if (quote.classList.contains("is-ready")) {
    run();
    return;
  }

  quote.addEventListener("quote:ready", run, { once: true });
  window.setTimeout(() => {
    if (!ritual.classList.contains("is-running") && !(moment && moment.classList.contains("is-settled"))) {
      settle();
    }
  }, 450);
}

function setupCompanion(ritual) {
  const greet = () => {
    playAct(ritual, "wave", () => {
      restPose(ritual);
      attachHover(ritual);
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
