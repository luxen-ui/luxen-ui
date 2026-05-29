---
'luxen-ui': patch
---

Fix unreadable white text on `<l-toast-item>` variants (info/success/warning/danger) in browsers that support `contrast-color()`. The variant text now uses its `text-<variant>` token directly, so it renders consistently across all browsers and stays legible on the soft background.
