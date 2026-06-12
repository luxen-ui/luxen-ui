---
'luxen-ui': patch
---

`<l-rating>` no longer schedules a redundant re-render on first update,
removing a Lit dev-mode warning and an extra render pass.
