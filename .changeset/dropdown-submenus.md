---
'luxen-ui': minor
---

`<l-dropdown>` now supports nested submenus. Nest `<l-dropdown-item slot="submenu">` elements inside an item to create a submenu at any depth — the parent item shows a chevron and opens its panel on hover, click, Enter or ArrowRight (ArrowLeft/Escape close one level at a time). Selecting a nested item fires the usual `select` event on the dropdown and closes the whole menu; checkbox items keep it open. Parent items expose `aria-haspopup="menu"`/`aria-expanded`, and submenu panels follow the dropdown's existing theming custom properties (`--background`, `--padding`, `--border-radius`, `--shadow`).
