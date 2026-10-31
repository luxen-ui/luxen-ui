/*
 * Metadata sidecar for the table (CSS-only, styled via `.l-table` on a native
 * `<table>`). The JSDoc below is the single source of truth for its reference
 * docs and the generated skill, read by the `native-meta` CEM plugin and emitted
 * into dist/metadata/table.json.
 *
 * Keep this in sync with src/css/elements/table/ (_base.css + lines/grid appearances).
 */

/**
 * @summary A data table on a native `<table>`, styled from the platform's own states.
 *
 * @nativeElement table
 * @selector .l-table
 *
 * @cssClass .l-table - Applied to the `<table>`. Name it with a `<caption>` (visible or `.l-visually-hidden`) or `aria-label`; head the columns with `<th scope="col">` and each row with the `<th scope="row">` that identifies it.
 *
 * @attribute data-appearance - lines | grid — Rules between rows only (the default), or every cell drawn with an outer border and a filled header. Matches the imported appearance CSS; `grid` needs the attribute even when imported alone.
 * @attribute data-size - sm | lg — Row height, on the control size scale: a control of the same size fits a row. Defaults to the medium size.
 * @attribute data-type - number — On a column's `<th>` and `<td>`s: aligns it to the inline end with tabular figures.
 * @attribute data-sticky - start | end — On every cell of a column: keeps it at that inline edge while the table scrolls sideways.
 * @attribute data-select - On the cells holding each row's native checkbox (or radio): shrinks the column to its control, and tints the row while its input is checked.
 * @attribute data-row-link - On the link in a row's header cell: stretches it over the row, so a click anywhere in the row follows it. The row's other controls stay clickable, Luxen's custom elements included; give any other custom element `position: relative; z-index: 1`. Keep it out of a `data-sticky` cell.
 * @attribute aria-sort - ascending | descending — On the sorted column's `<th>`, which holds a `<button>` (or a link, when the server sorts): shows the direction. A disabled button marks a column the current query cannot sort by; an `.l-button` in a header is another action and keeps its own look.
 *
 * @cssproperty [--row-height=calc(var(--l-size-control-md) + 2 * var(--l-spacing-1))] - Minimum row height; content taller than it grows the row.
 * @cssproperty [--header-offset=0px] - Distance from the top of the page at which the header sticks, e.g. the height of a fixed bar above the table. Only when the page itself scrolls: inside a scroll container, keep it at 0 or the header covers the first rows.
 * @cssproperty [--background-color=var(--l-color-surface)] - Opaque background of the header and sticky columns, which cover the rows scrolling under them. Match it to the surface the table sits on.
 * @cssproperty [--border-color=var(--l-color-divider)] - Rules between rows, and between columns in the grid appearance. The stronger rules under the header and above the totals use `--l-color-border`.
 * @cssproperty [--stripe-color=transparent] - Tint of every other body row; set it to stripe the rows in any appearance, e.g. `var(--l-color-bg-state-hover)`.
 *
 * @example Basic
 * <table class="l-table">
 *   <caption>Products</caption>
 *   <thead>
 *     <tr>
 *       <th scope="col">SKU</th>
 *       <th scope="col">Name</th>
 *       <th scope="col" data-type="number">In stock</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <th scope="row">SKU-1042</th>
 *       <td>Desk lamp</td>
 *       <td data-type="number">4,210</td>
 *     </tr>
 *   </tbody>
 * </table>
 *
 * @example Sortable, selectable, linked rows
 * <table class="l-table">
 *   <caption>Products</caption>
 *   <thead>
 *     <tr>
 *       <th scope="col" data-select><span class="l-visually-hidden">Selection</span></th>
 *       <th scope="col" aria-sort="ascending"><button type="button">SKU</button></th>
 *       <th scope="col"><button type="button">Name</button></th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td data-select><input type="checkbox" class="l-checkbox" name="product" value="sku-1042" aria-label="Select SKU-1042" /></td>
 *       <th scope="row"><a href="/products/sku-1042" data-row-link>SKU-1042</a></th>
 *       <td>Desk lamp</td>
 *     </tr>
 *   </tbody>
 * </table>
 */
// JSDoc-only metadata carrier — the CEM analyzer reads the doc comment above; the
// class body is intentionally empty.
// oxlint-disable-next-line typescript/no-extraneous-class
export class TableMeta {}
