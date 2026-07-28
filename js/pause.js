import { setupPopover } from "./popover.js";

// Shared "Pause game" control for pages that have a right-side toolbar.
// Wires up the pause button + its popup (reusing the same open/close,
// backdrop-click, and Escape behavior as the reference popovers), fills
// in the level-specific copy, and wires the popup's two actions:
//   - Return to Main Menu -> navigates to mainmenu.html
//   - Resume Level [n]    -> just closes the popup
export function setupPauseModal(levelNumber) {
  const pauseBtn = document.getElementById("pause-btn");
  const overlay = document.getElementById("pause-overlay");
  if (!pauseBtn || !overlay) return;

  const messageEl = document.getElementById("pause-message");
  const menuBtn = document.getElementById("pause-menu-btn");
  const resumeBtn = document.getElementById("pause-resume-btn");

  if (messageEl) {
    messageEl.textContent =
      `Game paused. Your level ${levelNumber} progress has been saved. ` +
      "You can now close your browser window and come back to the website later.";
  }
  if (resumeBtn) {
    resumeBtn.textContent = `Resume Level ${levelNumber}`;
  }

  setupPopover("pause-btn", "pause-overlay");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      window.location.href = "mainmenu.html";
    });
  }
  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => overlay.classList.remove("open"));
  }
}
