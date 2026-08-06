---
'luxen-ui': patch
---

Tabs with `variant="line"` now show a subtle rounded fill behind the hovered tab label, detached from the bottom border so it never touches the underline indicator. The fill also appears when hovering the currently selected tab. Restyle it with the new `--hover-color` and `--hover-inset` custom properties.
