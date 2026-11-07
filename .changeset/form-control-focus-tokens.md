---
'luxen-ui': minor
---

Added two form tokens to shape the focus of text fields without any CSS override: `--l-form-control-focus-border-width` (stroke width, defaults to `--l-form-control-border-width`) and `--l-form-control-focus-halo-width` (width of the soft halo, defaults to `3px`; `0` removes it). They apply to `.l-input`, `.l-textarea`, the native `.l-select`, `<l-input-group>`, `<l-select>`, `<l-combobox>` and `<l-prose-editor>`, and an invalid field keeps its error color. A stroke wider than the resting border is drawn inward, so the control never changes size and its text never moves. For a crisp 2px stroke with no halo, set `--l-form-control-focus-border-width: 2px` and `--l-form-control-focus-halo-width: 0`. The default focus look is unchanged.
