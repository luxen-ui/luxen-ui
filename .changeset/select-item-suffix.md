---
'luxen-ui': minor
---

Rich options gain a suffix: add a `.l-select-item-suffix` after `.l-select-item-text` to pin a badge, a count or a status icon to the end of the row, in the native `select.l-select`, `<l-select>` and `<l-combobox>` alike. The suffix sits on the title's line, keeps its natural width while a long title truncates with an ellipsis, and stays in the picker (it is not mirrored into the trigger). Its text is never part of the option's label, so it is not matched by search nor shown in the input or chips. An `<l-badge>` placed in a rich option is now styled inside the `<l-select>` and `<l-combobox>` popovers (page-level selectors still don't reach those copies; set the badge's CSS custom properties on the host element instead).
