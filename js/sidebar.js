import { MAX_LIVES, POINTS_TO_PASS as DEFAULT_POINTS_TO_PASS } from "./game.js";

// ---------------------------------------------------------------------
// Progress bar
//
// Every level uses zero-to-positive-only scoring: wrong answers cost a
// life rather than subtracting points, so the score can never go below
// 0. The track has no negative/red region - a score of 0 sits at the
// very bottom and the fill grows straight up toward the (possibly-rising)
// points-to-pass target, with the marker riding the top edge of the fill.
// ---------------------------------------------------------------------

function computeSimplePositions(score, target) {
  const t = target && target > 0 ? target : DEFAULT_POINTS_TO_PASS;
  const pct = Math.min(Math.max(score, 0) / t, 1) * 100;
  return { fillHeight: pct, markerBottom: pct };
}

function getElements() {
  const posFill = document.getElementById("progress-fill-positive");
  const marker = document.getElementById("progress-marker");
  const markerIcon = marker ? marker.querySelector("img") : null;
  if (!posFill || !marker || !markerIcon) return null;
  return { posFill, marker, markerIcon };
}

// Spins the marker icon once around the z-axis. Used as an
// acknowledgement cue when the marker's position doesn't otherwise
// change, so the user still sees that their answer was registered.
function playZeroPointsAcknowledgement(markerIcon) {
  markerIcon.classList.remove("icon-marker-spin");
  void markerIcon.offsetWidth; // force reflow so a repeat spin restarts cleanly
  markerIcon.classList.add("icon-marker-spin");
  markerIcon.addEventListener(
    "animationend",
    () => markerIcon.classList.remove("icon-marker-spin"),
    { once: true }
  );
}

function paint(els, score, target) {
  const pos = computeSimplePositions(score, target);
  els.posFill.style.height = pos.fillHeight + "%";
  els.marker.style.bottom = pos.markerBottom + "%";
}

function withoutTransition(els, fn) {
  els.posFill.classList.add("no-transition");
  els.marker.classList.add("no-transition");
  fn();
  void els.posFill.offsetHeight; // force reflow so the change applies instantly
  els.posFill.classList.remove("no-transition");
  els.marker.classList.remove("no-transition");
}

// Sets the bar to reflect `score` immediately, with no animation. Use
// whenever the displayed score hasn't actually changed since the user
// last saw it (e.g. arriving at complete/failed/next-question pages).
// `target` (simple mode only) is the current points-to-pass goal; it
// defaults to the level's starting target if omitted.
export function setProgressBar(score, target) {
  const els = getElements();
  if (!els) return;
  withoutTransition(els, () => paint(els, score, target));
}

// Animates the bar from `fromScore` to `toScore`, so the fill visibly
// grows or shrinks starting from wherever it already was, rather than
// resetting to the baseline first. Use right after an answer is scored.
export function animateProgressBar(fromScore, toScore, target) {
  const els = getElements();
  if (!els) return;

  withoutTransition(els, () => paint(els, fromScore, target));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      paint(els, toScore, target);
      // 0 points acquired: the marker won't move, so spin it in place
      // instead as visible confirmation the answer was scored.
      if (fromScore === toScore) {
        playZeroPointsAcknowledgement(els.markerIcon);
      }
    });
  });
}

// Convenience alias for "just show the current score, no animation".
export function applyProgressBar(score, target) {
  setProgressBar(score, target);
}

// ---------------------------------------------------------------------
// Cross-page sidebar cache
//
// Every page is a full navigation/reload, so the sidebar's real values
// (score, target, lives) are only known once Firebase auth + a Firestore
// fetch resolve. Without help, that means every page load starts from
// the sidebar's empty default (0% fill, grey hearts) and then jumps to
// the truth a beat later - a visible "flash".
//
// To avoid that, each page caches its own known-good values in
// sessionStorage right after fetching them (writeSidebarCache), and the
// *next* page paints that cached snapshot immediately at parse time,
// before requireAuth/Firestore even resolve (paintSidebarCache). Score
// and target are always cached together as one snapshot, so a rising
// points-to-pass target (e.g. after a wrong answer) never gets paired
// with a stale target - the percentage painted is always internally
// consistent for the moment it was captured.
// ---------------------------------------------------------------------

const SIDEBAR_CACHE_PREFIX = "pedecgSidebarCache:";

// Persists the current score/target/lives for `levelKey` (e.g. "level1",
// "level2") so the next page that loads for this level can paint
// instantly. Call this right after computing real values from Firestore.
export function writeSidebarCache(levelKey, { score, target, lives, maxLives, mets } = {}) {
  try {
    sessionStorage.setItem(
      SIDEBAR_CACHE_PREFIX + levelKey,
      JSON.stringify({ score, target, lives, maxLives, mets })
    );
  } catch (err) {
    // sessionStorage unavailable (e.g. private browsing) - just skip caching.
  }
}

function readSidebarCache(levelKey) {
  try {
    const raw = sessionStorage.getItem(SIDEBAR_CACHE_PREFIX + levelKey);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

// Paints the cached snapshot for `levelKey`, if any, with no animation.
// Call this synchronously at the very top of a page's script - before
// requireAuth - so returning players never see the bar/hearts reset to
// empty first. Returns the cached snapshot (or null if there wasn't one,
// e.g. the very first page of a session).
export function paintSidebarCache(levelKey) {
  const cached = readSidebarCache(levelKey);
  if (!cached) return null;
  setProgressBar(cached.score, cached.target);
  if (typeof cached.lives === "number") {
    setLives(cached.lives, cached.maxLives || MAX_LIVES);
  }
  if (typeof cached.mets === "number") {
    setMets(cached.mets);
  }
  return cached;
}

// ---------------------------------------------------------------------
// Lives (hearts)
// ---------------------------------------------------------------------

// Fills in / grays out the heart icons under the "Lives:" label to
// reflect how many lives remain. No-ops on pages without a lives
// display (e.g. Level 2 pages, which don't use the lives system).
export function setLives(lives, maxLives = MAX_LIVES) {
  const container = document.getElementById("lives-hearts");
  if (!container) return;
  const hearts = container.querySelectorAll(".heart");
  const remaining = Math.max(0, Math.min(lives, maxLives));
  hearts.forEach((heart, index) => {
    if (index < remaining) {
      heart.classList.add("heart-filled");
      heart.classList.remove("heart-lost");
    } else {
      heart.classList.remove("heart-filled");
      heart.classList.add("heart-lost");
    }
  });
}

// ---------------------------------------------------------------------
// METs
// ---------------------------------------------------------------------

// Updates the "METs:" number shown above the progress bar. No-ops on
// pages without a METs display.
export function setMets(mets) {
  const el = document.getElementById("mets-value");
  if (!el) return;
  el.textContent = typeof mets === "number" ? mets : 0;
}

// ---------------------------------------------------------------------
// Level-completion Stats section (METs interpretation + 2x2/3x2 matrix)
// ---------------------------------------------------------------------

const MATRIX_LABELS = {
  correct: {
    high: "Master/Bullseye (Knew it and nailed it)",
    low: "Hidden Genius (More capable than you might think)"
  },
  partial: {
    high: "Rough gems / Refinement in progress",
    low: "Halfway there (gaining traction)"
  },
  incorrect: {
    high: "Blind Spots (Overconfident, needs review)",
    low: "Learning Zone"
  }
};

const ROW_HEADINGS = {
  correct: "Correct",
  partial: "Partially correct",
  incorrect: "Incorrect"
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Renders the correctness x confidence stats matrix into `container`
// (a DOM element). `tally` is the object returned by tallyAnswerEntries
// in game.js. Pass `{ hasPartial: true }` for levels with freetext
// questions (which can be graded as "partially correct") to include the
// extra middle row.
export function renderStatsMatrix(container, tally, { hasPartial = false } = {}) {
  if (!container) return;
  const rows = hasPartial ? ["correct", "partial", "incorrect"] : ["correct", "incorrect"];

  let html = '<table class="stats-matrix">';
  html += '<thead><tr><th></th><th>High confidence</th><th>Low confidence</th></tr></thead><tbody>';
  rows.forEach((row) => {
    html += `<tr><th>${ROW_HEADINGS[row]}</th>`;
    ["high", "low"].forEach((col) => {
      const count = (tally[row] && tally[row][col]) || 0;
      const label = MATRIX_LABELS[row][col];
      html += `<td class="matrix-cell"><div class="matrix-count">${count}</div>` +
        `<div class="matrix-label">${escapeHtml(label)}</div></td>`;
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

// Plays once when the user successfully completes the level: spins the
// top goal icon on its Y axis, then swaps in a green "success" version
// of the icon and leaves the slot in its green "success" state.
const LEVEL_COMPLETION_SUCCESS_SRC = "images/icon-level-completion-success.svg";

export function playCompletionAnimation() {
  const icon = document.getElementById("level-completion-icon");
  const slot = document.getElementById("level-completion-slot");
  if (!icon) return;

  icon.classList.add("icon-spin");
  icon.addEventListener(
    "animationend",
    () => {
      icon.classList.remove("icon-spin");
      icon.classList.add("icon-success");
      icon.src = LEVEL_COMPLETION_SUCCESS_SRC;
      if (slot) slot.classList.add("icon-success");
    },
    { once: true }
  );
}
