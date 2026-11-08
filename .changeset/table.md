---
'luxen-ui': minor
---

New `.l-table`, for lists of records on a native `<table>` (`luxen-ui/css/table`). Name the table with a `<caption>`, head the columns with `<th scope="col">` and each row with the `<th scope="row">` that identifies it. `data-align="end"` (or `center`) aligns a column, and digits are tabular so figures line up, and `data-size="sm"` or `"lg"` picks a row height on the control size scale. The header sticks to the top of its scroll container. Totals go in a `<tfoot>`; several `<tbody>` elements group rows.

The stylesheet reads state from the markup rather than from attributes of its own. A sortable header is a `<button>` (or a link, when the server sorts) with `aria-sort` on its `<th>`.
