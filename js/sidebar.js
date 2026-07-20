// Fills the vertical sidebar progress bar based on the user's current
// score, relative to a fixed zero baseline in the middle of the track.
//   score > 0: green fill grows UPWARD from the baseline
//   score < 0: red fill grows DOWNWARD from the baseline
//   score = 0: no fill, marker icon sits right on the baseline
// The marker icon always sits at the current leading edge (tip) of the
// fill, so it visibly moves up or down as the score changes.
const POINTS_TO_PASS = 5;

export function applyProgressBar(score) {
  const posFill = document.getElementById("progress-fill-positive");
  const negFill = document.getElementById("progress-fill-negative");
  const marker = document.getElementById("progress-marker");
  if (!posFill || !negFill || !marker) return;

  // Percentage of a single half (0-100) the fill should occupy.
  const halfPct = Math.min(Math.abs(score) / POINTS_TO_PASS, 1) * 100;

  if (score > 0) {
    posFill.style.height = halfPct + "%";
    negFill.style.height = "0%";
    // Baseline is at 50% of the full track; moving up means decreasing
    // "top". Half the track = 50%, so halfPct% of a half = halfPct/2
    // percentage points of the full track.
    marker.style.top = (50 - halfPct / 2) + "%";
  } else if (score < 0) {
    posFill.style.height = "0%";
    negFill.style.height = halfPct + "%";
    marker.style.top = (50 + halfPct / 2) + "%";
  } else {
    posFill.style.height = "0%";
    negFill.style.height = "0%";
    marker.style.top = "50%";
  }
}
