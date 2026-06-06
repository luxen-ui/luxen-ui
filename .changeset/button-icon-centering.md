---
'luxen-ui': patch
---

Fix horizontal centering of icon-only buttons (`data-icon-only`). `.l-button` relied on `place-items: center`, whose `justify-items` half is ignored in a flex container, so the icon was offset instead of centered. Added `justify-content: center`.
