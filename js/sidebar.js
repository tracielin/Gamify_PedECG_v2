// Vertical sidebar progress bar, anchored to a zero baseline that sits
// 2/3 of the way down the track (2/3 of the track is positive/green
// territory above it, 1/3 is negative/red territory below it).
//   score > 0: green fill grows UPWARD from the baseline
//   score < 0: red fill grows DOWNWARD from the baseline
//   score = 0: no fill, marker sits right on the baseline
// The marker icon always sits at the current leading edge (tip) of the
// fill, so it visibly moves up or down as the score changes.
const POINTS_TO_PASS = 5;
const POS_REGION_PCT = 200 / 3; // 66.6667% - track space above the baseline
const NEG_REGION_PCT = 100 / 3; // 33.3333% - track space below the baseline

function computePositions(score) {
  const halfPct = Math.min(Math.abs(score) / POINTS_TO_PASS, 1) * 100;

  if (score > 0) {
    return {
      posHeight: halfPct,
      negHeight: 0,
      markerTop: POS_REGION_PCT - (halfPct / 100) * POS_REGION_PCT,
    };
  }
  if (score < 0) {
    return {
      posHeight: 0,
      negHeight: halfPct,
      markerTop: POS_REGION_PCT + (halfPct / 100) * NEG_REGION_PCT,
    };
  }
  return { posHeight: 0, negHeight: 0, markerTop: POS_REGION_PCT };
}

function getElements() {
  const posFill = document.getElementById("progress-fill-positive");
  const negFill = document.getElementById("progress-fill-negative");
  const marker = document.getElementById("progress-marker");
  const markerIcon = marker ? marker.querySelector("img") : null;
  if (!posFill || !negFill || !marker || !markerIcon) return null;
  return { posFill, negFill, marker, markerIcon };
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

function paint(els, pos) {
  els.posFill.style.height = pos.posHeight + "%";
  els.negFill.style.height = pos.negHeight + "%";
  els.marker.style.top = pos.markerTop + "%";
}

function withoutTransition(els, fn) {
  els.posFill.classList.add("no-transition");
  els.negFill.classList.add("no-transition");
  els.marker.classList.add("no-transition");
  fn();
  void els.posFill.offsetHeight; // force reflow so the change applies instantly
  els.posFill.classList.remove("no-transition");
  els.negFill.classList.remove("no-transition");
  els.marker.classList.remove("no-transition");
}

// Sets the bar to reflect `score` immediately, with no animation. Use
// whenever the displayed score hasn't actually changed since the user
// last saw it (e.g. arriving at complete/failed/next-question pages).
export function setProgressBar(score) {
  const els = getElements();
  if (!els) return;
  withoutTransition(els, () => paint(els, computePositions(score)));
}

// Animates the bar from `fromScore` to `toScore`, so the fill visibly
// grows or shrinks starting from wherever it already was, rather than
// resetting to the baseline first. Use right after an answer is scored.
export function animateProgressBar(fromScore, toScore) {
  const els = getElements();
  if (!els) return;

  withoutTransition(els, () => paint(els, computePositions(fromScore)));

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      paint(els, computePositions(toScore));
      // 0 points acquired: the marker won't move, so spin it in place
      // instead as visible confirmation the answer was scored.
      if (fromScore === toScore) {
        playZeroPointsAcknowledgement(els.markerIcon);
      }
    });
  });
}

// Convenience alias for "just show the current score, no animation".
export function applyProgressBar(score) {
  setProgressBar(score);
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
