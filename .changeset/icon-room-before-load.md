---
'luxen-ui': patch
---

`l-icon` holds the room its glyph will take, a 1em square, before its script has loaded and while its icon data is on its way, so the text and controls beside it no longer shift when the glyph appears. The pre-upgrade box comes from `luxen-ui/css/base`. An icon whose name cannot be resolved still collapses to nothing.
