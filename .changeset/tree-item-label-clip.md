---
'luxen-ui': patch
---

Fix `<l-tree-item>` clipping the hover/focus decoration of interactive controls
placed in its default slot. The label box still truncates long text to an
ellipsis, but it now uses `overflow: clip` with a small `overflow-clip-margin`
so a row-action button or `<l-dropdown>` trigger keeps its full focus ring and
hover background instead of having them cut off at the row edges.
