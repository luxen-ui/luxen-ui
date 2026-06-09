---
outline: deep
---

<script setup>
import tabsEnclosed from '../.vitepress/examples/tabs/TabsEnclosed.html?raw'
import tabsLine from '../.vitepress/examples/tabs/TabsLine.html?raw'
import tabsFullWidth from '../.vitepress/examples/tabs/TabsFullWidth.html?raw'
import tabsDefaultValue from '../.vitepress/examples/tabs/TabsDefaultValue.html?raw'
import tabsLineColors from '../.vitepress/examples/tabs/TabsLineColors.html?raw'
</script>

# Tabs <Badge type="tip">&lt;l-tabs&gt;</Badge>

Tabs organize content into panels, showing one at a time. Progressive enhancement — plain HTML is enhanced with ARIA roles, keyboard navigation, and an animated indicator.

<ElementSpec element="tabs" />

## Options

### Enclosed variant

Add `variant="enclosed"` for a pill-shaped tablist with a sliding background indicator.

<ComponentWrapper :html="tabsEnclosed" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsEnclosed.html [HTML]
:::

### Line variant

Add `variant="line"` for a tablist with a sliding underline indicator.

<ComponentWrapper :html="tabsLine" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsLine.html [HTML]
:::

Restyle the active underline and the static bottom border with `--indicator-color`, `--indicator-thickness`, `--track-color` and `--track-thickness`.

<ComponentWrapper :html="tabsLineColors" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsLineColors.html [HTML]
:::

### Full width

Add `full-width` to stretch tabs across the container.

<ComponentWrapper vertical :html="tabsFullWidth" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsFullWidth.html [HTML]
:::

### Default active tab

Set `value="1"` to activate a specific tab on load (0-based index).

<ComponentWrapper :html="tabsDefaultValue" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsDefaultValue.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'First child div gets `role=&quot;tablist&quot;`, buttons get `role=&quot;tab&quot;`, remaining divs get `role=&quot;tabpanel&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Linked controls', Description: 'Each tab has `aria-controls` pointing to its panel; each panel has `aria-labelledby` pointing back to its tab', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
  { Check: 'Selection state', Description: 'Active tab has `aria-selected=&quot;true&quot;`; inactive tabs have `aria-selected=&quot;false&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Focus management', Description: 'Roving tabindex — active tab has `tabindex=&quot;0&quot;`, others `tabindex=&quot;-1&quot;`. Panels have `tabindex=&quot;0&quot;` for keyboard access', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 12.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.13)' },
  { Check: 'Hidden content', Description: 'Inactive panels use the `hidden` attribute', WCAG: '[WCAG 1.3.2](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)' },
  { Check: 'Motion', Description: 'Indicator animation respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'The first child of `l-tabs` must be a `div` containing `button` elements for the tab triggers',
  'Each remaining child `div` maps to a tab panel in order',
  'Do not add `role` or `aria-*` attributes manually — the custom element sets them automatically',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'ArrowRight', Description: 'Moves focus to the next tab and activates it (horizontal orientation)' },
  { Key: 'ArrowLeft', Description: 'Moves focus to the previous tab and activates it (horizontal orientation)' },
  { Key: 'ArrowDown', Description: 'Moves focus to the next tab and activates it (vertical orientation)' },
  { Key: 'ArrowUp', Description: 'Moves focus to the previous tab and activates it (vertical orientation)' },
  { Key: 'Home', Description: 'Moves focus to the first tab and activates it' },
  { Key: 'End', Description: 'Moves focus to the last tab and activates it' },
  { Key: 'Tab', Description: 'Moves focus out of the tablist to the active panel' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tabs';
```

```css [CSS — enclosed variant]
@import 'luxen-ui/css/tabs/enclosed';
```

```css [CSS — line variant]
@import 'luxen-ui/css/tabs/line';
```

:::

### Attributes & Properties

<ApiTable element="tabs" section="properties" />

### Events

<ApiTable element="tabs" section="events" />

### CSS custom properties

<ApiTable element="tabs" section="cssProperties" />
