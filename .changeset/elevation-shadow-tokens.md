---
'luxen-ui': minor
---

Add a semantic elevation scale to the shipped token layer — `--l-shadow-sm`, `--l-shadow-md`, `--l-shadow-lg` — whose shadow color uses `light-dark()` so it deepens in dark mode, where a faint black cast would otherwise disappear. `<l-popover>`, `<l-dropdown>`, and `<l-drawer>` now default their `--shadow` to these tokens, so their shadows stay visible on dark surfaces.
