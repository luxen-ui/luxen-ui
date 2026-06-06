---
'luxen-ui': patch
---

Fix `<l-tree-item lazy>` not requesting its children when expanded with the
keyboard. The `lazy-load` event is now emitted on any expand (arrow keys,
`expandAll()`, the `*` shortcut), not only when toggled by pointer, and
activating a branch with Enter/Space in single-selection mode now expands it
too — so keyboard users no longer end up with an open lazy branch that never
loads.
