---
outline: deep
---

<script setup>
import spinnerDefault from '../.vitepress/examples/spinner/SpinnerDefault.html?raw'
import spinnerSizes from '../.vitepress/examples/spinner/SpinnerSizes.html?raw'
import spinnerCustom from '../.vitepress/examples/spinner/SpinnerCustom.html?raw'
</script>

# Spinner <Badge type="tip">&lt;l-spinner&gt;</Badge>

Spinners are used to indicate an indeterminate loading state. Commonly used inside buttons, forms, or content areas while waiting for an asynchronous operation to complete.

<ElementSpec
  tag="l-spinner"
  type="shadow"
/>

## Options

<ComponentWrapper :html="spinnerDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/spinner/SpinnerDefault.html [HTML]
:::

### Sizes

Size scales with `font-size` since `--size` defaults to `1em`.

<ComponentWrapper :html="spinnerSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/spinner/SpinnerSizes.html [HTML]
:::

### Custom colors

Override `--indicator-color`.

<ComponentWrapper :html="spinnerCustom" />

::: details Code
::: code-group
<<< @/.vitepress/examples/spinner/SpinnerCustom.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Uses `role=&quot;progressbar&quot;` to communicate loading state', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'Default `aria-label=&quot;Loading&quot;` provides accessible name', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Color', Description: 'Indicator color must meet non-text contrast ratio against its background', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
]" :rules="[
  'When the spinner indicates loading for a specific region, add `aria-busy=&quot;true&quot;` to the container being loaded',
  'Provide a context-specific `aria-label` when multiple spinners are on the same page (e.g., `aria-label=&quot;Loading search results&quot;`)',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/spinner';
```

:::

### CSS custom properties

<ApiTable :data="[
  { Name: '--size', Description: 'The size of the spinner (width and height). Defaults to `1em`' },
  { Name: '--indicator-color', Description: 'The color of the spinner' },
  { Name: '--speed', Description: 'The duration of one full spin cycle' },
]" />
