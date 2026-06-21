---
outline: deep
---

<script setup>
import breadcrumbExample from '../.vitepress/examples/breadcrumb/Breadcrumb.html?raw'
import breadcrumbIcons from '../.vitepress/examples/breadcrumb/BreadcrumbIcons.html?raw'
import breadcrumbSeparator from '../.vitepress/examples/breadcrumb/BreadcrumbSeparator.html?raw'
import breadcrumbOverflow from '../.vitepress/examples/breadcrumb/BreadcrumbOverflow.html?raw'
import breadcrumbCustomLinks from '../.vitepress/examples/breadcrumb/BreadcrumbCustomLinks.html?raw'
</script>

# Breadcrumb <Badge type="tip">&lt;nav&gt;</Badge>

A breadcrumb shows the current page's position in the site hierarchy and lets users step back up the trail. Commonly used at the top of content pages, product categories, and settings sections.

Built on native markup — a `<nav>` landmark wrapping an ordered list of links — following the [WAI-ARIA breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/). No JavaScript required.

<ElementSpec element="breadcrumb" />

## Options

### Basic

Add `class="l-breadcrumb"` to a `<nav>` with an `aria-label`, then list one `<li><a>` per crumb inside a single `<ol>`. Mark the current page's link with `aria-current="page"` — it renders as a non-interactive emphasis.

<ComponentWrapper :html="breadcrumbExample" />

::: details Code
::: code-group
<<< @/.vitepress/examples/breadcrumb/Breadcrumb.html [HTML]
:::

### With icons

Drop an `<l-icon>` inside any crumb's `<a>` — for a leading home glyph or to label a section. Give a standalone icon a `label` so it has an accessible name.

<ComponentWrapper :html="breadcrumbIcons" />

::: details Code
::: code-group
<<< @/.vitepress/examples/breadcrumb/BreadcrumbIcons.html [HTML]
:::

### Custom separator

The divider is a decorative oblique `/`. Recolor it with `--separator-color`, or swap the glyph with any character (e.g. `'›'`) or a `url()` image via `--separator`.

<ComponentWrapper :html="breadcrumbSeparator" />

::: details Code
::: code-group
<<< @/.vitepress/examples/breadcrumb/BreadcrumbSeparator.html [HTML]
:::

### Long trails

The trail never wraps — when it overflows it scrolls horizontally (with touch momentum on mobile). To shorten a deep path instead, keep the first and last crumbs visible and fold the middle ones into an [`l-dropdown`](/elements/dropdown). Label the trigger so its purpose is announced.

<ComponentWrapper :html="breadcrumbOverflow" />

::: details Code
::: code-group
<<< @/.vitepress/examples/breadcrumb/BreadcrumbOverflow.html [HTML]
:::

### Custom link styles

Add `data-unstyled-links` to opt out of Luxen's link theming and apply your own link class (or framework link component). Layout, separators, horizontal scroll, and the current-page behavior stay intact.

<ComponentWrapper :html="breadcrumbCustomLinks" />

::: details Code
::: code-group
<<< @/.vitepress/examples/breadcrumb/BreadcrumbCustomLinks.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
{ Check: 'Landmark', Description: 'A `<nav>` with an `aria-label` of `Breadcrumb` exposes the trail as a named navigation region', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships), [RGAA 9.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#9.2)' },
{ Check: 'Structure', Description: 'Crumbs sit in an ordered list (`<ol>`/`<li>`), conveying sequence to assistive tech', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
{ Check: 'Current page', Description: 'An `aria-current` of `page` on the last crumb identifies the user\'s location', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
{ Check: 'Decorative separators', Description: 'Separators are CSS pseudo-elements, never in the DOM, so they are not announced', WCAG: '[WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships)' },
{ Check: 'Color contrast', Description: 'Link and separator colors meet contrast against the background', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [RGAA 3.2](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.2)' },
]" :rules="[
'Wrap the trail in a `<nav>` with an `aria-label` of `Breadcrumb` and use a single `<ol>` of `<li>` crumbs',
'Mark the current page with `aria-current` set to `page` on its `<a>`',
'Give standalone icons (e.g. a home glyph) an accessible name via the `label` attribute',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus to the next crumb link' },
  { Key: 'Shift + Tab', Description: 'Moves focus to the previous crumb link' },
  { Key: 'Enter', Description: 'Follows the focused crumb link' },
]" />

## API reference

### Importing

::: code-group

```css [CSS]
@import 'luxen-ui/css/breadcrumb';
```

:::

### Attributes

<ApiTable element="breadcrumb" section="attributes" />

### CSS classes

<ApiTable element="breadcrumb" section="cssClasses" />

### CSS custom properties

<ApiTable element="breadcrumb" section="cssProperties" />
