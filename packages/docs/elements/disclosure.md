---
outline: deep
---

<script setup>
import disclosureDefault from '../.vitepress/examples/disclosure/DisclosureDefault.html?raw'
import disclosureOpen from '../.vitepress/examples/disclosure/DisclosureOpen.html?raw'
import disclosureMarkers from '../.vitepress/examples/disclosure/DisclosureMarkers.html?raw'
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
  { Check: 'Role', Description: 'Uses native `<details>` — built-in disclosure semantics, no ARIA needed', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value), [RGAA 7.1](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#7.1)' },
  { Check: 'Accessible name', Description: 'The `<summary>` provides the accessible name automatically', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Motion', Description: 'Animations use CSS transitions that respect `prefers-reduced-motion`', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
]" :rules="[
  'Always include a descriptive `<summary>` as the first child of `<details>`',
  'Do not override the `role` or `tabindex` on `<summary>` — native semantics are correct',
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
