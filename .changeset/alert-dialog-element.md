---
'luxen-ui': minor
---

Add `<l-alert-dialog>`, an interruptive confirmation dialog built on `<l-dialog>`. It ships built-in cancel/confirm actions, a `tone="danger"` destructive variant, cancelable `confirm` / `cancel` events (call `preventDefault()` to keep it open for async work), a `loading` state, and `role="alertdialog"` with an accessible description.

The `destructive` button variant (`data-variant="destructive"`) is now a solid, high-emphasis danger fill (previously a soft, low-emphasis tint) so a destructive action reads as prominently as `primary`. Buttons also pick up disabled styling from `aria-disabled` (not just the native `disabled` attribute).
