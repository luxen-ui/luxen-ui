---
'luxen-ui': minor
---

New `.l-table`, for lists of records on a native `<table>`. Name the table with a `<caption>`, head the columns with `<th scope="col">` and each row with the `<th scope="row">` that identifies it. `data-type="number"` end-aligns a column with tabular figures, `data-size="sm"` or `"lg"` picks a row height on the control size scale, and `--stripe-color` tints every other row. Totals go in a `<tfoot>`; several `<tbody>` elements group rows.

The stylesheet reads state from the markup rather than from attributes of its own. A sortable header is a `<button>` (or a link, when the server sorts) with `aria-sort` on its `<th>`. A selected row is one whose checkbox in a `data-select` cell is checked, and checked rows submit with their form. A row reached through a URL fragment is marked, below the sticky header.

The header sticks to the top of its scroll container, and `data-sticky="start"` or `"end"` keeps a column at that edge when the table scrolls sideways, with a shadow where the browser supports scroll-driven animations. `data-row-link` on the link in a row header makes the whole row open the record; the link stays a real link, and the row's other controls keep working.

Two appearances, each its own import: `luxen-ui/css/table/lines`, rules between rows (the default), and `luxen-ui/css/table/grid`, every cell drawn with an outer border and a filled header, picked with `data-appearance="grid"`.
