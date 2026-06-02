---
'luxen-ui': minor
---

Add a checkbox and the foundation of the form system. New `.l-checkbox` class styles a native `<input type="checkbox">`, a progressive `l-form-field` wrapper wires accessibility (label, `aria-describedby`, `aria-invalid`, required marker) and layout, with `.l-hint` and `.l-error` message classes. New form design tokens (`--l-form-control-*`, `--l-form-field-*`) — including a form-wide accent via `--l-form-control-activated-color` — are shared across form controls. `l-input-stepper` now adopts these tokens too and shows an invalid border when its input is `aria-invalid`. Import per element (`luxen-ui/css/checkbox`, `luxen-ui/css/form-field`) or get the tokens via the preset.
