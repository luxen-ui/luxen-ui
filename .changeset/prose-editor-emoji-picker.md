---
'luxen-ui': minor
---

`<l-prose-editor>`: replace the emoji picker with the lightweight, framework-agnostic `emoji-picker-element` and make the picker dismiss reliably. Clicking outside the picker — including directly in the editor content — now always closes it, even on browsers where native popover light-dismiss was suppressed by the editor's own pointer handling. A new `emoji-data-source` attribute lets you serve the emoji data locally for offline or behind-auth apps instead of fetching it from a CDN.
