---
'luxen-ui': minor
---

`<l-input-otp>` exposes a public CSS custom property API for cell theming: `--cell-size`, `--cell-gap`, `--cell-bg-color`, `--cell-border-color`, `--cell-border-radius`, `--cell-focus-color`, and `--cell-focus-ring` (full `box-shadow` of the active cell ring — set to `none` to disable). The `:not(:defined)` fallback now reserves the exact box the cells will occupy with a single soft-tinted rectangle, scales correctly with `--digits`, and inherits any custom theme. Renames `--size` → `--cell-size` and `--gap` → `--cell-gap` for naming consistency with the rest of the new API.
