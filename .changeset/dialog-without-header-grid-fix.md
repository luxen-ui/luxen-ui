---
'luxen-ui': patch
---

Fix `<l-dialog without-header>` (and `<l-drawer without-header>`) layout where the body lost its scrollable behavior and the footer stretched to fill the available height. The grid now pins the body to the flexible row and the footer to the bottom regardless of whether the header is rendered.
