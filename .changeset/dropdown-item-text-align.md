---
'luxen-ui': patch
---

`<l-dropdown-item>` labels now stay left-aligned regardless of the surrounding `text-align`. Previously, placing a dropdown inside a right-aligned container (such as an actions column in a data grid) pushed each menu item's text to the right, away from its prefix icon. The item's internal layout is now pinned to `text-align: start`.
