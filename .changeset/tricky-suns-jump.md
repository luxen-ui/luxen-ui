---
'luxen-ui': minor
---

Add `<l-segmented-control>` — a single-select switch between a few mutually-exclusive options, with a sliding pill behind the selected segment. It progressively enhances light-DOM `<button>`s into a `radiogroup` with roving-tabindex keyboard support (arrow keys, `Home`/`End`), and emits a `change` event carrying the selected `value` and `index`. It is form-associated: give it a `name` and its selected value is submitted with the form (and restored on reset), like a native radio group. It aligns with `.l-button` and form controls via the shared `size` scale (`sm`/`md`/`lg`/`xl`), and segments hold any content — labels, `<l-icon>` + label, or icon-only (auto-squared, with `aria-label`) — so filter toolbars stay visually consistent.
