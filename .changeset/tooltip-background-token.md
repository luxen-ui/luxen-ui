---
'luxen-ui': minor
---

Add a dedicated `--l-tooltip-background-color` token for `<l-tooltip>` and stop the tooltip from borrowing the brand fill. Previously the tooltip's background defaulted to `--l-color-bg-fill-brand` — the same token as primary buttons — so re-theming the brand color (e.g. a green primary button) unintentionally recolored every tooltip. Tooltips now read a neutral inverse surface token instead; the default appearance is unchanged, and you can override `--l-tooltip-background-color` globally to re-skin all tooltips or `--background-color` per instance.
