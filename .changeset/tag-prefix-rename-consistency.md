---
'luxen-ui': patch
---

Fix the custom-element prefix rename so it stays consistent across the library. `<l-stories>` now resolves its `<l-story>` / `<l-stories-viewer>` children through the prefix registry instead of hardcoded `l-` tag literals, so the playlist and the auto-singleton viewer keep working under a custom `elementPrefix`. The library also no longer ships fixed `l-*` keys in the global `HTMLElementTagNameMap` for a handful of elements — consumer-side tag typing is emitted with the configured prefix via the Vite plugin's `emitTypes` option instead.
