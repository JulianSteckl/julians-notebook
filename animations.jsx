// School Notebook — Motion glue layer
// Ripple delegation + confetti host + day-complete celebration.

(function () {
  // ─── 1. Ripple effect — ink-on-paper for any .sn-btn click
  function attachRipple(e) {
    const btn = e.target.closest(".sn-btn");
    if (!btn || btn.dataset.noRipple === "1") return;
    if (btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ink = document.createElement("span");
    ink.className = "sn-ripple";
    ink.style.width = ink.style.height = size + "px";
    ink.style.left = x + "px";
    ink.style.top = y + "px";
    // Ensure container can clip
    const pos = getComputedStyle(btn).position;
    if (pos === "static") btn.style.position = "relative";
    btn.appendChild(ink);
    setTimeout(() => ink.remove(), 600);
  }
  document.addEventListener("pointerdown", attachRipple, true);

  // ─── 2. Confetti burst
  function fireConfetti(count = 60) {
    const host = document.createElement("div");
    host.className = "confetti-host";
    document.body.appendChild(host);
    const colors = ["#a07830", "#c8694a", "#6b8e5a", "#3f7d8a", "#7a4e6e", "#b58a3b", "#fae8a8"];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      const startX = 20 + Math.random() * 60; // % from left
      const dx = (Math.random() - 0.5) * 600;
      const dur = 1.8 + Math.random() * 1.6;
      const spin = 0.6 + Math.random() * 1.2;
      const w = 5 + Math.random() * 7;
      const h = 8 + Math.random() * 10;
      p.style.left = startX + "vw";
      p.style.width = w + "px";
      p.style.height = h + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty("--dx", dx + "px");
      p.style.setProperty("--dur", dur + "s");
      p.style.setProperty("--spin", spin + "s");
      p.style.animationDelay = (Math.random() * 0.15) + "s";
      host.appendChild(p);
    }
    setTimeout(() => host.remove(), 3500);
  }
  window.fireConfetti = fireConfetti;

  // ─── 3. Day-complete detection
  // After homework toggle, check if all "today" homework is done; if so → confetti.
  let lastSnapshot = null;
  function todayHomeworkAllDone() {
    try {
      const HW = window.HOMEWORK || [];
      const userHW = window.nbGetHomework ? window.nbGetHomework() : [];
      const merged = [...HW, ...userHW];
      const todayItems = merged.filter((h) => /tonight|today/i.test(h.due || ""));
      if (todayItems.length === 0) return false;
      return todayItems.every((h) => h.done);
    } catch { return false; }
  }
  window.addEventListener("nbStoreChange", () => {
    const allDone = todayHomeworkAllDone();
    if (allDone && lastSnapshot === false) {
      // transitioned from "not all done" → "all done"
      setTimeout(() => fireConfetti(70), 220);
      window.dispatchEvent(new CustomEvent("toast", { detail: "All done for today — go rest 🎉" }));
    }
    lastSnapshot = allDone;
  });
  // initialize snapshot once HW exists
  setTimeout(() => { lastSnapshot = todayHomeworkAllDone(); }, 600);

  // ─── 4. Tag .hw-row when its check toggles, for the choreographed slide
  // Delegated click handler that adds .just-completed for 0.8s.
  document.addEventListener("click", (e) => {
    const check = e.target.closest(".hw-check");
    if (!check) return;
    const row = check.closest(".hw-row");
    if (!row) return;
    // Was not done before click → mark
    if (!check.classList.contains("done")) {
      requestAnimationFrame(() => {
        row.classList.add("just-completed");
        setTimeout(() => row.classList.remove("just-completed"), 750);
      });
    }
  }, true);

  // ─── 5. Flow stagger — assign --flow-i to every animatable item in
  // document order within a freshly-mounted .route-transition. This is
  // what makes route entrances read as one continuous wave instead of
  // a synchronous "snap into place."
  const FLOW_SELECTOR = [
    ".sn-card",
    ".hw-row",
    ".sn-list-row",
    ".note-row",
    ".subj-card",
    ".quiz-row",
    ".grade-row",
    ".sched-day",
    ".schedule-block",
    ".week-day",
    ".flash-card",
    ".recent-note",
    "[data-flow-item]",
  ].join(",");

  function applyFlowStagger(root) {
    if (!root || !root.querySelectorAll) return;
    const items = root.querySelectorAll(FLOW_SELECTOR);
    let i = 0;
    items.forEach((el) => {
      // Skip items inside a nested route-transition (their own pass will handle them)
      const parentRoute = el.closest(".route-transition");
      if (parentRoute && parentRoute !== root) return;
      if (el.dataset.flowed === "1") return;
      el.dataset.flowed = "1";
      el.style.setProperty("--flow-i", i);
      i++;
    });
  }

  // Run on initial load + every time a new .route-transition is inserted
  function scanExistingRoutes() {
    document.querySelectorAll(".route-transition").forEach(applyFlowStagger);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanExistingRoutes);
  } else {
    scanExistingRoutes();
  }

  const flowObserver = new MutationObserver((mutations) => {
    // IMPORTANT: apply synchronously here (microtask runs before the
    // browser's first paint/animation start). Deferring to rAF would let
    // the CSS animation begin with the default --flow-i:0 on every item,
    // making them all land together.
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.classList && node.classList.contains("route-transition")) {
          applyFlowStagger(node);
        } else if (node.querySelectorAll) {
          const nested = node.querySelectorAll(".route-transition");
          nested.forEach(applyFlowStagger);
        }
      }
    }
  });
  // Observe the body for route swaps
  if (document.body) {
    flowObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      flowObserver.observe(document.body, { childList: true, subtree: true });
    });
  }
})();
