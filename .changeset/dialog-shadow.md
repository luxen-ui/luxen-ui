---
'luxen-ui': patch
---

`l-dialog` and `l-alert-dialog` gain a `--shadow` custom property for a drop shadow on the panel. The default stays `none`, so nothing changes until you set it. Use it when the backdrop is light: the panel edge would otherwise fade into the page. In forced-colors mode, which drops every shadow, dialogs and drawers now draw a 1px system-color outline so the panel keeps a visible edge. The reference metadata of `l-drawer` and `l-alert-dialog` now reports their own defaults (`--shadow`, `--border-radius`, `--show-duration`, `--backdrop`, `--backdrop-blur`) instead of the dialog's.
