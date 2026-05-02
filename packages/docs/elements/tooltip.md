---
outline: deep
---

<script setup>
import tooltipBasic from '../.vitepress/examples/tooltip/TooltipBasic.html?raw'
import tooltipPlacement from '../.vitepress/examples/tooltip/TooltipPlacement.html?raw'
import tooltipAllPlacements from '../.vitepress/examples/tooltip/TooltipAllPlacements.html?raw'
import tooltipNoArrow from '../.vitepress/examples/tooltip/TooltipNoArrow.html?raw'
import tooltipClick from '../.vitepress/examples/tooltip/TooltipClick.html?raw'
import tooltipColor from '../.vitepress/examples/tooltip/TooltipColor.html?raw'
</script>

# Tooltip <Badge type="tip">&lt;l-tooltip&gt;</Badge>

Tooltips are used to display a short text label on hover or focus to describe an element. Commonly used on icon buttons, truncated text, and controls that need additional context.

<ElementSpec
  tag="l-tooltip"
  type="shadow"
/>

## Options

### Basic

Reference a trigger element by ID using the `for` attribute.

<ComponentWrapper :html="tooltipBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipBasic.html [HTML]
:::

### Placement

Set `placement` to control position: `top` (default), `bottom`, `left`, `right`.

<ComponentWrapper :html="tooltipPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipPlacement.html [HTML]
:::

### Trigger

Set `trigger` to control activation: `hover focus` (default), `click`, `hover`, `focus`, `manual`.

<ComponentWrapper :html="tooltipClick" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipClick.html [HTML]
:::

### Without arrow

Add `without-arrow` to hide the directional arrow.

<ComponentWrapper :html="tooltipNoArrow" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipNoArrow.html [HTML]
:::

### Custom color

Set `--background-color` to a base color. Text color is auto-derived from its luminance for readable contrast.

<ComponentWrapper :html="tooltipColor" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipColor.html [HTML]
:::

## Examples

### All placements

All 12 placement options with aligned variants (`-start`, `-end`).

<ComponentWrapper :html="tooltipAllPlacements" />

::: details Code
::: code-group
<<< @/.vitepress/examples/tooltip/TooltipAllPlacements.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Popover has `role=&quot;tooltip&quot;` with a generated `id`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible description', Description: 'Trigger receives `aria-describedby` pointing to the tooltip when open', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 11.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.1)' },
  { Check: 'Hover state', Description: 'Shows on `pointerenter`; safe polygon hover bridge prevents flickering', WCAG: '[WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)' },
  { Check: 'Focus state', Description: 'Shows on `focusin`, hides on `focusout`', WCAG: '[WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus), [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)' },
  { Check: 'Dismissible', Description: 'Closes on `Escape` without moving focus', WCAG: '[WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)' },
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'The trigger element must have meaningful text or `aria-label` — the tooltip supplements, it does not replace, the accessible name',
  'Never put interactive content inside a tooltip; use `<l-popover>` instead',
  'Tooltip content should be short and text-only',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Escape', Description: 'Dismisses the tooltip without moving focus' },
  { Key: 'Tab', Description: 'Moving focus to the trigger shows the tooltip; moving away hides it' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/tooltip';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'for', Description: 'ID of the trigger element' },
  { Attribute: 'placement', Description: 'Preferred placement: `top` (default), `top-start`, `top-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`' },
  { Attribute: 'distance', Description: 'Offset from trigger in px. Default `8`' },
  { Attribute: 'open', Description: 'Whether tooltip is visible. Reflects to attribute' },
  { Attribute: 'without-arrow', Description: 'Hide the directional arrow' },
  { Attribute: 'trigger', Description: 'Space-separated trigger modes: `hover focus` (default), `click`, `manual`' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'show()', Description: 'Shows the tooltip' },
  { Method: 'hide()', Description: 'Hides the tooltip' },
  { Method: 'toggle()', Description: 'Toggles the tooltip' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--background-color', Description: 'Background color. Default: dark in light mode, light in dark mode' },
  { Name: '--text-color', Description: 'Text color. If unset, auto-derived from `--background-color` luminance' },
  { Name: '--border-radius', Description: 'Border radius. Default `4px`' },
  { Name: '--max-width', Description: 'Maximum width. Default `180px`' },
  { Name: '--arrow-size', Description: 'Arrow size. Default `6px`' },
  { Name: '--show-duration', Description: 'Show animation duration. Default `150ms`' },
  { Name: '--hide-duration', Description: 'Hide animation duration. Default `150ms`' },
]" />
