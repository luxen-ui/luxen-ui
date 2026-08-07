---
'luxen-ui': patch
---

`l-dropdown` now emits the cancelable `hide` event on every close path. Closing the menu by clicking outside it previously fired only `after-hide`, which left any state synced on `@hide` stale — a trigger kept its open styling in front of a closed menu — and made that close impossible to cancel.

Escape also closes a menu that was opened with the pointer, even on pages whose own keyboard shortcuts call `preventDefault()` on the Escape key and so suppress the browser's built-in dismissal.
