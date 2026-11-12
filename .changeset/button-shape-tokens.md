---
'luxen-ui': minor
---

Buttons now follow two new design tokens: `--l-button-border-radius` and `--l-button-border-width`. Set them on `:root` to restyle every button, including button groups, button-style radio groups and alert-dialog actions, with no button-specific CSS. `--l-button-border-radius: 0` gives square corners, `var(--l-radius-md)` matches the text fields, and `var(--l-radius-full)` makes pills. Leaving it unset keeps today's radius, which scales with the button's height. `--l-button-border-width` follows `--l-form-control-border-width` by default. The default look is unchanged.
