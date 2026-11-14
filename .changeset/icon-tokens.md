---
'luxen-ui': minor
---

New `--l-icon-*` design tokens define the system icons every element draws: `--l-icon-chevron-down`, `--l-icon-chevron-right`, `--l-icon-check`, `--l-icon-close`, `--l-icon-clear`, `--l-icon-increment` and `--l-icon-decrement`. Override one on `:root` to re-skin it library-wide, shadow-DOM elements included — for instance to match your own icon set:

```css
:root {
  --l-icon-chevron-down: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 9h12l-6 7z'/></svg>");
}
```

The Design Tokens page shows which element draws which token. The per-element properties (`--caret-icon` on `.l-select`, `--chevron-icon` and `--clear-icon` on `l-select` and `l-combobox`) still work and now default to these tokens.

All elements now draw the same stroked icon set. The `l-disclosure` markers, the native `.l-select` caret and the `.l-close` cross switch from filled icons to stroked ones. The check marks of `l-select` and `l-combobox` are slightly thinner. The search clear of `.l-input` draws the same plain cross as `l-select` and `l-combobox`, instead of a circled one. The `l-dropdown-item` check and submenu chevron and the `l-tree-item` chevrons are redrawn the same way. The collapsed `l-tree-item` chevron now points to the inline end in right-to-left layouts.

`l-input-stepper` draws its buttons from `--l-icon-decrement` and `--l-icon-increment` too: they show at once, with no request to the Iconify API, and no longer stay empty when `l-icon` is not imported. **Breaking:** the `decrement-icon` and `increment-icon` attributes are removed. Set the `--decrement-icon` and `--increment-icon` CSS custom properties instead, with a `url()`:

```css
l-input-stepper {
  --decrement-icon: url('/icons/arrow-down.svg');
}
```
