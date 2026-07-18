---
outline: deep
---

<script setup>
import basic from '../.vitepress/examples/segmented-control/Basic.html?raw'
import icons from '../.vitepress/examples/segmented-control/Icons.html?raw'
import iconOnly from '../.vitepress/examples/segmented-control/IconOnly.html?raw'
import sizes from '../.vitepress/examples/segmented-control/Sizes.html?raw'
import fullWidth from '../.vitepress/examples/segmented-control/FullWidth.html?raw'
import form from '../.vitepress/examples/segmented-control/Form.html?raw'
import toolbar from '../.vitepress/examples/segmented-control/Toolbar.html?raw'
</script>

# Segmented control <Badge type="tip">&lt;l-segmented-control&gt;</Badge>

A single-select switch between a few mutually-exclusive options, with a sliding pill behind the selected segment.

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

### Form field

It is form-associated: add `name` and the selected `value` is submitted with the form, like a native radio group. Reset restores the initial selection, and `disabled` opts the control out of submission.

<ComponentWrapper :html="form" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Form.html [HTML]
:::

## Examples

### With icons

Place an `<l-icon>` before the label inside a segment.

<ComponentWrapper :html="icons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/Icons.html [HTML]
:::

### Icon-only

A segment with no text is squared automatically. Give each one an `aria-label`.

<ComponentWrapper :html="iconOnly" />

::: details Code
::: code-group
<<< @/.vitepress/examples/segmented-control/IconOnly.html [HTML]
:::

### Filter toolbar

Segmented controls line up with `.l-button` triggers and `l-select` at the same `size`, so a filter bar stays visually consistent. Here the dropdowns take a quiet neutral fill (`bg-fill-neutral-subtle`) so the chrome recedes and the active selections carry the emphasis.

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
