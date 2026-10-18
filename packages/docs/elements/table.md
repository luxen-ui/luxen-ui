---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/table/Basic.html?raw'
import sizes from '../.vitepress/examples/table/Sizes.html?raw'
import striped from '../.vitepress/examples/table/Striped.html?raw'
import grid from '../.vitepress/examples/table/Grid.html?raw'
import sticky from '../.vitepress/examples/table/Sticky.html?raw'
import selection from '../.vitepress/examples/table/Selection.html?raw'
import rowLink from '../.vitepress/examples/table/RowLink.html?raw'
import footer from '../.vitepress/examples/table/Footer.html?raw'
import empty from '../.vitepress/examples/table/Empty.html?raw'
</script>

# Table <Badge type="tip">&lt;table&gt;</Badge>

A data table on a native `<table>`, for lists of records.

<ElementSpec element="table" />

::: code-group

```html [HTML]
<table class="l-table">
  <caption>
    Products
  </caption>
  <thead>
    <tr>
      <th scope="col">SKU</th>
      <th
        scope="col"
        data-type="number"
      >
        In stock
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">SKU-1042</th>
      <td data-type="number">4,210</td>
    </tr>
  </tbody>
</table>
```

:::

A stylesheet, no JavaScript. The states it shows are the platform's: `aria-sort` for the sorted column, a checked checkbox for a selected row, a URL fragment for the row to jump to. The same markup works in a server-rendered page and in a framework template.

## Options

### Appearance

Pick a look with `data-appearance`. Each appearance has its own CSS import; the one imported is also the default.

#### Lines

Rules between rows only. The default.

<ComponentWrapper :html="basic" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/table/lines';
```

<<< @/.vitepress/examples/table/Basic.html [HTML]

:::

#### Grid

Every cell drawn, an outer border and a filled header: for dense data read across rows and down columns.

<ComponentWrapper :html="grid" />

::: code-group

```css [CSS]
@import 'luxen-ui/css/table/grid';
```

<<< @/.vitepress/examples/table/Grid.html [HTML]

:::

### Basic

Add `class="l-table"` to a `<table>`. Name it with a `<caption>`, head each column with `<th scope="col">` and each row with the `<th scope="row">` that identifies it. Add `data-type="number"` to the cells of a numeric column, header included: it aligns to the inline end with tabular figures.

<ComponentWrapper :html="basic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Basic.html [HTML]
:::

### Sizes

Add `data-size="sm"` or `data-size="lg"`. Rows follow the control size scale, so an `.l-button` of the same `data-size` fits a row. A row is a minimum height: content taller than it grows the row.

<ComponentWrapper :html="sizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Sizes.html [HTML]
:::

### Striped

Set `--stripe-color` to a tint, e.g. `var(--l-color-bg-state-hover)`: every other row takes it, in any appearance.

<ComponentWrapper :html="striped" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Striped.html [HTML]
:::

### Sticky header and columns

The header sticks to the top of the nearest scroll container. Put `data-sticky="end"` (or `start`) on every cell of a column to keep it at that edge while the table scrolls sideways; a shadow marks content scrolling under it. Cells wrap by default; add `white-space: nowrap` to the table (`whitespace-nowrap` in Tailwind) so it scrolls sideways instead. Set `--header-offset` when a fixed bar sits above the table.

<ComponentWrapper :html="sticky" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Sticky.html [HTML]
:::

### Sortable columns

Put a `<button>` in each sortable header, and `aria-sort="ascending"` or `"descending"` on the sorted one. The stylesheet shows the state; sorting is your script's job, as in this demo. When the server sorts, use a link to the sorted URL instead of the button (`<a href="?sort=-sku">`): it takes the same look, and needs no script.

<TableSortDemo />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Sortable.html [HTML]
<<< @/.vitepress/components/TableSortDemo.vue [Vue]
:::

### Selectable rows

Put a native checkbox in a `data-select` cell at the start of each row, and name it with `aria-label`. The row is tinted while its checkbox is checked; inside a `<form>`, the checked rows submit their `value`s. A select-all checkbox in the header needs script, so this example labels the column instead.

<ComponentWrapper :html="selection" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Selection.html [HTML]
:::

### Row link

Add `data-row-link` to the link in a row's header cell: a click anywhere in the row follows it, and it stays a real link — keyboard, middle-click, open in a new tab. The row's other controls and its selection cell stay clickable. Only a linked row is tinted under the pointer, since a hover tint promises a click.

Two trade-offs: text in a linked row cannot be selected with the mouse, and the row link must stay out of a `data-sticky` cell, which would confine it to that cell.

<ComponentWrapper :html="rowLink" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/RowLink.html [HTML]
:::

### Jump to a row

Give a row an `id` and link to it with a fragment (`#row-sku-1042`). The browser scrolls it into view below the sticky header, and the row is marked.

### Totals

Put totals in a `<tfoot>`. A single rule sets them apart from the rows. Several `<tbody>` elements group rows, each group closed by a rule.

<ComponentWrapper :html="footer" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Footer.html [HTML]
:::

### Empty

Render a single row whose cell spans every column.

<ComponentWrapper :html="empty" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Empty.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Table name', Description: 'A `<caption>` (visible or `.l-visually-hidden`) or `aria-label` names the table', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 5.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.4)' },
  { Check: 'Headers', Description: 'Column headers are `<th scope=&quot;col&quot;>` and each row has a `<th scope=&quot;row&quot;>`, so a screen reader announces the column and the record with every cell', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 5.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.6), [RGAA 5.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.7)' },
  { Check: 'Sort state', Description: '`aria-sort` on the sorted `<th>` is announced with the header; the control is a native `<button>`, as in the APG sortable table example', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Selection', Description: 'Selection is a native checkbox with its own name and checked state; no `aria-selected` is needed on the row', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Row link', Description: 'The row link is a real `<a>`: listed among the page links, reachable by `Tab`, opened with `Enter`', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [WCAG 2.4.4](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context), [RGAA 6.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#6.1), [RGAA 7.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.3)' },
  { Check: 'Sort glyph', Description: 'The direction glyph of an unsorted column uses the tertiary text color, above 3:1 against the surface in both schemes', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3)' },
  { Check: 'Focus ring', Description: 'Header buttons and the row link show the Luxen focus ring', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
]" :rules="[
  'Name the table with a `&lt;caption&gt;` or `aria-label`',
  'Use `&lt;th scope=&quot;col&quot;&gt;` for column headers and `&lt;th scope=&quot;row&quot;&gt;` for the cell that identifies each row',
  'Put the sort control in a `&lt;button&gt;` (or a link, when the server sorts) inside the header, and `aria-sort` on the sorted `&lt;th&gt;` only',
  'Name every row checkbox, e.g. `aria-label=&quot;Select SKU-1042&quot;`',
  'Keep `data-row-link` out of a `data-sticky` cell',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves through the header controls, then each row’s checkbox, row link and actions' },
  { Key: 'Enter', Description: 'Activates the focused header button or follows the focused row link' },
  { Key: 'Space', Description: 'Activates the focused header button or toggles the focused checkbox' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/table/lines'; /* or table/grid */
```

:::

Selectable rows use `.l-checkbox` (`luxen-ui/css/checkbox`); row actions use `.l-button` (`luxen-ui/css/button`).

### Attributes

<ApiTable element="table" section="attributes" />

### CSS classes

<ApiTable element="table" section="cssClasses" />

### CSS custom properties

<ApiTable element="table" section="cssProperties" />
