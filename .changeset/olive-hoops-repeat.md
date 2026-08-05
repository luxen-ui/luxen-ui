---
'luxen-ui': patch
---

Fix elements rendering unstyled when the CSS prefix is renamed via
`luxen.config.mjs` / the Vite plugin's `cssPrefix` option. `l-tree-item`'s
checkbox, `l-alert-dialog`'s built-in actions, `l-story`, `l-input-otp`, and
`l-input-stepper` emitted hardcoded `l-*` class names while their stylesheets
were rewritten to the configured prefix, so the selectors no longer matched and
those parts fell back to native/unstyled appearance. Class names are now derived
from the configured prefix. No effect at the default `l` prefix.
