---
outline: deep
---

<script setup>
import tagDefault from '../.vitepress/examples/tag/TagDefault.html?raw'
import tagSizes from '../.vitepress/examples/tag/TagSizes.html?raw'
import tagPrefix from '../.vitepress/examples/tag/TagPrefix.html?raw'
import tagDisabled from '../.vitepress/examples/tag/TagDisabled.html?raw'
</script>

# Tag <Badge type="tip">&lt;l-tag&gt;</Badge>

Tags are compact chips for tokens, filters, and selected values, with an optional remove button.

::: code-group

```html [HTML]
<l-tag removable>Design</l-tag>
```

:::

<ElementSpec element="tag" />

## Options

### Removable

Add `removable` for a × button. The user can also press `Backspace` or `Delete` while it is focused. Each removal fires a cancelable `remove` event; if nothing calls `preventDefault()`, the tag removes itself from the DOM.

<ComponentWrapper :html="tagDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagDefault.html [HTML]
:::

### Sizes

Add `size="sm"` or `size="lg"`. Default is md. A removable tag is always at least 24px tall to keep its remove target accessible.

<ComponentWrapper :html="tagSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagSizes.html [HTML]
:::

### Leading content

Put an icon or avatar in the `prefix` slot.

<ComponentWrapper :html="tagPrefix" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagPrefix.html [HTML]
:::

### Disabled

Add `disabled` to block removal. The label stays legible — disabled is conveyed by the dimmed × button and the `not-allowed` cursor, not by washing out the text.

<ComponentWrapper :html="tagDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tag/TagDisabled.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Accessible name', Description: 'The remove button exposes a localized `Remove` label', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Target size', Description: 'The remove button keeps a minimum 24×24px hit target', WCAG: '[WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [RGAA 13.10](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#13.10)' },
  { Check: 'Keyboard', Description: 'The remove button is reachable with Tab and removes the tag with Backspace / Delete', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 12.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.9)' },
  { Check: 'Color contrast', Description: 'The label keeps the minimum contrast ratio over the chip background in every state, including disabled', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
]" :rules="[
  'Always give a removable tag a visible text label so its remove button has context',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the remove button (when removable)' },
  { Key: 'Enter / Space', Description: 'Activates the focused remove button' },
  { Key: 'Backspace / Delete', Description: 'Removes the tag while it is focused' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tag';
```

:::

### Attributes & Properties

<ApiTable element="tag" section="properties" />

### Events

<ApiTable element="tag" section="events" />
