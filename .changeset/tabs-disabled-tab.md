---
'luxen-ui': patch
---

`l-tabs` now handles a disabled tab. A tab button marked `disabled` (or `aria-disabled="true"`) is skipped by the arrow keys, `Home` and `End`, it cannot be selected by a click or by setting `value`, and it never takes the roving `tabindex="0"` — previously arrow keys could land selection on a disabled tab, which left the tablist with no reachable entry point because a disabled button cannot take focus. If the initial `value` points at a disabled tab, the first enabled tab is selected instead. Disabled tabs keep their own panel, so the tab/panel order is unchanged.

Visually, a disabled tab now greys out and shows a `not-allowed` cursor, and the `line` variant no longer paints its hover pill behind one — `:hover` still matches a disabled button, so the fill had been promising click feedback that would never arrive.

`change` also stops firing when the selected tab is re-selected, matching its documented "fired when the active tab changes" contract.
