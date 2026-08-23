---
'luxen-ui': minor
---

`l-tooltip` and `l-popover` now follow their anchor. Both positioned themselves once, when they opened, so pointing an open tooltip at a different element by changing `for` left the bubble over the previous one. Retargeting a single shared instance across a chart's bars or cells now works without closing and reopening it on every move.

Two accessibility fixes come with it, in the same situation — any tooltip whose `for` differs between opening and closing, whether you retargeted it deliberately or a re-render swapped the id under you. `aria-describedby` was removed from whatever `for` named at close time rather than from the element that actually received it, stranding it on the original anchor for good: a screen reader keeps describing an element the bubble no longer points at, and nothing in manual testing shows it. `l-popover` had the same bug with `aria-expanded`. Retargeting onto an id that no longer exists now hides the bubble instead of leaving it open over unrelated content.

A tooltip with a static `for` sees none of that. One thing does reach every instance: removing an `l-tooltip` or `l-popover` from the DOM now cleans the attribute off its trigger, where before an `l-popover` left `aria-expanded="false"` behind — a button still advertising a panel that no longer exists.

**New:** `reposition()` on both elements. Positioning stays automatic — reach for this only when you move the anchor yourself, such as a marker tracking the pointer along a chart, where the built-in observers lag behind. No-op when closed.
