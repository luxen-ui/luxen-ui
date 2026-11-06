---
outline: deep
---

<script setup>
import { onMounted } from 'vue'
import { titleAndDescriptionFilter } from '../.vitepress/examples/rich-option-filter.js'
import comboboxDefault from '../.vitepress/examples/combobox/ComboboxDefault.html?raw'
import comboboxClearable from '../.vitepress/examples/combobox/ComboboxClearable.html?raw'
import comboboxCustom from '../.vitepress/examples/combobox/ComboboxCustom.html?raw'
import comboboxRich from '../.vitepress/examples/combobox/ComboboxRich.html?raw'
import comboboxRichSuffix from '../.vitepress/examples/combobox/ComboboxRichSuffix.html?raw'
import comboboxDisabled from '../.vitepress/examples/combobox/ComboboxDisabled.html?raw'
import comboboxFilter from '../.vitepress/examples/combobox/ComboboxFilter.html?raw'

// `filter` is a JS property — set it for the Custom filter demo once the element is defined
// (a value set before the upgrade is overwritten by the class field).
onMounted(async () => {
  await customElements.whenDefined('l-combobox')
  const el = document.getElementById('demo-combobox-filter')
  if (el) el.filter = titleAndDescriptionFilter
})
</script>

# Combobox <Badge type="tip">&lt;l-combobox&gt;</Badge>

A text input paired with a filterable list of options — type to narrow the list, then pick a match.

<ElementSpec element="combobox" />

::: code-group

```html [HTML]
<l-combobox
  label="Country"
  name="country"
  placeholder="Search a country…"
>
  <datalist>
    <option value="us">United States</option>
    <option value="fr">France</option>
    <option value="de">Germany</option>
  </datalist>
</l-combobox>
```

:::

Options are authored as a native `<datalist>` of `<option>` — the same authoring surface as [`<select>`](/elements/select).

## Options

### Basic

Author the choices as `<option>` inside a `<datalist>`. `label` names the input; `name` submits the chosen `value`.

<ComponentWrapper :html="comboboxDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxDefault.html [HTML]
:::

### Clearable

Add `with-clear` for a button that resets the value.

<ComponentWrapper :html="comboboxClearable" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxClearable.html [HTML]
:::

### Custom values

Add `allow-custom` to accept a typed value that matches no option.

<ComponentWrapper :html="comboboxCustom" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxCustom.html [HTML]
:::

### Rich options

Put markup inside each `<option>` — the same `.l-select-item-media` / `.l-select-item-text` / `.l-select-item-title` / `.l-select-item-description` classes as [`<select>`](/elements/select). Set a `label` (or `.l-select-item-title`) so filtering and the input display use the title.

As you type, the match is highlighted inside `.l-select-item-title` and `.l-select-item-description`, with the same accent/case-insensitive matching as plain options. Only the text is wrapped in `<mark>`; the option's markup is kept as authored.

<ComponentWrapper :html="comboboxRich" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxRich.html [HTML]
:::

#### Suffix

Add a `.l-select-item-suffix` after `.l-select-item-text` to pin a badge, a count or a status icon to the end of the row, before the checkmark. It sits on the title's line, keeps its natural width while the title truncates, and is never matched by the filter or written into the input. Rich options are copied into the popover's shadow root: an [`<l-badge>`](/elements/badge) is styled there, but your page's own selectors don't reach that copy. To theme it, set the badge's CSS custom properties on the `<l-combobox>`: they inherit into the popover. Screen readers announce the suffix with its option, so write it as words ("12 members", not "12").

<ComponentWrapper :html="comboboxRichSuffix" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxRichSuffix.html [HTML]
:::

### Disabled

Native `disabled` attribute.

<ComponentWrapper :html="comboboxDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxDisabled.html [HTML]
:::

### Custom filter

By default options are matched case- and accent-insensitively (every space-separated keyword must appear). Override the `filter` property — `(item, query) => boolean` — for `startsWith`, fuzzy, or remote-driven filtering.

The default filter only reads the label (a rich option's title). To search the description too, match against the text of `item.html` — the match is then highlighted in the description as well. Try a capital or a continent:

<ComponentWrapper :html="comboboxFilter" />

::: details Code
::: code-group
<<< @/.vitepress/examples/combobox/ComboboxFilter.html [HTML]

```js [JS]
const combobox = document.querySelector('l-combobox');

// `item.html` is the rich option's markup: compare against its text, not its tags.
const textOf = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent;
};

combobox.filter = (item, query) =>
  `${item.label} ${item.html ? textOf(item.html) : ''}`
    .toLowerCase()
    .includes(query.trim().toLowerCase());
```

:::

### Match highlight

The part of each option that matches the query is wrapped in `<mark>`. Theme it with two form-control tokens, or set the `highlight` property to `false` to turn it off.

::: code-group

```css [CSS]
:root {
  --l-form-control-match-background-color: transparent;
  --l-form-control-match-font-weight: var(--l-font-weight-bold);
}
```

:::

### Dynamic options

The `<datalist>` is watched: re-labelling, adding, removing, or disabling an `<option>` after mount updates the input and the listbox immediately — no reopen, no remount. Text the user is typing is left alone.

::: code-group

```js [JS]
const option = document.querySelector('l-combobox option[value="fr"]');

// The input re-renders on its own — nothing to call, nothing to remount.
option.label = 'Français';
```

:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'The input is a `role=&quot;combobox&quot;` with `aria-expanded` / `aria-controls` / `aria-activedescendant`; options are `role=&quot;option&quot;` in a `role=&quot;listbox&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Accessible name', Description: 'Set `label` (or wrap with `<l-form-field>`)', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Focus', Description: 'Focus stays on the input; the active option is tracked via `aria-activedescendant`', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
]" :rules="[
  'Always set `label` so the input has an accessible name',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Down / Up', Description: 'Opens the list, then moves the active option' },
  { Key: 'Home / End', Description: 'Jumps to the first / last option' },
  { Key: 'Enter', Description: 'Selects the active option' },
  { Key: 'Escape', Description: 'Closes the list, or clears the value when already closed' },
  { Key: 'Tab', Description: 'Selects the active option (if any) and moves focus on' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/combobox';
```

:::

### Attributes & Properties

<ApiTable element="combobox" section="properties" />

### Events

<ApiTable element="combobox" section="events" />

### CSS parts

<ApiTable element="combobox" section="cssParts" />

### CSS classes

<ApiTable element="combobox" section="cssClasses" />

### CSS custom properties

<ApiTable element="combobox" section="cssProperties" />
