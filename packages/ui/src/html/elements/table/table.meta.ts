/*
 * Metadata sidecar for the table (CSS-only, styled via `.l-table` on a native
 * `<table>`). The JSDoc below is the single source of truth for its reference
 * docs and the generated skill, read by the `native-meta` CEM plugin and emitted
 * into dist/metadata/table.json.
 *
 * Keep this in sync with src/css/elements/table.css.
 */

/**
 * @summary Tables display data in rows and columns, so it is easy to scan and compare.
 *
 * @nativeElement table
 * @selector .l-table
 *
 * @cssClass .l-table - Applied to the `<table>`. Name it with a `<caption>` (visible or `.l-visually-hidden`) or `aria-label`; head the columns with `<th scope="col">` and each row with the `<th scope="row">` that identifies it.
 *
 * @attribute data-size - sm | lg — Row height, on the control size scale: a control of the same size fits a row. Defaults to the medium size.
 * @attribute data-align - start | center | end — On a column's `<th>` and `<td>`s: aligns the column. Use `end` for figures; digits are tabular across the table, so they line up. A sort button in an `end` header puts its glyph before the label, keeping the label flush with the figures.
 * @attribute aria-sort - ascending | descending — On the sorted column's `<th>`, which holds a `<button>` (or a link, when the server sorts): shows the direction. A disabled button marks a column the current query cannot sort by; an `.l-button` in a header is another action and keeps its own look.
 *
 * @cssproperty [--row-height=calc(var(--l-size-control-md) + 2 * var(--l-spacing-1))] - Minimum row height; content taller than it grows the row.
 * @cssproperty [--background-color=var(--l-color-surface)] - Background of the table. The sticky header repeats it, so it stays opaque over the rows scrolling under it.
 * @cssproperty [--border-color=var(--l-color-divider)] - Rules between rows. The stronger rules under the header and above the totals use `--l-color-border`.
 *
 * @example Basic
 * <table class="l-table">
 *   <caption>Products</caption>
 *   <thead>
 *     <tr>
 *       <th scope="col">SKU</th>
 *       <th scope="col">Name</th>
 *       <th scope="col" data-align="end">In stock</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th scope="row">SKU-1042</th>
 *       <td>Desk lamp</td>
 *       <td data-align="end">4,210</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * @example Sortable
 * <table class="l-table">
 *   <caption>Products</caption>
 *   <thead>
 *     <tr>
 *       <th scope="col" aria-sort="ascending"><button type="button">SKU</button></th>
 *       <th scope="col"><button type="button">Name</button></th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th scope="row">SKU-1042</th>
 *       <td>Desk lamp</td>
 *     </tr>
 *   </tbody>
 * </table>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class TableMeta {}
