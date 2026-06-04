---
'luxen-ui': minor
---

Add `<l-dropdown-label>`, a non-interactive section label for grouping items inside `<l-dropdown>`. It pairs with `<l-divider>` to caption groups of `<l-dropdown-item>`s, and keyboard navigation, typeahead, and `Home`/`End` skip it automatically. The host carries `role="presentation"` so it never reads as a menu item, and its text color is themeable via the `--color` custom property. Import with `luxen-ui/dropdown-label`.
