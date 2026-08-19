---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/segmented-control/Basic.html?raw'
import icons from '../.vitepress/examples/segmented-control/Icons.html?raw'
import sizes from '../.vitepress/examples/segmented-control/Sizes.html?raw'
import fullWidth from '../.vitepress/examples/segmented-control/FullWidth.html?raw'
import toolbar from '../.vitepress/examples/segmented-control/Toolbar.html?raw'
</script>

# Segmented control <Badge type="tip">&lt;l-segmented-control&gt;</Badge>

A hybrid between a button group, radio buttons, and tabs: pick one of a few closely related options or views, and **the selection applies immediately**. A sliding pill marks the active segment.

<ElementSpec element="segmented-control" />

::: code-group

```html [HTML]
<l-segmented-control
  label="View"
  value="list"
>
  <button value="list">List</button>
  <button value="board">Board</button>
  <button value="calendar">Calendar</button>
</l-segmented-control>
```

:::

Each segment is a native `<button>`. Set `value` on the control to the `value` of the initially-selected segment; the control emits a `change` event with the new `value` when the selection changes.

The immediate effect is the point: act on `change` and switch the view or re-run the query right away. For a value the user confirms later by submitting a form, native radios (`.l-radio`) are the lighter choice — the platform already gives them arrow-key selection, submission, reset and validation.

## Options

### Label

Add `label` to give the control an accessible name announced by screen readers.

<ComponentWrapper :html="basic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Basic.html [HTML]
:::

### Sizes

Add `size` (`sm`, `lg`, `xl`) to align the control with buttons and form controls of the same size. Defaults to `md`.

<ComponentWrapper :html="sizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Sizes.html [HTML]
:::

### Full width

Add `full-width` to stretch the segments to fill the container.

<ComponentWrapper :html="fullWidth" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/FullWidth.html [HTML]
:::

## Examples

### With icons

Place an `<l-icon>` before the label inside a segment. A segment with no text at all is squared automatically — give each one an `aria-label`.

<ComponentWrapper :html="icons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Icons.html [HTML]
:::

### Filter toolbar

Several controls can share one filter bar. Give each its own `label` so assistive tech announces which filter a segment belongs to, and keep them at the same `size` so the bar stays even. A segment can hold any inline content — here a colour swatch before the label.

<ComponentWrapper :html="toolbar" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Toolbar.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Host gets `role=&quot;radiogroup&quot;`; each segment gets `role=&quot;radio&quot;` with `aria-checked`', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.3)' },
  { Check: 'Accessible name', Description: '`label` sets `aria-label` so assistive tech announces the control purpose', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Keyboard', Description: 'Arrow keys move selection through the segments; `Home`/`End` jump to the ends', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 7.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.3)' },
  { Check: 'Focus order', Description: 'Roving `tabindex`: the group is a single `Tab` stop, arrows move within it', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 12.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.8)' },
  { Check: 'Icon-only segments', Description: 'A segment with no visible text needs its own `aria-label`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
]" :rules="[
  'Always add a `label` describing the control purpose',
  'Segments must be native `&lt;button&gt;` elements with a `value`',
  'Give each icon-only segment its own `aria-label`',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus into the control (to the selected segment)' },
  { Key: 'ArrowRight', Description: 'Selects and focuses the next segment, wrapping' },
  { Key: 'ArrowLeft', Description: 'Selects and focuses the previous segment, wrapping' },
  { Key: 'ArrowDown', Description: 'Same as ArrowRight' },
  { Key: 'ArrowUp', Description: 'Same as ArrowLeft' },
  { Key: 'Home', Description: 'Selects and focuses the first segment' },
  { Key: 'End', Description: 'Selects and focuses the last segment' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/segmented-control';
```

```css [CSS]
@import 'luxen-ui/css/segmented-control';
```

:::

### Attributes & Properties

<ApiTable element="segmented-control" section="properties" />

### Events

<ApiTable element="segmented-control" section="events" />

### CSS custom properties

<ApiTable element="segmented-control" section="cssProperties" />
