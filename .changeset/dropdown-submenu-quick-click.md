---
'luxen-ui': patch
---

Fix `<l-dropdown>` reopening a submenu the user had just closed — with a quick second click on its parent item, a key press, or a slight pointer move across the row. Pressing a modifier key alone (Shift, Meta…) no longer cancels a submenu about to open on hover.
