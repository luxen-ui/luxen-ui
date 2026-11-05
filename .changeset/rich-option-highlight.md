---
'luxen-ui': minor
---

Highlight the search query inside rich options of `<l-combobox>` and searchable `<l-select>`. The match is now wrapped in `<mark>` within `.l-select-item-title` and `.l-select-item-description`, with the same accent/case-insensitive matching as plain options. Setting `highlight` to `false` on `<l-combobox>` now turns it off for rich options too.

The match is themable through two new form-control tokens, `--l-form-control-match-background-color` and `--l-form-control-match-font-weight`. It now shows a soft tinted background by default, in addition to the semibold weight; set `--l-form-control-match-background-color: transparent` to keep the previous look.
