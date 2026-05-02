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

<ElementSpec
  tag="l-carousel"
  type="shadow"
/>

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

<ApiTable :data="[
  { Attribute: 'autoplay', Description: 'Autoplay delay in milliseconds. `0` disables autoplay' },
  { Attribute: 'autoplay-options', Description: 'Embla autoplay plugin options (JSON object)' },
  { Attribute: 'axis', Description: 'Scroll axis: `x` (default) or `y`' },
  { Attribute: 'align', Description: 'Slide alignment: `start` (default), `center`, `end`' },
  { Attribute: 'breakpoints', Description: 'Breakpoint-specific option overrides (JSON object)' },
  { Attribute: 'loop', Description: 'Enable infinite looping' },
  { Attribute: 'drag-free', Description: 'Enable momentum scrolling' },
  { Attribute: 'duration', Description: 'Scroll animation duration. Default `20`' },
  { Attribute: 'skip-snaps', Description: 'Allow skipping snap points on vigorous drag' },
  { Attribute: 'slides-to-scroll', Description: 'Number of slides per scroll group. Default `1`' },
  { Attribute: 'start-index', Description: 'Initial scroll snap index. Default `0`' },
  { Attribute: 'contain-scroll', Description: 'Trim empty space: `trimSnaps` (default) or `keepSnaps`' },
  { Attribute: 'single', Description: 'Show one slide at a time' },
  { Attribute: 'with-dots', Description: 'Show dot navigation' },
  { Attribute: 'with-scrollbar', Description: 'Show native scrollbar on viewport' },
  { Attribute: 'with-fullscreen', Description: 'Show fullscreen button' },
  { Attribute: 'dot-appearance', Description: 'Dot style: `bar` (default) or `circle`' },
  { Attribute: 'max-visible-dots', Description: 'Maximum number of dots shown at once. Edge dots shrink when more dots exist beyond the window. `0` (default) shows all dots' },
  { Attribute: 'scroll-buttons-position', Description: 'Button position: `inside` (default) or `outside`' },
]" />

### Methods

<ApiTable :data="[
  { Method: 'next()', Description: 'Scroll to the next slide' },
  { Method: 'previous()', Description: 'Scroll to the previous slide' },
  { Method: 'goToSlide(index, jump?)', Description: 'Scroll to a specific slide index' },
  { Method: 'isActive()', Description: 'Returns whether the carousel is active' },
]" />

### Events

<ApiTable :data="[
  { Event: 'select', Description: 'Fired when the selected slide changes. Detail: `{ index }`' },
  { Event: 'slides-in-view', Description: 'Fired when visible slides change. Detail: `{ indexes }`' },
  { Event: 'fullscreen', Description: 'Fired when the fullscreen button is clicked' },
]" />

### CSS Parts

<ApiTable :data="[
  { Part: 'viewport', Description: 'The overflow container' },
  { Part: 'container', Description: 'The slides slot' },
  { Part: 'scroll-buttons', Description: 'Previous/next button wrapper' },
  { Part: 'button', Description: 'Any navigation button' },
  { Part: 'button-previous', Description: 'The previous button' },
  { Part: 'button-next', Description: 'The next button' },
  { Part: 'button-dot', Description: 'A dot navigation button' },
  { Part: 'button-fullscreen', Description: 'The fullscreen button' },
  { Part: 'button-icon', Description: 'Any button icon SVG' },
  { Part: 'dots', Description: 'The dots container' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--slide-height', Description: 'Slide height for vertical axis mode. Default `19rem`' },
  { Name: '--slide-size', Description: 'Slide width (flex-basis). Default `100%`' },
  { Name: '--slide-gap', Description: 'Gap between slides. Default `0`' },
  { Name: '--button-size', Description: 'Navigation button size. Default `48px`' },
  { Name: '--button-arrow-size', Description: 'Arrow icon size. Default `20px`' },
  { Name: '--button-arrow-color', Description: 'Arrow icon color' },
  { Name: '--button-offset', Description: 'Inside-positioned button offset. Default `8px`' },
  { Name: '--button-border-color', Description: 'Button border color' },
  { Name: '--button-border-radius', Description: 'Button border radius. Default `8px`' },
  { Name: '--button-bg', Description: 'Button background color' },
  { Name: '--button-color', Description: 'Button text/icon color' },
  { Name: '--dot-color', Description: 'Inactive dot color' },
  { Name: '--dot-color-active', Description: 'Active dot color' },
  { Name: '--dot-margin', Description: 'Dot container margin. Default `0.5rem 0`' },
  { Name: '--dot-edge-scale', Description: 'Scale factor for edge dots when overflow is present. Default `0.5`' },
]" />

### `carousel-item` Attributes & Properties

<ApiTable :data="[
  { Attribute: 'role', Description: 'Automatically set to `group`' },
]" />

### `carousel-item` CSS custom properties

<ApiTable :data="[
  { Name: '--aspect-ratio', Description: 'Aspect ratio of the slide. Default `inherit`' },
]" />
