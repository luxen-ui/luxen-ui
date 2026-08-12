---
'luxen-ui': patch
---

A segment of `l-segmented-control` marked `aria-disabled="true"` now stays disabled. The attribute was stripped when the element upgraded — and again whenever a disabled control was re-enabled — so the segment became selectable by click and reachable with the arrow keys, even though the disabled styling and the keyboard navigation both treat `aria-disabled` as a supported spelling. Segments using the native `disabled` attribute were unaffected.
