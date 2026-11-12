---
'luxen-ui': minor
---

Design tokens now live in `@layer theme`, so your own theme overrides them without depending on load order. A `:root { --l-… }` rule outside any layer wins whether it loads before or after Luxen's CSS, and so does one inside `@layer base`, `components` or `utilities`, which used to always lose. Luxen's CSS now opens with `@layer theme, base, components;`, the same order Tailwind v4 declares, so Luxen and Tailwind share one layer stack.
