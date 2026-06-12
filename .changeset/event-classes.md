---
'luxen-ui': minor
---

Events are now typed `Event` subclasses with direct payload properties instead of `CustomEvent` with a `detail` object. This is a breaking change for event consumers:

- Read payloads from the event itself (`event.index`, `event.toast`, `event.selection`…) instead of `event.detail.*`.
- Most events no longer bubble and are no longer `composed` — listen on the element itself rather than relying on delegation or shadow-DOM crossing. `change`/`select` still bubble (matching native `change`) but are not composed.
- `show` is now cancelable on `l-dialog`, `l-drawer` and `l-stories-viewer` (it already was on dropdown/toast/sticky-bar) — `event.preventDefault()` keeps the element closed.
- The internal `l-tree-item-toggle` event was renamed to `selection-toggle` (private contract between `l-tree-item` and `l-tree`; consumers should listen for `selection-change` on `l-tree`).

New: event classes are exported (e.g. `import { HideEvent } from 'luxen-ui/events'`, or per-element classes like `TabsChangeEvent`) so you can narrow with `instanceof`, and direct `addEventListener` on an element is typed for its events.
