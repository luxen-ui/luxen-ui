---
'luxen-ui': minor
---

Fix elements breaking when the prefix is renamed via `luxen.config.mjs` / the
Vite plugin's `elementPrefix` / `cssPrefix` options. `l-tree-item`'s checkbox,
`l-alert-dialog`'s built-in actions, `l-story`, `l-input-otp`, and
`l-input-stepper` emitted hardcoded `l-*` class names while their stylesheets
were rewritten to the configured prefix, so the selectors no longer matched and
those parts fell back to native/unstyled appearance. `l-form-field` looked for
`.l-hint` / `.l-error` and so never wired `aria-describedby` or the error's
`role="alert"`; `l-alert-dialog`'s loading spinner and `l-stories-viewer`'s
scroll lock referenced hardcoded tag names and silently did nothing. All of
these now derive from the configured prefix. No effect at the default `l`
prefix.

Breaking (types): `luxen-ui` no longer augments the global
`HTMLElementTagNameMap` with `'l-alert'` / `'l-slider'`. Those entries hardcoded
the default prefix and were wrong for any rebranded build. If you relied on
`document.querySelector('l-alert')` being typed as `Alert`, generate a
prefix-aware declaration file with the Vite plugin's `emitTypes` option, which
emits the entries for every element under your configured prefix.
