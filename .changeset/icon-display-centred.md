---
'luxen-ui': patch
---

An `l-icon` given `display: block` or `inline-block` (a Tailwind `block` or `hidden md:block`, for instance) no longer sits a few pixels too high in a centred row: its glyph stays centred like any other icon.

The icon is now a box the size of its glyph instead of `display: contents`. Margin, padding, border, background, `vertical-align` and sizing set on `l-icon` now apply to it, where they were ignored before: check icons that carry a margin class (`mr-2`) next to a `gap`, as the spacing adds up. To centre an icon in a larger box, make it `flex` (`flex size-6`): a `block` one is centred vertically only. Don't set `inline` or `contents` on an icon inside running text: it breaks the line.
