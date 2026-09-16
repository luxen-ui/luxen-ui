---
'luxen-ui': patch
---

`<l-select>` and `<l-combobox>` now follow their `<datalist>` after mount. Re-labelling, adding, removing, or disabling an `<option>` updates the closed trigger (or the input) right away, instead of waiting for the list to be opened. This fixes localized pickers — a language select whose option labels are re-translated used to keep showing the previous label until the panel was opened — and framework re-renders in general, which patch the existing `<option>` nodes in place rather than replacing them.
