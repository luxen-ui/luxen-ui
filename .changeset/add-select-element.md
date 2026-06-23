---
'luxen-ui': minor
---

Add `<l-select>`, a searchable select with a button trigger and a popover listbox. It supports single and multiple selection (with removable `<l-tag>` chips), in-popover search with accent/case-insensitive filtering, rich options via the shared `.l-select-item-*` classes, `<option selected>` pre-selection, sizes, a clear button, and full keyboard/ARIA support. It is form-associated — single mode submits one value, multiple mode submits one entry per value.

Options are authored as a native `<datalist>` of `<option>`, the same surface as `<l-combobox>`. The zero-JS native `<select class="l-select">` continues to ship as the "platform" tier and is now documented alongside `<l-select>` on a single Select page.
