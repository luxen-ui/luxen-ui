---
outline: deep
---

<script setup>
import iconDefault from '../.vitepress/examples/icon/IconDefault.html?raw'
import iconSizes from '../.vitepress/examples/icon/IconSizes.html?raw'
import iconSets from '../.vitepress/examples/icon/IconSets.html?raw'
import iconAccessible from '../.vitepress/examples/icon/IconAccessible.html?raw'
</script>

# Icon <Badge type="tip">&lt;l-icon&gt;</Badge>

Renders icons from any Iconify icon set. Icons are loaded on demand from the Iconify CDN. By default all icons are scaled to `1em` height — use `font-size` to control icon size.

<ElementSpec
  tag="l-icon"
  type="shadow"
/>

::: info
`l-icon` uses [Iconify](https://iconify.design/) under the hood. Browse all available icons at [icon-sets.iconify.design](https://icon-sets.iconify.design/).
:::

## Options

<ComponentWrapper :html="iconDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/icon/IconDefault.html [HTML]
:::

### Sizes

Icons scale with `font-size`. Use Tailwind `text-*` classes.

<ComponentWrapper :html="iconSizes" />

::: details Code
::: code-group
<<< @/.vitepress/examples/icon/IconSizes.html [HTML]
:::

### Icon sets

Use any icon from the Iconify library with the `prefix:name` format.

<ComponentWrapper :html="iconSets" />

::: details Code
::: code-group
<<< @/.vitepress/examples/icon/IconSets.html [HTML]
:::

### Accessible icons

Icons are decorative by default (`aria-hidden="true"`). Add `label` for meaningful icons.

<ComponentWrapper :html="iconAccessible" />

::: details Code
::: code-group
<<< @/.vitepress/examples/icon/IconAccessible.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Decorative icons', Description: 'Icons are hidden from assistive technology by default via `aria-hidden=&quot;true&quot;`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
  { Check: 'Meaningful icons', Description: 'Set `label` to convey meaning — adds `aria-label` and removes `aria-hidden`', WCAG: '[WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content), [RGAA 1.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#1.1)' },
]" :rules="[
  'Always add `label` when the icon is the only content conveying meaning (e.g., icon-only buttons)',
  'Omit `label` when the icon is next to visible text that already conveys the same meaning',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/icon';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Name: 'name', Description: 'Icon name in Iconify format (`prefix:name`). Example: `lucide:home`' },
  { Name: 'label', Description: 'Accessible label. When set, icon becomes meaningful (`role=&quot;img&quot;` + `aria-label`). When absent, icon is decorative' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--color', Description: 'The color of the icon. Defaults to `currentColor`' },
]" />
