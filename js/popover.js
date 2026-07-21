// Wires a trigger button to show/hide a popover overlay. The popover
// closes when its "x" button is clicked, when the backdrop (anything
// outside the popover box) is clicked, or when Escape is pressed.
export function setupPopover(triggerId, overlayId) {
  const trigger = document.getElementById(triggerId);
  const overlay = document.getElementById(overlayId);
  if (!trigger || !overlay) return;

  const closeBtn = overlay.querySelector(".popover-close");

  function open() {
    overlay.classList.add("open");
  }

  function close() {
    overlay.classList.remove("open");
  }

  trigger.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  // Clicking the overlay itself (the backdrop) closes it, but clicking
  // inside the popover box should not - stopPropagation isn't needed
  // since we check that the click target is the overlay, not a child.
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
