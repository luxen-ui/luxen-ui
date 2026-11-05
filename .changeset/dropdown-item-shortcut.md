---
'luxen-ui': minor
---

`<l-dropdown-item>` gains a `shortcut` attribute that shows the item's keyboard shortcut at the end of the row, as small muted text in the row's font (`<l-dropdown-item shortcut="Ctrl+C">Copy</l-dropdown-item>`). A page reset that restyles `<kbd>` does not affect it, and it can be themed through the `shortcut` CSS part. The shortcut is display only: bind the keys in your own code.
