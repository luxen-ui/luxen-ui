---
'luxen-ui': patch
---

`<l-dialog>` and `<l-drawer>` now expose an accessible name: the `title`
property (or a slotted `slot="title"` heading) names the native dialog via
`aria-labelledby`/`aria-label`, so screen readers announce the dialog by its
title instead of an unnamed dialog (WCAG 4.1.2).
