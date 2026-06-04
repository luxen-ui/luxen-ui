---
aside: false
layout: doc
outline: deep
---

<IntroHero />

## What is Luxen UI?

Luxen UI is an HTML & CSS-first UI library that styles native HTML elements or extends HTML with Progressive Custom Elements (`<l-*>`). Light DOM first, Shadow DOM only when needed.

<style>
.html-elements-list a {
  display: contents;
}
.html-elements-list code {
  font-size: 0.8em;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.luxen-tag {
  text-decoration: none !important;
}
.luxen-tag code {
  color: var(--vp-c-text-1);
  font-weight: 500;
  border-color: var(--vp-c-text-3);
}
.luxen-tag:hover code {
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}
</style>

Elements in <a class="luxen-tag"><code>bold</code></a> are styled or extended by Luxen.

<div class="vp-raw html-elements-list flex flex-wrap gap-1.5 leading-none">
<code>&lt;a&gt;</code>
<code>&lt;abbr&gt;</code>
<code>&lt;address&gt;</code>
<code>&lt;area&gt;</code>
<code>&lt;article&gt;</code>
<code>&lt;aside&gt;</code>
<code>&lt;audio&gt;</code>
<code>&lt;b&gt;</code>
<code>&lt;base&gt;</code>
<code>&lt;bdi&gt;</code>
<code>&lt;bdo&gt;</code>
<code>&lt;blockquote&gt;</code>
<code>&lt;body&gt;</code>
<code>&lt;br&gt;</code>
<a class="luxen-tag" href="/elements/button"><code>&lt;button&gt;</code></a>
<code>&lt;canvas&gt;</code>
<code>&lt;caption&gt;</code>
<code>&lt;cite&gt;</code>
<code>&lt;code&gt;</code>
<code>&lt;col&gt;</code>
<code>&lt;colgroup&gt;</code>
<code>&lt;data&gt;</code>
<code>&lt;datalist&gt;</code>
<code>&lt;dd&gt;</code>
<code>&lt;del&gt;</code>
<a class="luxen-tag" href="/elements/disclosure"><code>&lt;details&gt;</code></a>
<code>&lt;dfn&gt;</code>
<code>&lt;dialog&gt;</code>
<code>&lt;div&gt;</code>
<code>&lt;dl&gt;</code>
<code>&lt;dt&gt;</code>
<code>&lt;em&gt;</code>
<code>&lt;embed&gt;</code>
<code>&lt;fieldset&gt;</code>
<code>&lt;figcaption&gt;</code>
<code>&lt;figure&gt;</code>
<code>&lt;footer&gt;</code>
<code>&lt;form&gt;</code>
<code>&lt;h1&gt;</code>–<code>&lt;h6&gt;</code>
<code>&lt;head&gt;</code>
<code>&lt;header&gt;</code>
<code>&lt;hgroup&gt;</code>
<code>&lt;hr&gt;</code>
<code>&lt;html&gt;</code>
<code>&lt;i&gt;</code>
<code>&lt;iframe&gt;</code>
<code>&lt;img&gt;</code>
<a class="luxen-tag" href="/elements/input-otp"><code>&lt;input&gt;</code></a>
<code>&lt;ins&gt;</code>
<a class="luxen-tag" href="/elements/kbd"><code>&lt;kbd&gt;</code></a>
<code>&lt;label&gt;</code>
<code>&lt;legend&gt;</code>
<code>&lt;li&gt;</code>
<code>&lt;link&gt;</code>
<code>&lt;main&gt;</code>
<code>&lt;map&gt;</code>
<code>&lt;mark&gt;</code>
<code>&lt;math&gt;</code>
<code>&lt;menu&gt;</code>
<code>&lt;meta&gt;</code>
<code>&lt;meter&gt;</code>
<code>&lt;nav&gt;</code>
<code>&lt;noscript&gt;</code>
<code>&lt;object&gt;</code>
<code>&lt;ol&gt;</code>
<code>&lt;optgroup&gt;</code>
<code>&lt;option&gt;</code>
<code>&lt;output&gt;</code>
<code>&lt;p&gt;</code>
<code>&lt;picture&gt;</code>
<code>&lt;portal&gt;</code>
<code>&lt;pre&gt;</code>
<a class="luxen-tag" href="/elements/progress"><code>&lt;progress&gt;</code></a>
<code>&lt;q&gt;</code>
<code>&lt;rp&gt;</code>
<code>&lt;rt&gt;</code>
<code>&lt;ruby&gt;</code>
<code>&lt;s&gt;</code>
<code>&lt;samp&gt;</code>
<code>&lt;script&gt;</code>
<code>&lt;search&gt;</code>
<code>&lt;section&gt;</code>
<a class="luxen-tag" href="/elements/select"><code>&lt;select&gt;</code></a>
<code>&lt;slot&gt;</code>
<code>&lt;small&gt;</code>
<code>&lt;source&gt;</code>
<code>&lt;span&gt;</code>
<code>&lt;strong&gt;</code>
<code>&lt;style&gt;</code>
<code>&lt;sub&gt;</code>
<code>&lt;summary&gt;</code>
<code>&lt;sup&gt;</code>
<code>&lt;svg&gt;</code>
<code>&lt;table&gt;</code>
<code>&lt;tbody&gt;</code>
<code>&lt;td&gt;</code>
<code>&lt;template&gt;</code>
<code>&lt;textarea&gt;</code>
<code>&lt;tfoot&gt;</code>
<code>&lt;th&gt;</code>
<code>&lt;thead&gt;</code>
<code>&lt;time&gt;</code>
<code>&lt;title&gt;</code>
<code>&lt;tr&gt;</code>
<code>&lt;track&gt;</code>
<code>&lt;u&gt;</code>
<code>&lt;ul&gt;</code>
<code>&lt;var&gt;</code>
<code>&lt;video&gt;</code>
<code>&lt;wbr&gt;</code>
·
<a class="luxen-tag" href="/elements/avatar"><code>&lt;l-avatar&gt;</code></a>
<a class="luxen-tag" href="/elements/badge"><code>&lt;l-badge&gt;</code></a>
<a class="luxen-tag" href="/elements/carousel"><code>&lt;l-carousel&gt;</code></a>
<a class="luxen-tag"><code>&lt;l-carousel-item&gt;</code></a>
<a class="luxen-tag" href="/elements/dialog"><code>&lt;l-dialog&gt;</code></a>
<a class="luxen-tag" href="/elements/divider"><code>&lt;l-divider&gt;</code></a>
<a class="luxen-tag" href="/elements/icon"><code>&lt;l-icon&gt;</code></a>
<a class="luxen-tag" href="/elements/dropdown"><code>&lt;l-dropdown&gt;</code></a>
<a class="luxen-tag"><code>&lt;l-dropdown-item&gt;</code></a>
<a class="luxen-tag"><code>&lt;l-dropdown-label&gt;</code></a>
<a class="luxen-tag" href="/elements/form-field"><code>&lt;l-form-field&gt;</code></a>
<a class="luxen-tag" href="/elements/input-otp"><code>&lt;l-input-otp&gt;</code></a>
<a class="luxen-tag" href="/elements/input-stepper"><code>&lt;l-input-stepper&gt;</code></a>
<a class="luxen-tag" href="/elements/popover"><code>&lt;l-popover&gt;</code></a>
<a class="luxen-tag" href="/elements/prose-editor"><code>&lt;l-prose-editor&gt;</code></a>
<a class="luxen-tag" href="/elements/rating"><code>&lt;l-rating&gt;</code></a>
<a class="luxen-tag" href="/elements/skeleton"><code>&lt;l-skeleton&gt;</code></a>
<a class="luxen-tag" href="/elements/spinner"><code>&lt;l-spinner&gt;</code></a>
<a class="luxen-tag" href="/elements/sticky-bar"><code>&lt;l-sticky-bar&gt;</code></a>
<a class="luxen-tag" href="/elements/stories"><code>&lt;l-stories&gt;</code></a>
<a class="luxen-tag" href="/elements/story"><code>&lt;l-story&gt;</code></a>
<a class="luxen-tag" href="/elements/stories-viewer"><code>&lt;l-stories-viewer&gt;</code></a>
<a class="luxen-tag" href="/elements/tabs"><code>&lt;l-tabs&gt;</code></a>
<a class="luxen-tag" href="/elements/toast"><code>&lt;l-toast&gt;</code></a>
<a class="luxen-tag" href="/elements/tooltip"><code>&lt;l-tooltip&gt;</code></a>
<a class="luxen-tag" href="/elements/tree"><code>&lt;l-tree&gt;</code></a>
<a class="luxen-tag"><code>&lt;l-tree-item&gt;</code></a>
</div>

Luxen elements come in four flavors: ⏣ **Native HTML Elements** are standard HTML elements styled purely with CSS, no JavaScript needed. ⬡ **Progressive Custom HTML Elements** wrap a native element like `<input>` or `<button>` to upgrade it with richer behavior while keeping the underlying HTML usable without JavaScript. ◇ **Custom HTML Elements (no Shadow DOM)** are new tags declared in HTML that live in the light DOM without wrapping any native element. ⬢ **Custom HTML Elements with Shadow DOM** encapsulate their rendering for UI patterns where server-side rendering is not required.

<ElementTypeGrid />

::: code-group

```html [Popover]
<button
  id="edit-btn"
  class="l-button"
>
  Edit
</button>

<l-popover for="edit-btn">
  <p class="px-4 py-3">Popover content here.</p>
</l-popover>
```

```html [Disclosure]
<details
  class="l-disclosure"
  data-variant="bordered"
  data-marker="arrow"
>
  <summary>Toggle</summary>
  <div>Content</div>
</details>
```

```html [Input Stepper]
<l-input-stepper>
  <input
    type="number"
    min="0"
    max="10"
    value="5"
  />
</l-input-stepper>
```

```html [Close Button]
<button
  type="button"
  aria-label="Close"
  class="l-close"
  data-appearance="ring"
  command="close"
  commandfor="target-identifier"
></button>
```

:::
