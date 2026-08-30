---
outline: deep
---

<script setup>
import badgeAppearance from '../.vitepress/examples/badge/BadgeAppearance.html?raw'
import badgeCategorical from '../.vitepress/examples/badge/BadgeCategorical.html?raw'
import badgeIcon from '../.vitepress/examples/badge/BadgeIcon.html?raw'
import badgeSize from '../.vitepress/examples/badge/BadgeSize.html?raw'
import badgeVariant from '../.vitepress/examples/badge/BadgeVariant.html?raw'
import badgePill from '../.vitepress/examples/badge/BadgePill.html?raw'
</script>

# Badge <Badge type="tip">&lt;l-badge&gt;</Badge>

Badges are used to draw attention and display statuses or counts. Commonly used in tabular data, lists, and navigation to indicate state or category.

::: code-group

```html [HTML]
<l-badge variant="success">Active</l-badge>
```

:::

<ElementSpec element="badge" />

::: info Badge or tag?
A badge is a value the user **reads**. When the chip is something the user **operates** — a filter to toggle, a token to remove — use [`<l-tag>`](/elements/tag).
:::

## Options

### Appearance

Add `appearance="filled"` (tinted background, no border), `appearance="filled-outlined"` (tinted background with border), or `appearance="accent"` (strong background, contrast text). Default is outlined (border, no background).

<ComponentWrapper :html="badgeAppearance" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeAppearance.html [HTML]
:::

### Icon

Put an `<l-icon>` at either end of the badge, or both. It resolves to `1em` and inherits the label's color, and the badge tightens the padding on that edge to keep the chip balanced. A raw `<iconify-icon>` or an inline `<svg>` works the same way.

For a **trailing** icon, wrap the label in a `<span>`: CSS counts elements, not text, so that is what tells the badge which end the icon is on.

Leave the icon decorative — the badge's text carries the meaning.

<ComponentWrapper :html="badgeIcon" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeIcon.html [HTML]
:::

### Pill

Add the `pill` attribute for a fully rounded shape.

<ComponentWrapper :html="badgePill" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgePill.html [HTML]
:::

### Sizes

Add `size="sm"` or `size="lg"`. Default is md.

<ComponentWrapper :html="badgeSize" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeSize.html [HTML]
:::

### Variants

Add `variant="info"`, `variant="success"`, `variant="warning"`, or `variant="danger"`. Default is neutral.

<ComponentWrapper :html="badgeVariant" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeVariant.html [HTML]
:::

## Examples

### Categorical color

The variants say how something went. When the color instead says **what kind of thing** this is — a site, a department, an asset class — give the badge your own class and set `--text-color`, `--background-color` and `--border-color` on it.

The border is a 30% tint of the label color, so `--text-color` alone is the whole theme on an outlined badge; `--background-color` adds the fill, and `--border-color` replaces the derivation when your palette carries its own line token. All three win over `variant` and `appearance`, so a tinted badge keeps its tint through an appearance change. Every CSS custom property inherits, so setting them on a wrapper themes each badge inside.

Keep `variant` for the four interface states. A business family belongs in your own class, where it cannot collide with a variant the library adds later.

<ComponentWrapper :html="badgeCategorical" />

::: details Code
::: code-group
<<< @/.vitepress/examples/badge/BadgeCategorical.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Color contrast', Description: 'Text and background meet minimum contrast ratio across all appearances and variants', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
  { Check: 'Non-text contrast', Description: 'Badge borders meet non-text contrast minimum against adjacent surfaces', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3)' },
  { Check: 'Not color alone', Description: 'Do not rely on badge color alone to convey status — always include a text label', WCAG: '[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color), [RGAA 3.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.1)' },
]" :rules="[
  'Always include visible text inside the badge — do not use color alone to convey meaning',
  'When a badge conveys dynamic status, wrap it in a `role=&quot;status&quot;` container so screen readers announce changes',
  'Verify a custom `--text-color` / `--background-color` pair yourself — the built-in variants are contrast-checked, a consumer palette is not',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/badge';
```

```css [CSS]
@import 'luxen-ui/css/badge';
```

:::

### Attributes & Properties

<ApiTable element="badge" section="properties" />

### CSS custom properties

<ApiTable element="badge" section="cssProperties" />
