---
'luxen-ui': minor
---

`<l-carousel>` gains a `max-visible-dots` attribute that caps the dot count and shrinks edge dots to indicate hidden pages.

When the snap count exceeds `max-visible-dots`, a sliding window keeps the active dot in view and the dot at the side where dots are hidden is scaled down — like an iOS PageControl. Theme the shrink ratio with the new `--dot-edge-scale` CSS custom property (default `0.5`).

```html
<l-carousel
  with-dots
  max-visible-dots="7"
>
  <!-- 12 slides -->
</l-carousel>
```
