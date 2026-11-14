---
'luxen-ui': patch
---

`npx luxen-ui import design-tokens` now tells you to load the copied file right after `luxen-ui/css/preset`. The previous instructions swapped the preset for `base` + `tokens/primitives` + the copy. That set dropped the component tokens, so buttons, popovers, menus, tooltips and form controls lost their `--l-button-*`, `--l-popover-*`, `--l-menu-item-*`, `--l-tooltip-*` and `--l-form-control-*` values. If you followed the old steps, put `@import 'luxen-ui/css/preset';` back above your copy. Both files declare the aliases in `@layer theme`, so your copy still wins.
