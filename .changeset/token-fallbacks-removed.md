---
'luxen-ui': patch
---

Element styles now reference design tokens without hardcoded fallback values (the tokens stylesheet is a required dependency). This also fixes the dropdown and popover panel backgrounds, which referenced a non-existent `--l-color-bg-surface` token and silently rendered with the browser `Canvas` color instead of `--l-color-surface-overlay` — they now match other overlays (dialog, toast), most visibly in dark mode.
