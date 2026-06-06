---
'luxen-ui': patch
---

Improve `<l-tree>` / `<l-tree-item>` accessibility. The tree host now carries
`role="tree"` (give it an accessible name via `aria-label`), items expose
`aria-level`/`aria-setsize`/`aria-posinset` and `aria-busy` while loading, and
the decorative checkbox is hidden from assistive tech. Roles and ARIA states are
also mirrored to DOM attributes, so `[role]` and `[aria-*]` selectors (CSS,
`querySelector`, Cypress/Playwright) and `getByRole` state filters keep matching.
