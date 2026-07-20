// Fills the vertical sidebar progress bar based on the user's current
// score. Bottom-to-top fill; percentage is abs(score) / points to pass,
// capped at 100%. Green when score is positive, red when negative,
// empty/neutral at exactly 0.
const POINTS_TO_PASS = 5;

export function applyProgressBar(score) {
  const fill = document.getElementById("progress-fill");
  if (!fill) return;

  const pct = Math.min((Math.abs(score) / POINTS_TO_PASS) * 100, 100);
  fill.style.height = pct + "%";

  fill.classList.remove("progress-green", "progress-red");
  if (score > 0) {
    fill.classList.add("progress-green");
  } else if (score < 0) {
    fill.classList.add("progress-red");
  }
}
