---
'luxen-ui': minor
---

Improve color contrast and align CSS custom property naming on `<l-avatar>`, `<l-tooltip>`, `<l-dropdown>` and `<select class="l-select">`:

- `<l-avatar>` text color now derives from the actual background luminance — fixes unreadable text in dark mode when `--color` is a light pastel.
- `<l-tooltip>` text color is now auto-derived from `--background-color` for any custom background. Set `--text-color` to override.
- Renamed `<l-tooltip>` `--background` → `--background-color`. Removed `--color` (replaced by the optional `--text-color` override).
- Renamed `--radius` → `--border-radius` on `<l-tooltip>`, `<l-dropdown>` and `<select class="l-select">` to align with the rest of the design system.

Migration:

- `style="--radius: …"` → `style="--border-radius: …"` on tooltip/dropdown/select.
- `style="--background: …"` → `style="--background-color: …"` on tooltip.
- `style="--color: …"` on tooltip → `style="--text-color: …"` (or remove it and let the auto-derivation handle contrast).
