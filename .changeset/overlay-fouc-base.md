---
'luxen-ui': patch
---

Fix flash of unstyled content for `<l-dialog>`, `<l-drawer>`, `<l-dropdown>`, `<l-popover>`, and `<l-tooltip>`. The base stylesheet now hides these overlay elements until their custom element has registered, so their light-DOM children no longer briefly appear inline before the upgrade. Apps that were hiding these tags themselves can drop the workaround.
