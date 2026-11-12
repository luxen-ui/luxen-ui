---
'luxen-ui': patch
---

Before its script loads, `<l-dropdown>` now shows its `slot="trigger"` element in place and hides only the menu content, instead of hiding the whole element. The trigger no longer pops in and shifts the layout when the element upgrades. A display utility on the host, such as Tailwind `flex`, no longer makes the menu items flash inline. `<l-dialog>`, `<l-drawer>`, `<l-popover>` and `<l-tooltip>` stay fully hidden until they upgrade, as before.
