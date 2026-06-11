---
'luxen-ui': patch
---

`<l-stories-viewer>` no longer schedules redundant re-renders when opening or
advancing between stories, removing a Lit dev-mode warning and an extra
render cycle per story change.
