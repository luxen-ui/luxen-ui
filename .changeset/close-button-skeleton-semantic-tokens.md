---
'luxen-ui': patch
---

Close buttons and skeletons now take their colors from semantic tokens (new: `--l-color-bg-loading`, `--l-color-bg-loading-shimmer`) instead of fixed grays, so they follow your theme. The square close button's hover uses the shared hover tint, which is subtler in dark mode, and its pressed state no longer disappears into a dark page. The circle close button's hover and pressed colors shift slightly.
