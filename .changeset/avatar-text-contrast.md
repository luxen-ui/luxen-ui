---
'luxen-ui': minor
---

Fix `<l-avatar>` initials/icon contrast on saturated `--color` values. The text color (black or white) is now chosen from the background's luminance instead of its hue, so initials stay legible on vivid brand reds, greens, and blues — not just pastels. Browsers with the Baseline `contrast-color()` function get the guaranteed-contrast choice natively; older browsers use a luminance-based fallback. New `--text-color` CSS custom property and `base` CSS part let consumers override the auto-derived text color when a brand mandates a specific one. The default corner radius is also slightly reduced.
