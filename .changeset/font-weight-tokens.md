---
'luxen-ui': patch
---

Make every element honour the `--l-font-weight-*` scale. Sixteen declarations across `l-divider`, `l-kbd`, `l-tabs`, `l-segmented-control`, `l-disclosure`, `l-prose-editor`, `l-select`, `l-story`, `l-combobox`, `l-dialog`, `l-dropdown-label`, `l-avatar` and `l-stories-viewer` hardcoded `600` or `500` instead of reading the token, so they ignored a remapped weight scale and drifted out of step with the rest of the page.

Rendering is unchanged at the default token values — `--l-font-weight-semibold` already resolves to `600`. Only consumers who override a weight token see a difference, and for them it is the fix.
