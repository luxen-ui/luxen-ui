---
'luxen-ui': minor
---

Add `<l-combobox>`, a searchable text input paired with a filterable list of options (the ARIA combobox pattern). Options are authored as a native `<datalist>` of `<option>` — the same authoring surface as `<select>`. It's a form-associated custom element (submits the chosen `value` under `name`), with client-side filtering (overridable via the `filter` property), match highlighting, full keyboard support (Up/Down, Home/End, Enter, Escape, Tab) on the `aria-activedescendant` model, `with-clear` and `allow-custom` options, size variants (`xs`–`xl`), and a shadcn-style look. Emits typed `change` and `input` events and exposes the `base`, `control`, `input`, `panel`, `listbox` and `option` CSS parts.
