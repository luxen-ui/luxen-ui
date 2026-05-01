---
'luxen-ui': patch
---

`<l-dialog>` (and `<l-drawer>`) now expose a `title` slot for providing a custom heading element, and a `without-header` attribute to hide the header entirely. When neither the `title` property nor the `title` slot is used, the default `<h2>` is no longer rendered.
