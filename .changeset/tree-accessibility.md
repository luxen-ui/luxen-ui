---
'luxen-ui': patch
---

Improve `<l-tree>` / `<l-tree-item>` accessibility. The tree host now carries
`role="tree"` (give it an accessible name via `aria-label`), items expose
`aria-level`/`aria-setsize`/`aria-posinset` and `aria-busy` while loading, and
the decorative checkbox is hidden from assistive tech. Roles are also mirrored
to a DOM attribute so `[role="tree"]`/`[role="treeitem"]` selectors keep
matching; select ARIA states via the reflected `selected`/`expanded`/`disabled`
attributes, not `[aria-*]`.
