---
'luxen-ui': patch
---

`<l-popover>` no longer applies a default `12px 16px` padding to its content. Wrap the slotted content in a container with the spacing you want (e.g. `<div class="px-4 py-3">…</div>`). This gives full control over layout — particularly useful for menus, lists, and `full-width` mega menus where the previous padding pushed content past the viewport edge.
