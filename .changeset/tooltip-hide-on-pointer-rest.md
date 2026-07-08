---
'luxen-ui': patch
---

Fix `<l-tooltip>` (and hover-triggered `<l-popover>`) staying open after the pointer left the trigger. The safe polygon that lets the pointer travel to the bubble without flicker was only re-evaluated on `pointermove`, so a pointer that left the trigger and immediately came to rest (a quick flick-and-stop) fired no further event and the tooltip stayed visible until the next, possibly never-coming, move. Hiding is now backed by a short timed fallback that closes the tooltip once the pointer has settled in the corridor between the trigger and the bubble. The fallback is only armed in that corridor — resting the pointer on the bubble itself (to read it, or to click inside an interactive popover) keeps it open, and it no longer stacks on top of `hide-delay`.
