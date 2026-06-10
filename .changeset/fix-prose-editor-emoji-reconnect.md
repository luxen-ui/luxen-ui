---
'luxen-ui': patch
---

The `l-prose-editor` emoji picker no longer breaks after the element is moved or remounted: the picker is rebuilt on next use instead of pointing at a detached node, and a picker still loading when the editor is removed is no longer orphaned in the document.
