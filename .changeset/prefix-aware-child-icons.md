---
'luxen-ui': patch
---

Internal icons and spinners now render correctly under a custom `elementPrefix`. Elements that draw a child custom element inside their own template (`prose-editor`, `stories-viewer`, `story`, `input-stepper`) previously hardcoded the default `l-icon`/`l-spinner` tags, which were never defined under a non-default prefix — so toolbar buttons and story controls rendered empty for consumers running luxen-ui under their own namespace. Child tags are now resolved through the active prefix.
