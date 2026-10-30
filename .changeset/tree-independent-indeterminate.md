---
'luxen-ui': patch
---

`<l-tree selection="multiple" independent>` no longer touches `indeterminate` on its items, so you can drive the partial state yourself — for instance from data the DOM does not hold, like rows hidden by a search. Before, the tree cleared every `indeterminate` flag on each click and each item added or removed, and a framework binding (Vue's `:indeterminate`) would not set it again. The item checkbox now also always reflects `selected` and `indeterminate`, even after a native click.
