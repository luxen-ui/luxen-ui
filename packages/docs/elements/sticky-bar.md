---
outline: deep
---

<script setup>
import stickyBarBasic from '../.vitepress/examples/sticky-bar/StickyBarBasic.html?raw'
</script>

<style scoped>
.phone-deck {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 24px 0;
}
.phone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.phone .label {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-2);
}
.phone iframe {
  width: 340px;
  height: 640px;
  border: 10px solid #18181b;
  border-radius: 40px;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 48px -12px rgb(0 0 0 / 0.25);
}
</style>

# Sticky Bar <Badge type="tip">&lt;l-sticky-bar&gt;</Badge>

A bar docked to the viewport edge, painted in the document's **top layer**. Pass `for="<id>"` to track an element; the bar reveals when that element scrolls out of view (e.g. an Add to cart button on a mobile product page). Omit `for` for a permanently visible bar.

Common use cases: mobile product Add to cart, sticky save action on long forms, post-form newsletter signup, cookie banners, environment indicators, promo announcements.

<ElementSpec
  tag="l-sticky-bar"
  type="shadow"
/>

## Examples

### Mobile product page

The canonical use: an Add to cart CTA stays reachable while the customer scrolls product details. Each iframe below is its own document — the sticky bar paints in its top layer and `IntersectionObserver` resolves against the iframe's viewport, so production behavior is faithfully simulated.

Both demos start with the bar **revealed** (the Add to cart button sits below the fold). Scroll inside a phone to bring the button into view — the bar hides. Keep scrolling past the button — the bar reveals again.

<div class="phone-deck">
  <div class="phone">
    <span class="label">placement="bottom"</span>
    <iframe src="/previews/sticky-bar-mobile-bottom.html" title="Sticky bar — bottom placement"></iframe>
  </div>
  <div class="phone">
    <span class="label">placement="top"</span>
    <iframe src="/previews/sticky-bar-mobile-top.html" title="Sticky bar — top placement"></iframe>
  </div>
</div>

> The top phone uses `style="--offset: var(--header-height)"` to dock under the in-page sticky header — `--header-height` is defined once at `:root` and shared between the header's `height` and the bar's offset, so they stay in sync.

::: details Code
::: code-group
<<< @/.vitepress/examples/sticky-bar/StickyBarBasic.html [HTML]
:::

## Accessibility

The element is a positioning shell — it adds no role of its own. Slotted content keeps its native semantics: a `<button>` stays a button, a `<form>` stays a form, links remain in the focus order.

<AccessibilityTable :data="[
  { Check: 'Motion', Description: 'Respects `prefers-reduced-motion` — the slide animation collapses to instant', WCAG: '[WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)' },
  { Check: 'Focus order', Description: 'Slotted content stays in the natural focus order. Do not focus-trap inside the bar — it is not a dialog', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)' },
  { Check: 'Contrast', Description: 'The bar inherits text and background from slotted content — apply your own contrast tokens', WCAG: '[WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)' },
]" :rules="[
  'Keep the bar action self-explanatory (e.g. duplicate the in-page button label, do not introduce a new verb)',
  'Use `--offset` to clear a sticky header when `placement=&quot;top&quot;` to avoid overlap',
  'Do not nest live regions or modal-like behavior inside the bar',
]" />

## API reference

### Importing

::: code-group

```js [JS]
import 'luxen-ui/sticky-bar';
```

:::

### Attributes & Properties

<ApiTable :data="[
  { Attribute: 'for', Description: 'HTML id of the element to track. The bar reveals when it leaves the viewport. Omit for a permanently visible bar' },
  { Attribute: 'placement', Description: '`bottom` (default) or `top`. Edge to dock against' },
  { Attribute: 'root', Description: 'HTML id of the scrolling ancestor used as the IntersectionObserver root. Omit to use the viewport. Useful for nested scroll containers' },
]" />

### Events

<ApiTable :data="[
  { Event: 'show', Description: 'Fired before the bar reveals. Cancelable' },
  { Event: 'after-show', Description: 'Fired after the reveal animation completes' },
  { Event: 'hide', Description: 'Fired before the bar hides. Cancelable' },
  { Event: 'after-hide', Description: 'Fired after the hide animation completes' },
]" />

### Slots

<ApiTable :data="[
  { Slot: '(default)', Description: 'Bar content. Owns its own background, padding, and typography' },
]" />

### CSS custom properties

<ApiTable :data="[
  { Name: '--show-duration', Description: 'Reveal animation duration. Default `200ms`' },
  { Name: '--hide-duration', Description: 'Dismiss animation duration. Default `200ms`' },
  { Name: '--offset', Description: 'Distance from the active edge. Default `0px`. Use to clear a sticky header when `placement=&quot;top&quot;`' },
]" />

> **Top layer.** The bar uses `popover="manual"` internally, so it paints in the document's top layer — `z-index` is not needed and would be ignored. Target `l-sticky-bar:popover-open` to style the revealed state.
