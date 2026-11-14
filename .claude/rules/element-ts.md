---
paths:
  - 'packages/ui/src/html/**/*.ts'
---

# Element TypeScript

How to write the Lit side of an element in `packages/ui/src/html/`. Element
types and the JSDoc metadata every public API change must keep in sync are in
`packages/ui/AGENTS.md`; styling rules are in `.claude/rules/element-css.md`.

## Structure

```
src/html/elements/
  popover/
    popover.ts     ← the class, its JSDoc metadata, its event classes
    popover.css    ← shadow styles (shadow elements only), imported `?inline`
    index.ts       ← define('popover', Popover) + re-export
  button/
    button.meta.ts ← native element: JSDoc-only metadata carrier, no class logic
```

- **Base class**: extend `LuxenElement` (`shared/luxen-element.ts`), never
  `LitElement` directly. A form control extends `LuxenFormAssociatedElement`
  (`shared/luxen-form-associated-element.ts`), which owns `ElementInternals`,
  the validity API, the form callbacks and the `:state()` custom states — call
  `_syncFormValue()` whenever the value changes.
- **Registration**: `index.ts` calls `define(baseName, Class)` from
  `src/html/define.ts`. No `@customElement()` decorator — the class carries a
  `@customElement l-<name>` JSDoc tag for the manifest instead.
- **Light DOM** (`custom` / `progressive`): `createRenderRoot() { return this; }`.
- **Set up light-DOM markup synchronously**, with a `setTimeout` fallback when
  children may arrive late. Never wait on `requestAnimationFrame`: it does not
  fire in a hidden tab.
- **Shared behavior** lives in reactive controllers under
  `shared/controllers/` (`popover.ts` for floating positioning and show/hide
  animation, `listbox-nav.ts`, `has-slot-controller.ts`).
- **No property for a visual-only knob.** Size, radius, gap and the like are
  CSS custom properties, not `@property` fields. A property earns its place
  when it changes behavior, semantics or a fixed set of variants.
- **Reflect** (`@property({ reflect: true })`) only what CSS or the consumer
  must see as an attribute; internal state is `@state()`.
- Remove in `disconnectedCallback()` every listener added outside the element's
  own subtree.

## Events

Elements dispatch **typed `Event` subclasses**, never `CustomEvent` and never a
generic `emit()` helper. There is no `emit()` on `LuxenElement` —
`dispatchEvent(new HideEvent())` already returns `false` when a cancelable event
was prevented, which is all the call sites need.

Conventions:

- **Names are unprefixed and brand-neutral** (`show`, `hide`, `change`,
  `select`…) — never `l-`-prefixed. This keeps events white-label by
  construction (no prefix to rewrite). A future collision with a new platform
  event is an accepted risk; the fix then is a rename + breaking change.
- **Payload lives in direct `readonly` properties, not `detail`** — mirror the
  platform (`ToggleEvent.newState`, `SubmitEvent.submitter`). e.g.
  `event.index`, `event.story`, `event.toast`.
- **One class per event semantic.** Shared overlay-lifecycle classes
  (`ShowEvent`, `AfterShowEvent`, `HideEvent`, `AfterHideEvent`) live in
  `src/html/events/` and are reused by dialog/drawer/dropdown/sticky-bar/
  stories-viewer/toast (toast subclasses them to add `toast`). Element-specific
  classes are defined and exported in the element's own `.ts` file.
- **Propagation follows the platform** (set in the class constructor, not at the
  call site, so it can't drift):
  - Lifecycle (`show`/`hide`/`after-*`, `expand`/`collapse`): `bubbles: false,
    composed: false` — listen on the element itself (like `toggle`/`close`).
  - Value/change (`change`, `select`): `bubbles: true, composed: false` — like
    native `change` (bubbles, but does not cross shadow boundaries).
  - Informational/media-like (`story-*`, `mute-change`, `slides-in-view`,
    `selection-change`…): `bubbles: false, composed: false`.
  - Internal parent↔child contracts (tree-item → tree `selection-toggle`):
    `bubbles: true` so they reach the container; not part of the public API
    (no `@event` tag).
- **`show` and `hide` are cancelable everywhere.** A vetoed `show`/`hide` must
  revert the driving property via `queueMicrotask`, never inside `updated()`
  (avoids scheduling a Lit update from within an update — see the dialog/
  stories-viewer pattern).
- **TypeScript typing.** For names that do **not** collide with lib.dom
  (`show`, `hide`, `after-*`, `expand`, `story-change`…), augment
  `GlobalEventHandlersEventMap` in the event-class module so listeners are typed
  everywhere. For names that **do** collide (`change`, `select`, `input`,
  `toggle`), you cannot augment the global map — instead declaration-merge typed
  `addEventListener`/`removeEventListener` overloads onto the element interface
  (see `tabs.ts`). That interface merge must come **after** the class
  declaration (CEM dedups on the first declaration of the name — an interface
  before the class shadows it and the manifest extracts nothing), and carries an
  `// oxlint-disable-next-line typescript/no-unsafe-declaration-merging` on the
  class.
- **Native passthrough stays native.** `l-select`'s `change`/`input` and
  `l-disclosure`'s `toggle` are the platform's own events — do not wrap or
  rename them.
- Keep the `@event` JSDoc tag in sync (the word `Cancelable`/`Not cancelable` is
  parsed into metadata; describe the payload as `Properties: …`, and note
  `Bubbles.` when non-default).

## Renameable Prefix (`l-` is never hardcoded)

The `l-` prefix is a **default, not a constant**. Consumers rebrand it via
`luxen.config.mjs` (`elementPrefix` / `cssPrefix`), so element source must
**derive** every tag and class name from the registry — never bake `l-` into a
string literal or a type.

- **Tag names → `tagName(baseName)`** from `registry.js`. Any `closest()`,
  `querySelector()`, `createElement()`, `matches()`, or `el.tagName === …`
  comparison that targets an `l-*` element must go through `tagName('story')`
  (and `.toUpperCase()` for `tagName` comparisons), like `dropdown` / `tree` do.
  Never `closest('l-story')` or `=== 'L-STORIES-VIEWER'`.
- **Internal CSS classes → `cls(name)`** from `registry.js`, in **both**
  imperative code (`el.className = cls('toast-icon')`, like `toast` / `slider`)
  and Lit templates (`class=${cls('story-thumb')}`, like `story` / `tree-item`).
  There is no tolerated static `class="l-…"` literal. The vite-plugin's
  `transform` hook rewrites **only** the two `_cssPrefix` / `_elementPrefix`
  initialisers in `registry.js` — it never touches template literals in element
  JS. Meanwhile the CSS carrying the matching selector (`src/css/elements/*.css`
  for light DOM, `shared/styles/*.css` imported `?inline` for shadow DOM) ships
  to `dist/` as real CSS, so the **consumer's** Vite runs
  `postcss-plugin-prefix` over it and rewrites `.l-checkbox` →
  `.<cssPrefix>-checkbox`. A hardcoded class attribute therefore desyncs from
  its own stylesheet and the element renders unstyled under any renamed prefix —
  silently, since nothing in this repo's build exercises a non-default prefix.
  `cls()` is a no-op at the default `l` prefix, so binding costs nothing.
- **Never augment the global `HTMLElementTagNameMap` (or Vue's
  `GlobalComponents`) in element source.** A `declare global { interface
  HTMLElementTagNameMap { 'l-foo': Foo } }` block hardcodes `l-` and is wrong
  under any non-default prefix. Consumer-side typing is emitted **dynamically,
  with the configured prefix**, by the Vite plugin's `emitTypes` option (see
  `LuxenEmitTypesConfig` in `src/html/config.ts`) — the library must not ship a
  fixed-prefix augmentation. Typed event listeners still use the
  declaration-merged `interface Foo { addEventListener… }` pattern (see
  `tabs.ts` / `alert-dialog.ts`); that merge carries no tag-name key, so it's
  fine.

Rule of thumb: if you typed the characters `l-` (or `L-`) anywhere in a `.ts`
file outside a JSDoc tag or a code comment, it's a bug against rebranding —
route it through `tagName()` / `cls()` instead.

## Element Styles (Shadow DOM)

Shadow-DOM elements load their styles from real `.css` files imported via Vite's `?inline` query, not from Lit `css\`...\``templates. This lets the consumer's`luxen-ui/vite-plugin`rewrite`--l-\*` tokens at build time — there is no runtime token-prefix mechanism.

Two patterns, picked by reuse:

**Element-private CSS** — the file is imported by exactly one element. Inline the `unsafeCSS()` call in the element file:

```ts
// popover.ts
import { unsafeCSS } from 'lit';
import hostStyles from '../../shared/styles/host.styles';
import rawStyles from './popover.css?inline';

const styles = unsafeCSS(rawStyles);

export class Popover extends LuxenElement {
  static override styles = [hostStyles, styles];
}
```

**Shared CSS** — the file is imported by 2+ elements (e.g. `host.css`, `dialog.css` shared by `dialog` + `drawer`). Wrap it in a `*.styles.ts` module that calls `unsafeCSS()` once, so all importers share the same `CSSResult` (one constructed `CSSStyleSheet`, not one per importer — avoids [WebAwesome #1812](https://github.com/shoelace-style/webawesome/issues/1812)):

```ts
// dialog.styles.ts
import { unsafeCSS } from 'lit';
import raw from './dialog.css?inline';
export default unsafeCSS(raw);
```

Rule: never call `unsafeCSS()` at the consumption site for a shared CSS file. Always wrap shared CSS in a single module. Element-private CSS is fine to inline because there is only ever one consumer.
