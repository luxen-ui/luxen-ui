type Overlay = HTMLElement & {
  open?: boolean;
  show?: () => void;
  updateComplete?: Promise<unknown>;
};

/**
 * Open an overlay element and wait until it has painted into the a11y tree.
 *
 * Event-free by design: the overlays differ in their lifecycle events — dialog/
 * drawer/dropdown/sticky-bar dispatch `after-show`, but popover/tooltip
 * (PopoverController-driven) dispatch nothing. Rather than special-case each, we
 * drive the public open API (`.open = true`, which every one of them reacts to
 * in its update cycle) and settle two Lit cycles + macrotasks. Fixtures set
 * `--show-duration: 0; --hide-duration: 0` so the reveal is synchronous.
 */
export async function openOverlay(el: Overlay): Promise<void> {
  el.open = true;
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
}
