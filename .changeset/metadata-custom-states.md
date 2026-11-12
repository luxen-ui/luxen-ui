---
'luxen-ui': minor
---

`luxen-ui/metadata` lists each element's custom states in a new `cssStates` field: the `:state()` selectors you can style it with. The form elements (`l-combobox`, `l-prose-editor`, `l-rating`, `l-segmented-control`, `l-select`, `l-slider`) expose `required`, `optional`, `valid`, `invalid`, `user-valid` and `user-invalid`, `l-tree-item` exposes `checkbox` and `has-children`, and `l-icon` exposes `loading`. The generated AI skill lists them too.

The form states now match from the first render and follow the element. `l-slider`, `l-rating` and `l-segmented-control` used to set none of them until `reportValidity()` or a form reset, and on every form element `required` and `optional` stayed stale when `required` changed.
