---
aside: false
layout: doc
outline: deep
---

<IntroHero />

## What is Luxen UI?

Luxen UI is an HTML & CSS-first foundation for design systems — [rename the `l-` prefix](/overview/customizing-prefix) to ship it under your own name. It styles native HTML elements and extends HTML with Progressive Custom Elements (`<l-*>`) — light DOM by default, Shadow DOM only where it pays off. Accessibility is built in throughout.

Luxen elements come in four flavors, from zero-JavaScript native elements to fully encapsulated custom elements:

<ElementFlavors />

See each one in action — same HTML / CSS / JS pattern throughout:

<div class="my-6 rounded-xl border border-[var(--vp-c-divider)] divide-y divide-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-flavors" data-marker="arrow">
<summary class="vp-raw">Native element</summary>

::: code-group

```html [HTML]
<!-- A native element + a class. That's the whole component. -->
<button
  class="l-button"
  data-variant="primary"
>
  Save changes
</button>
```

```css [CSS]
@import 'luxen-ui/css/preset'; /* tokens + base, once */
@import 'luxen-ui/css/button';
```

```js [JS]
// None — native elements need no JavaScript.
```

:::

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-flavors" data-marker="arrow">
<summary class="vp-raw">Progressive Custom Element</summary>

::: code-group

```html [HTML]
<!-- Wraps a native <input> — usable as a plain field before JS upgrades it -->
<l-input-stepper>
  <input
    type="number"
    value="3"
    min="0"
    max="9"
  />
</l-input-stepper>
```

```css [CSS]
@import 'luxen-ui/css/preset';
@import 'luxen-ui/css/input-stepper/default';
```

```js [JS]
import 'luxen-ui/input-stepper';
```

:::

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-flavors" data-marker="arrow">
<summary class="vp-raw">Plain Custom Element</summary>

::: code-group

```html [HTML]
<!-- A new tag with no native equivalent, living in the light DOM -->
<l-badge variant="success">Active</l-badge>
```

```css [CSS]
@import 'luxen-ui/css/preset';
@import 'luxen-ui/css/badge';
```

```js [JS]
import 'luxen-ui/badge';
```

:::

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-flavors" data-marker="arrow">
<summary class="vp-raw">Shadow-DOM Custom Element</summary>

::: code-group

```html [HTML]
<!-- Encapsulated overlay; bring your own trigger -->
<button
  id="save"
  class="l-button"
>
  Save
</button>
<l-tooltip for="save">Saves your changes</l-tooltip>
```

```css [CSS]
@import 'luxen-ui/css/preset'; /* the tooltip's styles ship inside its JS */
```

```js [JS]
import 'luxen-ui/tooltip';
```

:::

</details>

</div>

<style>
/* Flavor accent per type — shared by grid cells and inline legend pills */
.luxen-tag {
  --tag-accent: var(--vp-c-brand-1);
  text-decoration: none !important;
}
.luxen-tag[data-type='native'] {
  --tag-accent: #0e9f6e;
}
.luxen-tag[data-type='progressive'] {
  --tag-accent: #2563eb;
}
.luxen-tag[data-type='custom'] {
  --tag-accent: #9333ea;
}
.luxen-tag[data-type='shadow'] {
  --tag-accent: #dc2626;
}
.dark .luxen-tag[data-type='native'] {
  --tag-accent: #34d399;
}
.dark .luxen-tag[data-type='progressive'] {
  --tag-accent: #60a5fa;
}
.dark .luxen-tag[data-type='custom'] {
  --tag-accent: #c084fc;
}
.dark .luxen-tag[data-type='shadow'] {
  --tag-accent: #f87171;
}

/* Inline legend pills (in the paragraph, not the grid) */
.vp-doc .luxen-tag:not(.html-elements-list *) code {
  color: var(--tag-accent);
  font-weight: 600;
  font-size: 0.78em;
  padding: 3px 9px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--tag-accent) 11%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag-accent) 28%, transparent);
}

/* Element grid — uniform cells, flavor as a corner dot */
.html-elements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(138px, 1fr));
  gap: 5px;
}
.html-elements-list > code,
.html-elements-list > .luxen-tag {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 34px;
  padding: 2px 7px;
  border-radius: 7px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.html-elements-list > .luxen-tag {
  color: var(--tag-accent);
  font-weight: 600;
  background: color-mix(in srgb, var(--tag-accent) 11%, transparent);
  border-color: color-mix(in srgb, var(--tag-accent) 30%, transparent);
}
.html-elements-list > .luxen-tag code {
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: inherit;
}
.html-elements-list > .luxen-tag::after {
  position: absolute;
  top: 3px;
  right: 5px;
  font-size: 9px;
  line-height: 1;
  color: var(--tag-accent);
}
.html-elements-list > .luxen-tag[data-type='native']::after {
  content: '⏣';
}
.html-elements-list > .luxen-tag[data-type='progressive']::after {
  content: '⬡';
}
.html-elements-list > .luxen-tag[data-type='custom']::after {
  content: '◇';
}
.html-elements-list > .luxen-tag[data-type='shadow']::after {
  content: '⬢';
}
.html-elements-list > .luxen-tag:hover {
  background: var(--tag-accent);
  border-color: var(--tag-accent);
  color: #fff;
}
.html-elements-list > .luxen-tag:hover::after {
  color: rgba(255, 255, 255, 0.9);
}
.feature-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}
.feature-chips code {
  font-size: 0.78em;
  padding: 4px 11px;
  border-radius: 999px;
  background: color-mix(in srgb, #0e9f6e 9%, var(--vp-c-bg-soft));
  border: 1px solid color-mix(in srgb, #0e9f6e 30%, var(--vp-c-divider));
  color: var(--vp-c-text-1);
  font-weight: 500;
}
.feature-chips + .feature-chips-caption {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.lede-synthesis {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
</style>

Every HTML element — the highlighted ones are styled or extended by Luxen, each tinted by its flavor (<span class="luxen-tag" data-type="native"><code>Native</code></span> <span class="luxen-tag" data-type="progressive"><code>Progressive</code></span> <span class="luxen-tag" data-type="custom"><code>Plain</code></span> <span class="luxen-tag" data-type="shadow"><code>Shadow-DOM</code></span>).

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
<a class="luxen-tag" data-type="native" href="/elements/button"><code>&lt;button&gt;</code></a>
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
<a class="luxen-tag" data-type="native" href="/elements/disclosure"><code>&lt;details&gt;</code></a>
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
<code>&lt;h1&gt;</code>
<code>&lt;h2&gt;</code>
<code>&lt;h3&gt;</code>
<code>&lt;h4&gt;</code>
<code>&lt;h5&gt;</code>
<code>&lt;h6&gt;</code>
<code>&lt;head&gt;</code>
<code>&lt;header&gt;</code>
<code>&lt;hgroup&gt;</code>
<code>&lt;hr&gt;</code>
<code>&lt;html&gt;</code>
<code>&lt;i&gt;</code>
<code>&lt;iframe&gt;</code>
<code>&lt;img&gt;</code>
<a class="luxen-tag" data-type="progressive" href="/elements/input-otp"><code>&lt;input&gt;</code></a>
<code>&lt;ins&gt;</code>
<a class="luxen-tag" data-type="native" href="/elements/kbd"><code>&lt;kbd&gt;</code></a>
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
<a class="luxen-tag" data-type="native" href="/elements/progress"><code>&lt;progress&gt;</code></a>
<code>&lt;q&gt;</code>
<code>&lt;rp&gt;</code>
<code>&lt;rt&gt;</code>
<code>&lt;ruby&gt;</code>
<code>&lt;s&gt;</code>
<code>&lt;samp&gt;</code>
<code>&lt;script&gt;</code>
<code>&lt;search&gt;</code>
<code>&lt;section&gt;</code>
<a class="luxen-tag" data-type="native" href="/elements/select"><code>&lt;select&gt;</code></a>
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
<a class="luxen-tag" data-type="shadow" href="/elements/avatar"><code>&lt;l-avatar&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/badge"><code>&lt;l-badge&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/button-group"><code>&lt;l-button-group&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/carousel"><code>&lt;l-carousel&gt;</code></a>
<a class="luxen-tag" data-type="shadow"><code>&lt;l-carousel-item&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/dialog"><code>&lt;l-dialog&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/divider"><code>&lt;l-divider&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/icon"><code>&lt;l-icon&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/dropdown"><code>&lt;l-dropdown&gt;</code></a>
<a class="luxen-tag" data-type="shadow"><code>&lt;l-dropdown-item&gt;</code></a>
<a class="luxen-tag" data-type="shadow"><code>&lt;l-dropdown-label&gt;</code></a>
<a class="luxen-tag" data-type="progressive" href="/elements/form-field"><code>&lt;l-form-field&gt;</code></a>
<a class="luxen-tag" data-type="progressive" href="/elements/input-otp"><code>&lt;l-input-otp&gt;</code></a>
<a class="luxen-tag" data-type="progressive" href="/elements/input-stepper"><code>&lt;l-input-stepper&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/popover"><code>&lt;l-popover&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/prose-editor"><code>&lt;l-prose-editor&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/rating"><code>&lt;l-rating&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/skeleton"><code>&lt;l-skeleton&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/spinner"><code>&lt;l-spinner&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/sticky-bar"><code>&lt;l-sticky-bar&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/stories"><code>&lt;l-stories&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/story"><code>&lt;l-story&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/stories-viewer"><code>&lt;l-stories-viewer&gt;</code></a>
<a class="luxen-tag" data-type="progressive" href="/elements/tabs"><code>&lt;l-tabs&gt;</code></a>
<a class="luxen-tag" data-type="custom" href="/elements/toast"><code>&lt;l-toast&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/tooltip"><code>&lt;l-tooltip&gt;</code></a>
<a class="luxen-tag" data-type="shadow" href="/elements/tree"><code>&lt;l-tree&gt;</code></a>
<a class="luxen-tag" data-type="shadow"><code>&lt;l-tree-item&gt;</code></a>
</div>

## A hybrid Light / Shadow DOM approach

Most web component libraries render every component into its own shadow root — even when a native element already exists.

<p class="lede-synthesis">Luxen treats <strong>Shadow DOM as a tool, not an architecture</strong>. It styles native elements, ships light-DOM custom elements, and reserves Shadow DOM for the few components that genuinely need encapsulation. Most of the library is plain HTML your server renders and your CSS can reach — nothing to hydrate, no shadow boundary in the way.</p>

<SsrPipelines />

<div class="my-6 rounded-xl border border-[var(--vp-c-divider)] divide-y divide-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">The platform caught up</summary>

Each of these used to justify a JavaScript component. Today it's HTML and CSS:

<div class="vp-raw feature-chips">
<code>&lt;dialog&gt;</code>
<code>popover</code>
<code>invokers (command/commandfor)</code>
<code>::picker(select)</code>
<code>::details-content</code>
<code>@scope</code>
<code>@starting-style</code>
<code>light-dark()</code>
<code>anchor positioning</code>
<code>ElementInternals</code>
</div>

So Luxen styles native elements first (`.l-button` on `<button>`, `.l-select` on `<select>`, `.l-disclosure` on `<details>`), wraps natives to add behavior (`<l-input-stepper>` around `<input type="number">`), and ships new tags only where HTML has no answer.

```html
<!-- A native accordion — the one powering this very FAQ. No JS component. -->
<details
  class="l-disclosure"
  data-marker="arrow"
>
  <summary>Toggle</summary>
  <div>Revealed on open, animated in pure CSS.</div>
</details>
```

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Composition over encapsulation</summary>

HTML is composition, and Luxen keeps it that way — [`<l-form-field>`](/elements/form-field) wraps _your_ `<input>`, [`<l-tabs>`](/elements/tabs) upgrades _your_ buttons and panels, [`<l-button-group>`](/elements/button-group) groups real `<button>`s. The tree you compose is the tree that renders, instead of being projected into hidden markup behind a shadow boundary.

::: code-group

```html [Form field]
<l-form-field>
  <label for="email">Email</label>
  <input
    id="email"
    type="email"
    name="email"
  />
</l-form-field>
```

```html [Button group]
<l-button-group label="Alignment">
  <button class="l-button">Left</button>
  <button class="l-button">Center</button>
  <button class="l-button">Right</button>
</l-button-group>
```

```html [Tabs]
<l-tabs variant="line">
  <div>
    <button name="account">Account</button>
    <button name="password">Password</button>
  </div>
  <div>Make changes to your account here.</div>
  <div>Change your password here.</div>
</l-tabs>
```

```html [Stepper]
<l-input-stepper>
  <input
    type="number"
    min="0"
    max="10"
    value="5"
  />
</l-input-stepper>
```

:::

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Server rendering, no hydration</summary>

The ecosystem moved back to the server: Astro, Nuxt, React Server Components, HTMX. A 100% Shadow DOM library has to _retrofit_ SSR — Declarative Shadow DOM serialization, per-framework plugins, dedicated hydration loaders, strict ordering rules — and even then hydrates late, shifting layout and flashing invisible content on the way.

Luxen dissolves the problem instead. For native, progressive and light-DOM elements — most of the library — the HTML your server sends **is** the final page: it renders inside React Server Components, holds its layout before any script runs, and leaves nothing to serialize, hydrate, or flash.

```html
<!-- The exact bytes your server sends — styled and final, zero hydration -->
<button
  class="l-button"
  data-variant="primary"
>
  Save
</button>
<progress
  class="l-progress"
  value="0.7"
  aria-label="Saving…"
></progress>
```

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Third-party tools see the real DOM</summary>

Analytics, A/B testing tools and browser extensions hook into the page with CSS selectors and DOM queries that stop at a shadow boundary — a closed shadow root is opaque to them, and even open ones need deliberate traversal most tools skip. Luxen renders into the light DOM, so the tooling around your app targets the same nodes the user interacts with: trackers fire where they expect, and A/B editors restyle real elements instead of an unreachable shell.

```html
<!-- A real light-DOM node — your analytics selector matches it directly -->
<button
  class="l-button"
  data-analytics="signup"
>
  Sign up
</button>
```

```js
// No shadow root to pierce — the element is right there in the document
document.querySelector('[data-analytics="signup"]');
```

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Forms stay native</summary>

Browser autofill, password managers, constraint validation and screen readers work unmediated — no `ElementInternals` emulation layer between the user and the control. Cross-shadow-root ARIA references (a label pointing at an input inside another root) remain an unsolved platform problem; Luxen sidesteps it entirely: [`<l-form-field>`](/elements/form-field) wires `for`, `id` and `aria-describedby` between real nodes in the same DOM tree. `ElementInternals` appears only where no native control exists, like [`<l-rating>`](/elements/rating).

```html
<form>
  <l-form-field>
    <label for="email">Email</label>
    <!-- A real <input>: autofill, :invalid, required and submit all just work -->
    <input
      id="email"
      type="email"
      name="email"
      required
    />
  </l-form-field>
  <button
    class="l-button"
    type="submit"
  >
    Subscribe
  </button>
</form>
```

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Styled with plain CSS</summary>

Light DOM means the DOM you see in DevTools is the real DOM. Style Luxen elements with plain CSS, your own design tokens, or Tailwind utilities — no waiting for the library to expose the right `::part()`. Customization is layered: design tokens (`--l-*`) → per-element CSS custom properties → ordinary selectors, in that order of preference.

```css
/* Ordinary selectors — no ::part(), no shadow boundary to cross */
.l-button {
  --size: 2.75rem; /* public per-element custom property */
}

l-badge[variant='success'] {
  background: var(--l-color-green-100);
}
```

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent [&:first-child_summary]:rounded-t-[11px] [&:last-child_summary]:rounded-b-[11px] *:px-4" name="luxen-approach" data-marker="arrow">
<summary class="vp-raw">Where Shadow DOM earns its place</summary>

This is not a crusade against Shadow DOM. Tooltips, dialogs, dropdowns and trees have internal structure that nothing should index and no server needs to render — a closed tooltip has no SEO value. There, encapsulation is the right tool, and Luxen uses it, with `:not(:defined)` rules so overlays never flash before they upgrade.

The honest converse: if you ship widgets into pages you don't control — third-party embeds, hostile global CSS — a fully encapsulated library is the better fit. Luxen is built for products where you own your page.

```html
<!-- Shadow DOM where it earns it: an encapsulated overlay, no SSR needed -->
<button
  id="save"
  class="l-button"
>
  Save
</button>
<l-tooltip for="save">Saves your changes</l-tooltip>
```

</details>

</div>

## White-label and extend

A design system has a name — and it isn't "Luxen". Luxen is the base you start from, not the brand you ship under. One config file renames every `l-` identifier it generates — tags, CSS classes, custom properties, keyframes, runtime IDs — to yours, rewritten at build time with zero runtime cost.

<WhiteLabelRename />

```js [luxen.config.mjs]
import { defineConfig } from 'luxen-ui';

export default defineConfig({
  elementPrefix: 'acme', //  <l-badge>  →  <acme-badge>
  cssPrefix: 'acme', //  .l-button  →  .acme-button
});
```

<div class="my-6 rounded-xl border border-[var(--vp-c-divider)] divide-y divide-[var(--vp-c-divider)] bg-[var(--vp-c-bg-soft)]">

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent *:px-4" name="luxen-whitelabel" data-marker="arrow">
<summary class="vp-raw">One namespace for Luxen and your own components</summary>

Your own custom elements live under the same prefix. `<acme-badge>` (from Luxen) and `<acme-map>` (yours) read as a single, coherent system — no `l-*` seams showing through someone else's library. The [generated type map](/overview/customizing-prefix#typescript-types) is yours to edit: drop elements you don't use, add your own.

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent *:px-4" name="luxen-whitelabel" data-marker="arrow">
<summary class="vp-raw">Start on Luxen, eject when you outgrow it</summary>

Luxen is a starting point, not a lock-in. When an element no longer fits your needs, stop using it and ship your own custom element in its place — same prefix, same design tokens, same conventions. The swap is invisible to the rest of your code; consistency survives it.

</details>

<details class="l-disclosure open:relative open:z-10 open:rounded-xl open:bg-[color:var(--vp-c-bg)] open:ring-1 open:ring-[color:var(--vp-c-brand-1)] open:shadow-[0_10px_34px_-12px_var(--vp-c-brand-soft)] [&[open]_summary]:hover:bg-transparent *:px-4" name="luxen-whitelabel" data-marker="arrow">
<summary class="vp-raw">Extensible and customizable by design</summary>

Theming is layered and standards-based: design tokens (`--l-*`) for the global system, per-element CSS custom properties for local overrides, `data-*` attributes for variants, and `::part()` where a component uses Shadow DOM.

</details>

</div>

Full setup, TypeScript types, and Vue/Nuxt strict-template support: [Customizing the prefix](/overview/customizing-prefix).
