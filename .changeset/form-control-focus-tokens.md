---
'luxen-ui': minor
---

Added two form tokens to shape the focus of text fields without any CSS override: `--l-form-control-focus-border-width` (stroke width, defaults to `0`: the resting border alone) and `--l-form-control-focus-halo-width` (width of the soft halo, defaults to `3px`; `0` removes it). They apply to `.l-input`, `.l-textarea`, the native `.l-select`, `<l-input-group>`, `<l-select>`, `<l-combobox>` and `<l-prose-editor>`, and an invalid field keeps its error color. The stroke is drawn inward, over the border, so the control never changes size and its text never moves. For a crisp 2px stroke with no halo, set `--l-form-control-focus-border-width: 2px` and `--l-form-control-focus-halo-width: 0`. The default focus look is unchanged, except that a focused invalid native `.l-select` now tints its halo with the error color, like the input and textarea.
