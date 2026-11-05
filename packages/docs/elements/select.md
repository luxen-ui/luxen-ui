---
outline: deep
---

<script setup>
import { onMounted } from 'vue'
import { titleAndDescriptionFilter } from '../.vitepress/examples/rich-option-filter.js'
import selectNative from '../.vitepress/examples/select/Select.html?raw'
import selectNativeRich from '../.vitepress/examples/select/SelectRichOptions.html?raw'
import selectSearchable from '../.vitepress/examples/select/SelectSearchable.html?raw'
import selectMultiple from '../.vitepress/examples/select/SelectMultiple.html?raw'
import selectRich from '../.vitepress/examples/select/SelectRich.html?raw'
import selectFilter from '../.vitepress/examples/select/SelectFilter.html?raw'
import selectNativeRichSuffix from '../.vitepress/examples/select/SelectRichSuffix.html?raw'
import selectRichSuffix from '../.vitepress/examples/select/SelectRichSuffixEnhanced.html?raw'

// `filter` is a JS property — set it for the Custom filter demo once the element is defined
// (a value set before the upgrade is overwritten by the class field).
onMounted(async () => {
  await customElements.whenDefined('l-select')
  const el = document.getElementById('demo-select-filter')
  if (el) el.filter = titleAndDescriptionFilter
})
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

### Suffix

Add a `.l-select-item-suffix` after `.l-select-item-text` to pin a badge, a count or a status icon to the end of the row. It keeps its natural width while the text column gives way, and a long title truncates with an ellipsis. Like the description, the suffix stays in the picker: `<selectedcontent>` mirrors only the media and the title into the trigger.

Don't add a `label` attribute to native options: a labelled option paints its label instead of its rich children.

<ComponentWrapper :html="selectNativeRichSuffix" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectRichSuffix.html [HTML]
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

With `searchable`, the query is highlighted inside `.l-select-item-title` and `.l-select-item-description`, the same way as plain options. Only the text is wrapped in `<mark>`; the option's markup is kept as authored.

<ComponentWrapper :html="selectRich" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectRich.html [HTML]
:::

The [`.l-select-item-suffix`](#suffix) works the same way. Here too it stays out of the trigger, and an [`<l-badge>`](/elements/badge) inside it keeps its look in the popover. Keep the `label` (or `.l-select-item-title`) so the suffix text never leaks into filtering or the trigger.

<ComponentWrapper :html="selectRichSuffix" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectRichSuffixEnhanced.html [HTML]
:::

### Clearable

Add `with-clear` for a button that resets the value.

### Custom filter

Options are matched case- and accent-insensitively (every space-separated keyword must appear). Override the `filter` property — `(item, query) => boolean` — for `startsWith`, fuzzy, or remote-driven filtering.

The default filter only reads the label (a rich option's title). To search the description too, match against the text of `item.html` — the match is then highlighted in the description as well. Try a capital or a continent:

<ComponentWrapper :html="selectFilter" />

::: details Code
::: code-group
<<< @/.vitepress/examples/select/SelectFilter.html [HTML]

```js [JS]
const select = document.querySelector('l-select');

// `item.html` is the rich option's markup: compare against its text, not its tags.
const textOf = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent;
};

select.filter = (item, query) =>
  `${item.label} ${item.html ? textOf(item.html) : ''}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
```

:::

### Match highlight

With `searchable`, the part of each option that matches the query is wrapped in `<mark>`. Theme it with two form-control tokens.

::: code-group

```css [CSS]
:root {
  --l-form-control-match-background-color: transparent;
  --l-form-control-match-font-weight: var(--l-font-weight-bold);
}
```

:::

### Dynamic options

The `<datalist>` is watched: re-labelling, adding, removing, or disabling an `<option>` after mount updates the trigger and the listbox immediately — no reopen, no remount. Framework re-renders patch the existing `<option>` nodes in place, so a localized picker re-labels itself when the interface language changes.

::: code-group

```js [JS]
const option = document.querySelector('l-select option[value="fr"]');

// The closed trigger re-renders on its own — nothing to call, nothing to remount.
option.label = 'Français';
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
