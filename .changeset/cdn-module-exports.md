---
'luxen-ui': patch
---

The per-module CDN files under `luxen-ui/cdn/` export again what their source exports. The build had dropped every export that no other CDN file imported, so `import { toast } from 'https://cdn.jsdelivr.net/npm/luxen-ui/cdn/elements/toast/index.js'` failed to load, and `cdn/index.js` exported nothing at all: `setPrefix`, `getPrefix`, `define`, `colorScheme`, the event classes (`ShowEvent`, `HideEvent`…) and the element classes from each `elements/<name>/index.js` were all missing. Pages that only load a file to register its element were not affected.
