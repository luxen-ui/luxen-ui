---
'luxen-ui': minor
---

The end actions of text controls now follow the control height. The clear button and the chevron of `<l-select>` and `<l-combobox>`, the chevron of the native `select.l-select`, and the search clear and date/time picker icon of `.l-input` each take a square as tall as the field (borders excluded). A taller control set with `--height` or `--l-form-control-height` gets larger hit areas and more room between them, with no extra setting. Inside `<l-input-group>`, the native actions follow the group's `size`. The clear button gains a hover background and a visible focus ring.

A new `--l-form-control-icon-size` token sets the size of all these glyphs, and of the `<l-input-group>` password toggle (default `1em`). `<l-select>` and `<l-combobox>` expose their glyphs as `--chevron-icon` and `--clear-icon`.

Clicking the chevron of `<l-combobox>` now closes an open list, as it already did in `<l-select>`. A long value in `<l-select>` now stops before the clear button instead of running under it. `<l-form-field>` no longer widens to fit a long select value: the field stays as wide as its container and the value truncates, so a form laid out as a grid keeps every field inside its box at every control size.

**Styling the `chevron` and `clear` parts.** These parts are now the action's full square, and the glyph is drawn inside them. To resize a glyph, set `--l-form-control-icon-size` instead of sizing the part. To change it, set `--chevron-icon` or `--clear-icon` instead of a `mask` on the part. A `color` on the part still recolors the glyph.

The native `select.l-select` chevron is drawn at `1em` like the other chevrons, smaller than its former fixed `1.25rem` box. Set `--l-form-control-icon-size` to enlarge every glyph at once.
