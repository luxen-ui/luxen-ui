---
'luxen-ui': patch
---

Fix `l-tooltip`: at most one hover/focus/click-triggered tooltip is visible at a time. On dense trigger grids (heatmaps, calendars, avatar stacks), sweeping the pointer across a row could leave two or three tooltips open at once because each instance's safe polygon kept it alive while the neighbour opened — opening a tooltip now dismisses the previous one and invalidates every peer's safe polygon. `trigger="manual"` tooltips opt out: several can stay open together and hover opens never evict them. Also, the `for` property now reflects to the attribute, so `[for="…"]` CSS and `querySelector` calls match when a framework (Vue, React) sets it as a DOM property.
