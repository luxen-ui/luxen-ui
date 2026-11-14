---
outline: deep
---

<script setup>
import tabsEnclosed from '../.vitepress/examples/tabs/TabsEnclosed.html?raw'
import tabsLine from '../.vitepress/examples/tabs/TabsLine.html?raw'
import tabsFullWidth from '../.vitepress/examples/tabs/TabsFullWidth.html?raw'
import tabsDefaultValue from '../.vitepress/examples/tabs/TabsDefaultValue.html?raw'
import tabsLineColors from '../.vitepress/examples/tabs/TabsLineColors.html?raw'
import tabsDisabled from '../.vitepress/examples/tabs/TabsDisabled.html?raw'
import tabsPanelFocus from '../.vitepress/examples/tabs/TabsPanelFocus.html?raw'
</script>

# Tabs <Badge type="tip">&lt;l-tabs&gt;</Badge>

Tabs organize content into panels, showing one at a time. Progressive enhancement — plain HTML is enhanced with ARIA roles, keyboard navigation, and an animated indicator. Mark the initially-active tab with `aria-selected="true"` so it is styled as selected before the script loads.

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

Hovering a tab reveals a subtle pill behind its label, detached from the bottom border. Restyle it with `--hover-color` (and `--hover-inset` for the gap), along with the active underline and the static bottom border via `--indicator-color`, `--indicator-thickness`, `--track-color` and `--track-thickness`.

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

### Disabled tab

Add `disabled` to a tab button to take it out of play. It is skipped by arrow keys, `Home` and `End`, it cannot be selected by a click or by `value`, and it never shows the hover pill. `aria-disabled="true"` behaves identically — reach for it only when the native attribute is out of reach (a framework binding, a non-`button` element).

`l-tabs` itself takes no `disabled` attribute. To freeze tab switching — while a page loads, say — put `inert` on the tablist `div`: the tabs leave the tab sequence and stop answering clicks, and the active panel stays reachable.

<ComponentWrapper :html="tabsDisabled" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsDisabled.html [HTML]
:::

### Panels with interactive content

`Tab` moves focus out of the tablist and into the active panel, so the content at the top of the panel is reachable. A panel that _opens_ with something focusable needs no stop of its own: `l-tabs` leaves its `tabindex` off and `Tab` reaches that first control directly, instead of stopping on the panel box first.

Every other panel keeps `tabindex="0"` — including one that opens with text and holds a button further down. Dropping the stop there would send a keyboard user past everything above that button.

<ComponentWrapper :html="tabsPanelFocus" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tabs/TabsPanelFocus.html [HTML]
:::

The check runs again whenever a panel's content changes, so a panel filled after mount — a framework rendering into it once its data lands — is treated the same as one present in the initial markup. A `tabindex` you write on a panel yourself is left alone.

## Accessibility

### Criteria

Follows the [APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with [automatic activation](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#decidingwhentomakeselectionautomaticallyfollowfocus): arrow keys move focus and select the tab in one step.

<AccessibilityTable :data="[
  { Check: 'Tab roles exposed', Description: '`tablist`, `tab` and `tabpanel` go on the matching children', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Tabs and panels linked', Description: '`aria-controls` points from each tab to its panel; `aria-labelledby` points back', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
  { Check: 'Selection exposed', Description: '`aria-selected` follows the active tab', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'One Tab stop for the tablist', Description: 'Roving tabindex: only the active tab is in the tab order', Note: 'A panel takes `tabindex=&quot;0&quot;` unless its first content is already focusable, per the [APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/#keyboardinteraction)', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 12.13](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.13)' },
  { Check: 'Disabled tabs skipped', Description: 'Arrow keys, `Home` and `End` pass over tabs with `disabled` or `aria-disabled=&quot;true&quot;`', Note: 'They never take the roving `tabindex=&quot;0&quot;`, so the tablist always keeps a reachable entry point', WCAG: '[WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard), [RGAA 7.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.3)' },
  { Check: 'Inactive panels hidden', Description: 'They carry the `hidden` attribute', WCAG: '[WCAG 1.3.2](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence)' },
  { Check: 'Reduced motion respected', Description: 'The indicator animation follows `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Put tab buttons first, panels after', Description: 'The first child is a `div` of `button` triggers; each following `div` is a panel, in order', Code: 'structure' },
  { Check: 'Label every tab', Description: 'Use visible text, or an `aria-label` when the tab shows only an icon', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)', Code: 'label' },
  { Check: 'Don’t add ARIA yourself', Description: 'Leave `role` and `aria-*` to the custom element', Note: 'It sets and updates them; hand-written values go stale' },
  { Check: 'Freeze with `inert`, not `disabled`', Description: 'Put `inert` on the tablist `div` to stop tab switching', Note: '`l-tabs` has no host-level `disabled` attribute', Code: 'freeze' },
]">

<template #structure>

```html
<l-tabs>
  <div><button>Account</button><button>Billing</button></div>
  <div>Account settings</div>
  <div>Billing details</div>
</l-tabs>
```

</template>

<template #label>

```html
<button aria-label="Settings">
  <l-icon name="lucide:settings"></l-icon>
</button>
```

</template>

<template #freeze>

```html
<l-tabs>
  <div inert>…</div>
  …
</l-tabs>
```

</template>

</AccessibilityTable>

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'ArrowRight', Description: 'Moves focus to the next enabled tab and activates it (horizontal orientation)' },
  { Key: 'ArrowLeft', Description: 'Moves focus to the previous enabled tab and activates it (horizontal orientation)' },
  { Key: 'ArrowDown', Description: 'Moves focus to the next enabled tab and activates it (vertical orientation)' },
  { Key: 'ArrowUp', Description: 'Moves focus to the previous enabled tab and activates it (vertical orientation)' },
  { Key: 'Home', Description: 'Moves focus to the first enabled tab and activates it' },
  { Key: 'End', Description: 'Moves focus to the last enabled tab and activates it' },
  { Key: 'Tab', Description: 'Moves focus out of the tablist — to the active panel, or straight to its first control when the panel opens with one' },
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
