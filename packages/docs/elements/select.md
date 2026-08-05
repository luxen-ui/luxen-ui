---
outline: deep
---

<script setup>
import selectNative from '../.vitepress/examples/select/Select.html?raw'
import selectNativeRich from '../.vitepress/examples/select/SelectRichOptions.html?raw'
import selectSearchable from '../.vitepress/examples/select/SelectSearchable.html?raw'
import selectMultiple from '../.vitepress/examples/select/SelectMultiple.html?raw'
import selectRich from '../.vitepress/examples/select/SelectRich.html?raw'
</script>

# Select <Badge type="tip">&lt;l-select&gt;</Badge>

Build a select two ways. For a simple single select, style a native `<select>` with `class="l-select"` — zero-JS and the recommended default. For in-popover search, multi-select with chips, or async options, reach for the `<l-select>` custom element.

<ElementSpec
  tag="select"
  type="native"
/>

::: code-group

```html [HTML]
<select class="l-select">
  <option>France</option>
  <option>Germany</option>
</select>
```

:::

## Basic

Add `class="l-select"` to a native `<select>` — its `<option>`s are styled automatically. Built on the [Customizable Select API](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select) (`appearance: base-select`), degrading to a native `<select>` where unsupported — so always keep meaningful text in each `<option>`.

<ComponentWrapper :html="selectNative" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/Select.html [HTML]
:::

### Disabled

Native `disabled` attribute, on the `<select>` for the whole control or on an individual `<option>`. To disable a group of fields at once, wrap them in `<fieldset disabled>` — see [Form field](./form-field.md#disabled-group).

```html
<select
  class="l-select"
  disabled
>
  <option>France</option>
  <option disabled>Germany</option>
</select>
```

### Rich options

Put markup inside each `<option>` — wrap a `.l-select-item-title` over a `.l-select-item-description` in `.l-select-item-text` (add a `.l-select-item-media` image or icon before it). A `<button><selectedcontent></button>` trigger mirrors the chosen option.

<ComponentWrapper :html="selectNativeRich" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectRichOptions.html [HTML]
:::

## Enhanced: `<l-select>`

When the native tier isn't enough, the `<l-select>` custom element adds in-popover search, multi-select with removable chips, and async options. It needs its JS module (`import 'luxen-ui/select'`). Options are authored as a native `<datalist>` of `<option>` — the same surface as [`<l-combobox>`](/elements/combobox) — with `<option selected>` for pre-selection.

<ElementSpec element="select" />

### Searchable

Add `searchable` for a filter box inside the popover — useful for long lists. Matching is accent/case-insensitive.

<ComponentWrapper :html="selectSearchable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectSearchable.html [HTML]
:::

### Multiple

Add `multiple` to select several values. The trigger shows a removable [`<l-tag>`](/elements/tag) chip per value and the form submits one entry per value under `name`.

<ComponentWrapper :html="selectMultiple" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectMultiple.html [HTML]
:::

### Rich options

The same `.l-select-item-*` classes as the native tier work inside each `<option>`. Set a `label` (or `.l-select-item-title`) so filtering and the trigger display use the title.

<ComponentWrapper :html="selectRich" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectRich.html [HTML]
:::

### Clearable

Add `with-clear` for a button that resets the value.

### Custom filter

Options are matched case- and accent-insensitively (every space-separated keyword must appear). Override the `filter` property — `(item, query) => boolean` — for `startsWith`, fuzzy, or remote-driven filtering.

::: code-group

```js [JS]
const select = document.querySelector('l-select');

// Match from the start of the label instead of anywhere in it.
select.filter = (item, query) => item.label.toLowerCase().startsWith(query.toLowerCase());
```

:::

## Accessibility

The native tier inherits the platform's `<select>` semantics — pair it with a `<label>`. The criteria below cover the `<l-select>` custom element.

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'The trigger exposes `aria-haspopup=&quot;listbox&quot;` / `aria-expanded` / `aria-controls`; options are `role=&quot;option&quot;` in a `role=&quot;listbox&quot;` (with `aria-multiselectable` when `multiple`)', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Set `label` (or wrap with `<l-form-field>`)', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus management', Description: 'Opening moves focus into the search box (or the listbox when not searchable); closing returns it to the trigger', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [RGAA 12.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.8)' },
  { Check: 'Target size', Description: 'The trigger and chip remove buttons keep a minimum 24×24px hit target', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [RGAA 13.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.10)' },
]" :rules="[
  'Always set `label` so the trigger has an accessible name',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter / Space / ArrowDown', Description: 'Opens the listbox (focus moves to the search box when searchable, else the list)' },
  { Key: 'ArrowDown / ArrowUp', Description: 'Moves the active option' },
  { Key: 'Enter', Description: 'Selects the active option (single) or toggles it (multiple)' },
  { Key: 'Escape', Description: 'Closes the listbox and returns focus to the trigger' },
  { Key: 'Backspace / Delete', Description: 'Removes a focused chip (multiple)' },
]" />

## API reference

The native tier ships its styles via `luxen-ui/css/select`; the reference below is for the `<l-select>` custom element.

### Importing

::: code-group

```js [JS]
import 'luxen-ui/select';
```

```css [CSS — native tier]
@import 'luxen-ui/css/select';
```

:::

### Attributes & Properties

<ApiTable element="select" section="properties" />

### Events

<ApiTable element="select" section="events" />

### CSS parts

<ApiTable element="select" section="cssParts" />

### CSS custom properties

<ApiTable element="select" section="cssProperties" />
