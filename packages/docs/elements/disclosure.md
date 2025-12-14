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

<ElementSpec
  tag="details"
  type="native"
/>

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

<ApiTable :data="[
  { Attribute: 'open', Description: 'Native attribute — starts the disclosure expanded' },
  { Attribute: 'name', Description: 'Native attribute — groups disclosures into an exclusive accordion' },
  { Attribute: 'data-marker=&quot;arrow&quot;', Description: 'Shows a chevron icon that rotates 180° when open' },
  { Attribute: 'data-marker=&quot;plus&quot;', Description: 'Shows a plus icon that rotates 45° into a cross when open' },
  { Attribute: 'data-variant=&quot;bordered&quot;', Description: 'Adds border, background, and border-radius' },
  { Attribute: 'disabled', Description: 'Disables interaction on the disclosure (set on `<details>` or `<summary>`)' },
]" />

### Events

<ApiTable :data="[
  { Event: 'toggle', Description: 'Fires when the disclosure opens or closes (`e.newState` is `&quot;open&quot;` or `&quot;closed&quot;`)' },
]" />

### CSS classes

<ApiTable :data="[
  { Class: '.l-disclosure', Description: 'Headless base — layout, animation, and marker behavior only' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--marker-size', Description: 'Marker icon size (default: `20px`)' },
  { Name: '--marker-color', Description: 'Marker icon color (default: `var(--l-color-text-tertiary)`)' },
]" />
