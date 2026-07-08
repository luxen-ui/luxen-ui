---
'luxen-ui': minor
---

Add `show-delay` and `hide-delay` attributes to `<l-tooltip>`. `show-delay` requires the pointer to dwell on the trigger for the given number of milliseconds before the tooltip opens, so sweeping across a toolbar or a grid of icon triggers no longer flashes a tooltip on every control the pointer passes over. `hide-delay` waits before closing after the pointer leaves, bridging a brief exit-and-return without flicker. Both default to `0` (today's immediate behaviour) and apply to `hover` only — keyboard focus always shows the tooltip immediately.
