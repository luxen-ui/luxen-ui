---
'luxen-ui': patch
---

Light-DOM elements (`l-input-stepper`, `l-input-otp`, `l-tabs`) now initialize in hidden tabs, iframes, and prerendered documents, and no longer double-initialize after being moved in the DOM. Setup previously waited for an animation frame, which never fires while the document is hidden.
