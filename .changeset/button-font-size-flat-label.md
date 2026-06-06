---
'luxen-ui': patch
---

Keep the button label at 14px across all sizes. Previously `data-size="lg"` and `data-size="xl"` also bumped the label to 16px/18px, so picking a taller button purely for height made the text look oversized. Now only height and padding scale with `data-size` — a taller button reads as a larger touch target, not a louder label. To opt into a larger label, override the `--font-size` custom property.
