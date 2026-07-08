---
'luxen-ui': patch
---

Fix `l-tooltip` reappearing after a dialog (or any modal) closes. A hover/focus tooltip on a button that opens an `l-dialog` used to pop back up once the dialog was dismissed, because the dialog restores focus to its trigger. Focus-triggered tooltips now only show on `:focus-visible` (keyboard focus), matching the platform's native `title` and the ARIA tooltip pattern — so a mouse user no longer sees the tooltip resurrect on close, while keyboard users still get it on focus return.
