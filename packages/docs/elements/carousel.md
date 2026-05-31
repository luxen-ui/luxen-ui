---
outline: deep
---

<script setup>
import carouselBasic from '../.vitepress/examples/carousel/CarouselBasic.html?raw'
import carouselGallery from '../.vitepress/examples/carousel/CarouselGallery.html?raw'
import carouselDots from '../.vitepress/examples/carousel/CarouselDots.html?raw'
import carouselDotsCircle from '../.vitepress/examples/carousel/CarouselDotsCircle.html?raw'
import carouselProduct from '../.vitepress/examples/carousel/CarouselProduct.html?raw'
import carouselScrollbar from '../.vitepress/examples/carousel/CarouselScrollbar.html?raw'
import carouselAutoplay from '../.vitepress/examples/carousel/CarouselAutoplay.html?raw'
import carouselBreakpoints from '../.vitepress/examples/carousel/CarouselBreakpoints.html?raw'
</script>

# Carousel <Badge type="tip">&lt;l-carousel&gt;</Badge>

Carousels are used to cycle through a set of content slides in a horizontal scrollable area. Commonly used for image galleries, product showcases, and featured content. Powered by [Embla Carousel](https://www.embla-carousel.com/).

<ElementSpec element="carousel" />

## Options

### Basic

Slides are `<l-carousel-item>` children. Set `--slide-size` and `--slide-gap` to control layout. Add `drag-free` for momentum scrolling.

<ComponentWrapper vertical :html="carouselBasic" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselBasic.html [HTML]
:::

### Gallery

Add `single` for one slide at a time.

<ComponentWrapper vertical :html="carouselGallery" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselGallery.html [HTML]
:::

### Dots (bar)

Add `with-dots` for dot navigation. Default appearance is `bar`. Use `max-visible-dots` to cap the rendered dots — edge dots shrink when more dots exist beyond the window.

<ComponentWrapper vertical :html="carouselDots" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselDots.html [HTML]
:::

### Dots (circle)

Set `dot-appearance="circle"` for circle dots.

<ComponentWrapper vertical :html="carouselDotsCircle" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselDotsCircle.html [HTML]
:::

### Breakpoints

Use the `breakpoints` attribute (JSON) to override options at specific breakpoints. The carousel can deactivate itself at wider viewports.

<ComponentWrapper vertical :html="carouselBreakpoints" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselBreakpoints.html [HTML]
:::

### Autoplay

Set `autoplay` to a delay in milliseconds. Combine with `axis="y"` for vertical rotation.

<ComponentWrapper vertical :html="carouselAutoplay" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselAutoplay.html [HTML]
:::

## Examples

### Product gallery

Single slide with dots and fullscreen button.

<ComponentWrapper vertical :html="carouselProduct" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselProduct.html [HTML]
:::

### Product grid with scrollbar

Drag-free with scrollbar and outside navigation buttons.

<ComponentWrapper vertical :html="carouselScrollbar" />

::: details Code
::: code-group
<<< @/.vitepress/examples/carousel/CarouselScrollbar.html [HTML]
:::

## Accessibility

### Criteria

<AccessibilityTable :data="[
  { Check: 'Role', Description: 'Each `<l-carousel-item>` has `role=&quot;group&quot;`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Dot navigation', Description: 'Dots use `role=&quot;tab&quot;` with `aria-label` and `aria-selected`', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
  { Check: 'Disabled buttons', Description: 'Previous/next buttons are `disabled` when at scroll boundaries', WCAG: '[WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value)' },
]" :rules="[
  'Add descriptive `aria-label` to the carousel element when context is needed',
  'Provide meaningful alt text on images inside carousel items',
]" />

### Keyboard interactions

<KeyboardTable :data="[
  { Key: 'Tab', Description: 'Moves focus between navigation buttons' },
  { Key: 'Enter', Description: 'Activates the focused button (next, previous, or dot)' },
  { Key: 'Space', Description: 'Activates the focused button' },
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/carousel';
import 'luxen-ui/carousel-item';
```

:::

### Attributes & Properties

<ApiTable element="carousel" section="properties" />

### Methods

<ApiTable element="carousel" section="methods" />

### Events

<ApiTable element="carousel" section="events" />

### CSS Parts

<ApiTable element="carousel" section="cssParts" />

### CSS custom properties

<ApiTable element="carousel" section="cssProperties" />

### `carousel-item` CSS custom properties

<ApiTable element="carousel-item" section="cssProperties" />
