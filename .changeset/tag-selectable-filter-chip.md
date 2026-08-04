---
'luxen-ui': patch
---

`<l-tag>` can now be a filter chip. Add `selectable` and the tag becomes a toggle button that reports `aria-pressed` and fires a bubbling `change` event — re-activating a selected tag releases it, so a facet always has a way back to "all". Add `control="checkbox"` for a multi-select axis and the library's own checkbox rides inside the chip, with the whole chip as its label.

A new `suffix` slot holds a count or trailing glyph and gets the chip's gutter by construction, `--height` sizes the chip without reaching for `::part(base)`, and `--selected-color` / `--selected-background` theme the selected look — set the colour alone and the tint, border, and checkbox accent follow.
