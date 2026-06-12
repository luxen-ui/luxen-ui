---
'luxen-ui': patch
---

Accessibility fixes across seven elements, surfaced by the new axe-core test suite. `<l-button-group>` no longer sets `aria-orientation` on `role="group"` (not allowed by ARIA 1.2 — the attribute still drives the layout via CSS). An interactive `<l-avatar>` now exposes its accessible name on the inner button instead of an illegal focusable `role="img"` host. `<l-carousel>` navigation buttons gained accessible names ("Previous slide", "Next slide", "Toggle fullscreen"). `<l-input-otp>` no longer hides its real input from assistive technology — only the decorative cells are `aria-hidden`, so the input is now exposed as a textbox. `<l-popover>` no longer emits an `aria-controls` reference that cannot resolve across its shadow boundary. `<l-prose-editor>` forwards the host's `aria-label` (default "Rich text editor") onto the editable region. The `<l-stories-viewer>` progress bar is now named ("Story progress").
