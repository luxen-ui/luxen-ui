---
outline: deep
---

<script setup>
import disclosureDefault from '../.vitepress/examples/disclosure/DisclosureDefault.html?raw'
import disclosureOpen from '../.vitepress/examples/disclosure/DisclosureOpen.html?raw'
import disclosureMarkers from '../.vitepress/examples/disclosure/DisclosureMarkers.html?raw'
import disclosureMarkerPlacement from '../.vitepress/examples/disclosure/DisclosureMarkerPlacement.html?raw'
import disclosureFaq from '../.vitepress/examples/disclosure/DisclosureFaq.html?raw'
</script>

# Disclosure <Badge type="tip">&lt;details&gt;</Badge>

Disclosures are used to show and hide content sections on demand. Commonly used for FAQs, collapsible panels, and progressive disclosure of secondary information.

<ElementSpec element="disclosure" />

## Options

### Variants

Add `data-variant="bordered"` for a visual container.

<ComponentWrapper vertical :html="disclosureDefault" />

::: details Code
::: code-group
<<< @/.vitepress/examples/disclosure/DisclosureDefault.html [HTML]
:::

### Initially open

Native `open` attribute.

<ComponentWrapper vertical :html="disclosureOpen" />

::: details Code
::: code-group
<<< @/.vitepress/examples/disclosure/DisclosureOpen.html [HTML]
:::

### Markers

Add `data-marker="arrow"` or `data-marker="plus"` for an animated icon indicator.

<ComponentWrapper vertical :html="disclosureMarkers" />

::: details Code
::: code-group
<<< @/.vitepress/examples/disclosure/DisclosureMarkers.html [HTML]
:::

### Marker placement

Add `data-marker-placement="start"` to move the marker before the label (defaults to `end`).

<ComponentWrapper vertical :html="disclosureMarkerPlacement" />

::: details Code
::: code-group
<<< @/.vitepress/examples/disclosure/DisclosureMarkerPlacement.html [HTML]
:::

## Examples

### FAQ

Use the native `name` attribute to create an exclusive accordion — only one item open at a time. Style the container with Tailwind utilities.

<ComponentWrapper vertical :html="disclosureFaq" />

::: details Code
::: code-group
<<< @/.vitepress/examples/disclosure/DisclosureFaq.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Summary names the disclosure', Description: 'The `<summary>` provides the accessible name automatically', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Reduced motion respected', Description: 'Animations use CSS transitions that follow `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  { Check: 'Don’t put a heading inside `<summary>`', Description: 'Add one heading above the group instead', Note: 'The `<summary>` is a disclosure control, so a heading inside it is not reliably exposed to assistive tech', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.1)' },
  { Check: 'Start with a descriptive `<summary>`', Description: 'Make it the first child of `<details>`' },
  { Check: 'Use a native `<details>`', Description: 'It brings built-in disclosure semantics, with no ARIA needed', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Don’t override `<summary>` semantics', Description: 'Leave its `role` and `tabindex` as they are', Note: 'The native semantics are correct' },
]" :references="[
  '[GOV.NZ — disclosures and accordions](https://govtnz.github.io/web-a11y-guidance/wct/disclosures-and-accordions/) — native-first guidance; headings inside `<summary>` are inconsistently exposed',
  '[ARIA APG — accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) — the heading > button alternative when a trigger must be a navigable heading',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Enter', Description: 'Toggles the disclosure open or closed' },
  { Key: 'Space', Description: 'Toggles the disclosure open or closed' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/disclosure';
```

:::

### Attributes & Properties

<ApiTable element="disclosure" section="attributes" />

### Events

<ApiTable element="disclosure" section="events" />

### CSS classes

<ApiTable element="disclosure" section="cssClasses" />

### CSS custom properties

<ApiTable element="disclosure" section="cssProperties" />
