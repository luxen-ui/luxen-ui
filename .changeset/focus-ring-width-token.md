---
'luxen-ui': minor
---

Added the `--l-focus-ring-width` token (default `2px`): the thickness of the `:focus-visible` ring around buttons, checkboxes, radios, switches, tabs, segmented controls, tags, menu and tree items, disclosures, close buttons, avatars, breadcrumb links and the toolbar and adornment buttons. Rings drawn inside their element grow inward with it, so they are never clipped. Text fields keep their own `--l-form-control-focus-border-width`, which you can point at `--l-focus-ring-width` for one focus thickness everywhere. The default focus look is unchanged.
