---
'luxen-ui': patch
---

In Safari, `<l-tag>` no longer clips the descenders of its label (g, j, p, q, y), and an `<l-tree-item>` row no longer cuts the focus ring of a control placed in it. Both relied on `overflow-clip-margin`, which Safari does not support.
