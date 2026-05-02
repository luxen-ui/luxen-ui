---
'luxen-ui': patch
---

Tighten the visual chrome of `<l-dropdown>`, `<l-popover>`, and any element using `--l-color-border`:

- Lighter default `--l-color-border` — moved from `gray-400 / gray-800` to `gray-300 / gray-600`, with `--l-color-divider` shifted to `gray-200 / gray-700` to keep the hierarchy. Elements affected globally: `.l-button`, `.l-disclosure`, `.l-input-otp`, `.l-input-stepper`, `.l-tabs`, `<l-tree-item>`, `<l-popover>`, `<l-dropdown>`.
- New `--l-color-border-overlay` design token (aliases `--l-color-border` by default) so consumers can soften overlay borders — popovers, dropdowns, menus, tooltips — independently of form-control borders.
- Smaller default `--radius` / `--border-radius` on `<l-dropdown>` and `<l-popover>` (`8px` → `6px`).
- More subtle default `--shadow` on `<l-dropdown>` and `<l-popover>` (layered `0 4px 6px -1px / 0 2px 4px -2px` instead of `0 4px 16px`).
- `<l-dropdown>` panel now has `0.25rem` of padding all around (was `4px 0`), and `<l-dropdown-item>` gets a `4px` radius + denser `0.375rem 0.5rem` padding so hover states sit cleanly inside the panel.

Consumers who depended on the previous heavier `--l-color-border`, or who override `--radius` / `--shadow` / `--border-radius` on these surfaces, may see a visual difference.

Also fixes `.l-button` default (`md`) font-size: it was previously referencing `var(--text-md)`, which is not a Tailwind v4 token, so the declaration was silently ignored and the button inherited its parent's font-size (16 px in most contexts). The default now correctly resolves to 14 px via `var(--text-sm)`.
