---
'luxen-ui': patch
---

`npx luxen-ui import` now creates missing folders in the destination path (e.g. `src/styles/tokens.css`) instead of crashing, and its next steps for `design-tokens` name the file you actually wrote rather than the default `./luxen-design-tokens.css`. `npx luxen-ui import --help` now prints the usage, which lists each file's source in the package next to the path it is copied to.
