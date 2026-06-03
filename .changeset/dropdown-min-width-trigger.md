---
'luxen-ui': minor
---

Add `min-width="trigger"` to `<l-dropdown>`. The panel's width is floored at the trigger's width — never narrower, but still grows with its content — which lines the menu up with select-like triggers (a date-range or filter button). It re-applies automatically if the trigger resizes while the panel is open. The previously dead `min-width: anchor-size(width)` rule (a no-op under floating-ui positioning) has been removed.
