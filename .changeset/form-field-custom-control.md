---
'luxen-ui': patch
---

Fix `l-form-field` not wiring up form-associated custom element controls such as `l-slider`. A slider (or any custom control) inside a form field no longer shows its `.l-error` message on load, and now receives the proper `id`/`label[for]`/`aria-describedby` accessibility wiring. The field also re-attempts wiring once a lazily-loaded control element upgrades, so it works regardless of script load order. The error message's resting visibility is now driven by CSS from the field's `invalid` state, so it stays hidden by default even before the element upgrades or if its script never runs.
