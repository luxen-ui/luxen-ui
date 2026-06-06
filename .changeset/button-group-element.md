---
'luxen-ui': minor
---

Add `<l-button-group>` to join related `.l-button` elements into a single segmented control with shared borders. Set `label` for an accessible group name (`role="group"` + `aria-label`) and `orientation="vertical"` to stack the buttons. The joined appearance is pure CSS, so it also works for a button wrapped in `<l-dropdown>` — e.g. a split button — and the focused button's ring is raised above its neighbours so it is never clipped.
