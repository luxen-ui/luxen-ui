---
'luxen-ui': minor
---

Design tokens now live in `@layer theme`, so your own theme overrides them without depending on load order. A `:root { --l-… }` rule outside any layer wins whether it loads before or after Luxen's CSS. One inside `@layer base`, `components` or `utilities`, which used to always lose, now wins too, as long as Luxen's or Tailwind's CSS loads before it: the first stylesheet to name a layer fixes its place. Every Luxen stylesheet, element skins included, now opens with `@layer theme, base, components;`, the same order Tailwind v4 declares, so Luxen and Tailwind share one layer stack, and importing an element skin before the preset no longer lets base styles outrank it.
