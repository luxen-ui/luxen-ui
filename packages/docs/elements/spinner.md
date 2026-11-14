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

<ElementSpec element="spinner" />

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
  { Check: 'Progressbar role exposed', Description: '`role=&quot;progressbar&quot;` communicates the loading state', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Named `Loading` by default', Description: 'A default `aria-label=&quot;Loading&quot;` provides the accessible name', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
]" :rules="[
  { Check: 'Mark the loading region busy', Description: 'When the spinner stands for a specific region, add `aria-busy=&quot;true&quot;` to the container being loaded' },
  { Check: 'Name spinners that share a page', Description: 'Give each a context-specific `aria-label`, such as `aria-label=&quot;Loading search results&quot;`' },
  { Check: 'Check the indicator contrast', Description: 'Test the indicator color at 3:1 against its background, including an `--indicator-color` override', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/spinner';
```

:::

### CSS custom properties

<ApiTable element="spinner" section="cssProperties" />
