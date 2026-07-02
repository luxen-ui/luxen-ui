---
'luxen-ui': patch
---

Fix `l-dropdown`: a click dispatched programmatically on an `l-dropdown-item` host (`item.click()`, a synthetic `MouseEvent`, or a testing tool that retargets to the host) now fires `select`. Previously only pointer/keyboard hits on the inner row were honored, which broke programmatic activation and E2E tests. Hits inside a parent item's submenu panel are still correctly ignored.
