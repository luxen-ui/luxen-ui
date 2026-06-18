---
'luxen-ui': minor
---

Add `<l-alert>`, a contextual callout that highlights an inline message with a semantic color and a leading icon. It supports `info` / `success` / `warning` / `danger` variants (each with a default icon), an `icon` override or `no-icon` to control the glyph, and a `dismissible` attribute that adds a close button emitting cancelable `hide` / `after-hide` events. Authored content (an optional `.l-alert-title` plus body) stacks automatically, and the whole callout adapts to dark mode through the design tokens.
