---
'luxen-ui': minor
---

New `luxen-ui/css/tokens/components` entry with every component token (`--l-button-*`, `--l-popover-*`, `--l-menu-item-*`, `--l-tooltip-*`, `--l-form-control-*`). `luxen-ui/css/tokens` is now exactly `tokens/primitives` + `tokens/aliases` + `tokens/components`, so you can split it without losing tokens. **Breaking:** `luxen-ui/css/tokens/forms` is removed; import `luxen-ui/css/tokens/components` instead (or keep `luxen-ui/css/tokens`).
