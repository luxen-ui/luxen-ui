---
'luxen-ui': patch
---

`l-input-stepper` now creates its button icons via DOM APIs instead of HTML string interpolation, so icon names sourced from application data can never inject markup.
