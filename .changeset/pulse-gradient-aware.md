---
'luxen-ui': minor
---

`<l-story>` `pulse` halo now uses the ring's paint by default — including gradient and image rings — so the attention pulse always feels of-a-piece with the thumbnail it surrounds. Override `--pulse-color` with any `background` value (solid color, `linear-gradient`, `conic-gradient`, image) to decouple the halo from the ring.

**Breaking**: the `--pulse-spread` custom property (px-based shadow distance) has been replaced by `--pulse-scale` (unitless transform multiplier, default `1.2`). If you set `--pulse-spread`, switch to `--pulse-scale` — roughly `1 + (spread × 2 / size)` for the equivalent visual reach.
