---
'luxen-ui': patch
---

An `l-icon` given `display: block` or `inline-block` (a Tailwind `block` or `hidden md:block`, for instance) no longer sits a few pixels too high in a centred row: its glyph stays centred like any other icon. The icon is now a box the size of its glyph, so `vertical-align` and sizing utilities set on `l-icon` apply to it, and a glyph in a larger box is centred in it.
