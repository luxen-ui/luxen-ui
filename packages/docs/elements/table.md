---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/table/Basic.html?raw'
import sizes from '../.vitepress/examples/table/Sizes.html?raw'
import sortable from '../.vitepress/examples/table/Sortable.html?raw'
</script>

# Table <Badge type="tip">&lt;table&gt;</Badge>

Tables display data in rows and columns, so it is easy to scan and compare. Commonly used for lists of records, reports, and settings.

<ElementSpec element="table" />

A stylesheet, no JavaScript. The sort state it shows is written in the markup, with `aria-sort`. The same markup works in a server-rendered page and in a framework template.

## Options

### Basic

Add `class="l-table"` to a `<table>`. Name it with a `<caption>`, head each column with `<th scope="col">` and each row with the `<th scope="row">` that identifies it. Add `data-align="end"` to the header and cells of a column of figures; digits are tabular across the table, so they line up. The header sticks to the top of its scroll container. Totals go in a `<tfoot>`, set apart by a stronger rule; several `<tbody>` elements group rows.

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

### Sortable columns

Put a `<button>` in each sortable header, and `aria-sort="ascending"` or `"descending"` on the sorted one. The stylesheet shows the state written in the markup; it does not reorder rows. When the server sorts, use a link to the sorted URL instead of the button (`<a href="?sort=-sku">`). Disable the button of a column the current query cannot sort by. Any other action in a header is an `.l-button` and keeps its own look.

<ComponentWrapper :html="sortable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/table/Sortable.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Unsorted glyph contrast passes', Description: 'The direction glyph of an unsorted column uses the tertiary text color, above 3:1 against the surface in both schemes', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3)' },
  { Check: 'Focus ring on header buttons', Description: 'Header buttons show the Luxen focus ring', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
]" :rules="[
  { Check: 'Mark up column and row headers', Description: 'Use `<th scope=&quot;col&quot;>` for column headers and `<th scope=&quot;row&quot;>` for the cell that identifies each row', Note: 'A screen reader then announces the column and the record with every cell', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 5.6](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.6), [RGAA 5.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.7)' },
  { Check: 'Name the table', Description: 'Add a `<caption>` (visible or `.l-visually-hidden`) or an `aria-label`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 5.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#5.4)' },
  { Check: 'Set `aria-sort` on the sorted `<th>` only', Note: 'It is announced with the header', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Sort with a native `<button>`', Description: 'Put it inside the header, or use a link when the server sorts', Note: 'As in the [APG sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves through the header controls, then the controls in each row' },
  { Key: 'Enter', Description: 'Activates the focused header button' },
  { Key: 'Space', Description: 'Activates the focused header button' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/table';
```

:::

### Attributes & Properties

<ApiTable element="table" section="attributes" />

### CSS classes

<ApiTable element="table" section="cssClasses" />

### CSS custom properties

<ApiTable element="table" section="cssProperties" />
