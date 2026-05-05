---
'luxen-ui': minor
---

New `<l-sticky-bar>` element — a bar docked to the viewport edge, painted in the document's **top layer** via the native `popover` attribute. Pass `for="<id>"` to track an element (e.g. an Add to cart button on a mobile product page) and the bar slides in once that element leaves the viewport. Omit `for` to keep the bar permanently visible — useful for cookie banners, promo announcements, environment indicators. Set `placement="top"` to dock against the top edge instead of the bottom; `--offset` clears a sticky header. An optional `root="<id>"` scopes the IntersectionObserver to a scrolling ancestor (CMS preview panes, modals). Animations honor `prefers-reduced-motion` and tune via `--show-duration`, `--hide-duration`, `--offset`. Style the revealed state via `l-sticky-bar:popover-open`.

```html
<button
  id="add-to-cart"
  class="l-button"
  data-variant="primary"
>
  Add to cart — €42
</button>

<l-sticky-bar for="add-to-cart">
  <div class="...">Magic Mouse — €42 / Add to cart</div>
</l-sticky-bar>
```
