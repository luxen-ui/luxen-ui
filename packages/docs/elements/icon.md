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

<ElementSpec element="icon" />

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

### Your own icon set

Icons outside the Iconify CDN — a house collection generated from your own SVGs — must be registered first. On npm, use the `addCollection()` **this package re-exports**; on the CDN build, assign `window.IconifyPreload` before the script tag.

::: code-group

```js [JS]
import { addCollection } from 'luxen-ui/icon';
import acmeIcons from './icons/acme.json'; // { prefix: 'acme', icons: { … } }

addCollection(acmeIcons);
```

```html [CDN]
<script>
  // Read when the module loads, so it has to come first.
  window.IconifyPreload = [{ prefix: 'acme', icons: {} }];
</script>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/luxen-ui/cdn/elements/icon/index.js"
></script>
```

:::

```html
<l-icon name="acme:location"></l-icon>
```

Two rules, because both fail silently:

- **This `addCollection`, not a framework binding's.** Icon storage belongs to the `iconify-icon` module and every copy of it has its own, so a collection registered through `@iconify/vue` or `@iconify/react` is invisible here — the icon renders nothing, at zero width, with no error.
- **Before the first icon mounts.** Registering writes to storage; it does not re-render icons already on the page.

`addIcon()` and `setCustomIconLoader()` are re-exported the same way. A name that resolves to nothing logs one warning per name.

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

<ApiTable element="icon" section="properties" />

### CSS custom properties

<ApiTable element="icon" section="cssProperties" />
