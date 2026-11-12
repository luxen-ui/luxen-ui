---
'luxen-ui': patch
---

`l-icon` holds the room its glyph will take, a 1em square, before its script has loaded and while its icon data is on its way, so the text and controls beside it no longer shift when the glyph appears. The pre-upgrade box comes from `luxen-ui/css/base`. An icon with no name, or one whose name cannot be resolved, still takes no room.

The `hidden` attribute now hides an `l-icon`. It used to be ignored once the element had upgraded.
