document.addEventListener("DOMContentLoaded", () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll(".ritual").forEach((ritual) => {
    setupRitual(ritual, reduce.matches);
  });
});

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
    return;
  }

  if (pose === "reveal") {
    setupReveal(ritual);
    return;
  }

  setupCompanion(ritual);
}

function waveThenIdle(ritual) {
  ritual.classList.remove("is-idle", "is-glance", "is-running");
  ritual.classList.add("is-waving");
  ritual.addEventListener(
    "animationend",
    (event) => {
      if (event.animationName && event.animationName !== "ritual-wave") return;
      ritual.classList.remove("is-waving");
      ritual.classList.add("is-idle");
    },
    { once: true }
  );
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
    waveThenIdle(ritual);
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
    }, 2800);
  };

  if (moment && quote) {
    moment.addEventListener("mouseenter", () => {
      if (!ritual.classList.contains("is-idle")) return;
      ritual.classList.add("is-glance");
    });
    moment.addEventListener("mouseleave", () => {
      ritual.classList.remove("is-glance");
    });
  }

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
  const playWave = () => {
    if (ritual.classList.contains("is-waving")) return;
    waveThenIdle(ritual);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          playWave();
          obs.disconnect();
        }
      },
      { threshold: 0.55 }
    );
    observer.observe(ritual);
  } else {
    playWave();
  }

  ritual.addEventListener("mouseenter", playWave);
}
