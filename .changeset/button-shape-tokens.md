---
'luxen-ui': minor
---

Buttons now follow two new design tokens, `--l-button-border-radius` and `--l-button-border-width`. Set them on `:root` to reshape every button, including button groups, button-style radio groups and alert-dialog actions. By default they follow the text-field tokens (`--l-form-control-border-radius` and `--l-form-control-border-width`), so a button matches the field beside it and a theme that changes `--l-radius-md` now reaches buttons too. Set `--l-button-border-radius: 0` for square buttons or `var(--l-radius-full)` for pills.

Visual change: buttons now have the text-field corner radius (6px) at every size. Before, the radius was derived from the button height (4px to 5.5px). Borders are unchanged.
