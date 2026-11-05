---
'luxen-ui': patch
---

In Safari, `<l-tag>` no longer cuts the descenders of its label (g, j, p, q, y), and a control placed in an `<l-tree-item>` row no longer has its focus ring or hover background cut. Both labels now clip only horizontally, where the ellipsis needs it, instead of relying on `overflow-clip-margin`, which Safari does not support.
