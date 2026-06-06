# luxen-ui

## 0.9.3

### Patch Changes

- bffa311: Fix `<l-tree-item>` clipping the hover/focus decoration of interactive controls
  placed in its default slot. The label box still truncates long text to an
  ellipsis, but it now uses `overflow: clip` with a small `overflow-clip-margin`
  so a row-action button or `<l-dropdown>` trigger keeps its full focus ring and
  hover background instead of having them cut off at the row edges.

## 0.9.2

### Patch Changes

- b597b7c: `<l-dropdown-item>` labels now stay left-aligned regardless of the surrounding `text-align`. Previously, placing a dropdown inside a right-aligned container (such as an actions column in a data grid) pushed each menu item's text to the right, away from its prefix icon. The item's internal layout is now pinned to `text-align: start`.
- 23c7cc9: Improve `<l-tree>` / `<l-tree-item>` accessibility. The tree host now carries
  `role="tree"` (give it an accessible name via `aria-label`), items expose
  `aria-level`/`aria-setsize`/`aria-posinset` and `aria-busy` while loading, and
  the decorative checkbox is hidden from assistive tech. Roles and ARIA states are
  also mirrored to DOM attributes, so `[role]` and `[aria-*]` selectors (CSS,
  `querySelector`, Cypress/Playwright) and `getByRole` state filters keep matching.
- ea38046: Fix `<l-tree-item lazy>` not requesting its children when expanded with the
  keyboard. The `lazy-load` event is now emitted on any expand (arrow keys,
  `expandAll()`, the `*` shortcut), not only when toggled by pointer, and
  activating a branch with Enter/Space in single-selection mode now expands it
  too — so keyboard users no longer end up with an open lazy branch that never
  loads.

## 0.9.1

### Patch Changes

- 5321e79: `<l-button>` now shows a pointer cursor on hover for enabled buttons, matching common design-system conventions. Disabled buttons keep the `not-allowed` cursor.
- a6412b2: Fixed custom `cssPrefix` builds silently breaking Shadow-DOM component defaults. Shadow-DOM CSS reads canonical `--l-*` design tokens, but a custom prefix only emitted `--{prefix}-*`, so selected/hover backgrounds, borders, and focus rings resolved to nothing (the focus ring even fell back to the OS `Highlight` color). The Vite plugin now appends an automatic `:root` bridge (`--l-*: var(--{prefix}-*)`) to your imported tokens, so every Shadow-DOM token resolves with no extra setup. Default `l` builds are unchanged. The `<l-tree>` focus ring also dropped its `Highlight` fallback so it matches every other component, and `<l-tree-item>` no longer paints a second (browser-default) outline around the whole subtree when a row is focused — only the brand ring on the focused row shows.
- a7c2966: Fix the `<l-prose-editor>` emoji picker being hard to dismiss — clicking outside it or clicking the emoji toolbar button again often left it open, especially inside a modal `<l-dialog>` or any rich-editor/framework context that stops click propagation. The picker now uses the platform's native popover light-dismiss, so outside-clicks and re-clicking the toolbar button close it reliably, and `Escape` dismisses only the picker (leaving the dialog open).

## 0.9.0

### Minor Changes

- a9bb18f: Fix `<l-avatar>` initials/icon contrast on saturated `--color` values. The text color (black or white) is now chosen from the background's luminance instead of its hue, so initials stay legible on vivid brand reds, greens, and blues — not just pastels. Browsers with the Baseline `contrast-color()` function get the guaranteed-contrast choice natively; older browsers use a luminance-based fallback. New `--text-color` CSS custom property and `base` CSS part let consumers override the auto-derived text color when a brand mandates a specific one. The default corner radius is also slightly reduced.
- 8bd5e63: Add `<l-button-group>` to join related `.l-button` elements into a single segmented control with shared borders. Set `label` for an accessible group name (`role="group"` + `aria-label`) and `orientation="vertical"` to stack the buttons. The joined appearance is pure CSS, so it also works for a button wrapped in `<l-dropdown>` — e.g. a split button — and the focused button's ring is raised above its neighbours so it is never clipped.
- db662c4: Add a checkbox and the foundation of the form system. New `.l-checkbox` class styles a native `<input type="checkbox">`, a progressive `l-form-field` wrapper wires accessibility (label, `aria-describedby`, `aria-invalid`, required marker) and layout, with `.l-hint` and `.l-error` message classes. New form design tokens (`--l-form-control-*`, `--l-form-field-*`) — including a form-wide accent via `--l-form-control-activated-color` — are shared across form controls. `l-input-stepper` now adopts these tokens too and shows an invalid border when its input is `aria-invalid`. Import per element (`luxen-ui/css/checkbox`, `luxen-ui/css/form-field`) or get the tokens via the preset.
- a94cedd: Add `<l-dropdown-label>`, a non-interactive section label for grouping items inside `<l-dropdown>`. It pairs with `<l-divider>` to caption groups of `<l-dropdown-item>`s, and keyboard navigation, typeahead, and `Home`/`End` skip it automatically. The host carries `role="presentation"` so it never reads as a menu item, and its text color is themeable via the `--color` custom property. Import with `luxen-ui/dropdown-label`.
- a26acf0: Add `min-width="trigger"` to `<l-dropdown>`. The panel's width is floored at the trigger's width — never narrower, but still grows with its content — which lines the menu up with select-like triggers (a date-range or filter button). It re-applies automatically if the trigger resizes while the panel is open. The previously dead `min-width: anchor-size(width)` rule (a no-op under floating-ui positioning) has been removed.
- 497b4df: Harden `luxen-ui generate-skill` output. Fixes a correctness bug where CSS classes inside `class="…"` attributes were rebranded with the element prefix instead of the css prefix — so a skill generated with asymmetric prefixes (e.g. `elementPrefix: po`, `cssPrefix: p`) emitted copyable `class="po-button"` examples that didn't match the compiled CSS. Classes now correctly use the css prefix while tags keep the element prefix. The hand-written badge quick-pattern also now uses the `variant=` attribute to match the generated per-element reference.

  The generated `SKILL.md` gains a `## Conventions` section (JS vs CSS imports, per-appearance sub-imports, the invoker pattern, per-element attribute conventions), a stronger "ALWAYS read the per-element reference before emitting an element" directive, and a `compatibility` frontmatter field. A new `references/tokens.md` is emitted from the shipped token CSS — the semantic `--*` custom properties (with descriptions) plus the `text-*` / `bg-*` / `border-*` utility classes — so agents use real design tokens instead of arbitrary values.

- 497b4df: Broaden the default Agent Skill `description` emitted by `luxen-ui generate-skill` so the skill auto-triggers across the full UI lifecycle — not just greenfield generation. It now mentions building, editing, refactoring, reviewing, and migrating from another component library to Luxen, which fixes the skill silently failing to load on migration and refactor tasks.

### Patch Changes

- 2b281f7: Keep the button label at 14px across all sizes. Previously `data-size="lg"` and `data-size="xl"` also bumped the label to 16px/18px, so picking a taller button purely for height made the text look oversized. Now only height and padding scale with `data-size` — a taller button reads as a larger touch target, not a louder label. To opt into a larger label, override the `--font-size` custom property.
- 8bd5e63: Fix horizontal centering of icon-only buttons (`data-icon-only`). `.l-button` relied on `place-items: center`, whose `justify-items` half is ignored in a flex container, so the icon was offset instead of centered. Added `justify-content: center`.
- 0406198: Fix issues in `<l-tree>` / `<l-tree-item>` and align its multi-selection checkbox with the Luxen checkbox:
  - Leaf items no longer render an expand/collapse chevron. The CSS hide rule was targeting `.expand > svg`, but the fallback SVG lives inside a `<slot>`, so the rule never matched. Selector is now `.expand > slot > svg`. Slotted icons (e.g. avatars) on leaves stay visible.
  - `<l-tree>` no longer throws `item.getChildrenItems is not a function` when its first render runs before `<l-tree-item>` is upgraded (e.g. when modules are imported in async chunks). `_syncAll` now force-upgrades pending descendants and retries via `whenDefined` if needed.
  - In `selection="multiple"`, tree-item checkboxes now use the shared `.l-checkbox` appearance (matching the standalone Luxen checkbox) instead of a bare `accent-color` native checkbox.

- 61bf140: Fix the `<l-prose-editor>` emoji picker not appearing (and being unclickable) when the editor is used inside a modal `<l-dialog>`. The picker now opens in the top layer and stays interactive within the dialog.

## 0.8.0

### Minor Changes

- 38e753b: Element reference metadata (properties, attributes, events, methods, slots, CSS parts, CSS custom properties, CSS classes and commands) is now generated from component source — JSDoc on the custom elements plus per-element `*.meta.ts` sidecars for the CSS-only native elements — via the Custom Elements Manifest analyzer. It is normalized into a single tooling-friendly format and exposed through the new `luxen-ui/metadata` (and `luxen-ui/metadata/<element>`) export. The documentation site and the generated AI skill now read this metadata instead of hand-maintained tables, keeping the reference in sync with the code.

### Patch Changes

- 12f787b: Dialog and drawer no longer reserve empty space for the footer when no `footer` slot content is provided — the footer row now collapses to zero height instead of showing a blank padded band.
- 38e753b: Enriched and corrected the generated element reference metadata: added missing CSS custom properties, events, attributes and CSS classes for `avatar`, `carousel`, `divider`, `input-otp`, `prose-editor`, `skeleton`, `story`, `stories` and `toast`, and fixed a handful of reference sections that pointed at the wrong data (icon and toast). The `luxen-ui/metadata` export, the documentation site and the generated AI skill now reflect the complete public API for these elements.
- 91cabf4: `npx luxen-ui generate-skill` now produces an **integration-only** skill by default. The standalone bundle (`assets/<name>-standalone.{js,css}`, ~1.7 MB), `assets/claude-design.md`, `references/mockups.md`, and the "Mode 2" section of `SKILL.md` — used only for Claude Design and single-page HTML mockups — are no longer emitted unless you ask for them.

  Pass `--with-mockups` (or set `mockups: true` in `luxen.config.mjs`) to include them. If you generate the skill for Claude Design, add the flag: `npx luxen-ui generate-skill --with-mockups`. The `themeCss` option only applies in this mode and is ignored (with a warning) otherwise.

- b627df5: Internal icons and spinners now render correctly under a custom `elementPrefix`. Elements that draw a child custom element inside their own template (`prose-editor`, `stories-viewer`, `story`, `input-stepper`) previously hardcoded the default `l-icon`/`l-spinner` tags, which were never defined under a non-default prefix — so toolbar buttons and story controls rendered empty for consumers running luxen-ui under their own namespace. Child tags are now resolved through the active prefix.
- 2db23ab: The AI skill generated by `npx luxen-ui generate-skill` no longer leaks raw VitePress markup into the element docs. API reference sections now render as clean markdown lists (attributes, slots, events, methods, CSS parts and custom properties), the element-type banner becomes a one-line summary, and docs-only demo blocks are dropped.

## 0.7.0

### Minor Changes

- 79fee52: Add `<l-prose-editor>`, a form-associated rich text editor built on Tiptap (ProseMirror). It ships a configurable toolbar (`toolbar-preset` or a custom `toolbar` list), top/bottom placement, placeholder and initial HTML/JSON content, a lazy-loaded emoji picker, and submits its HTML value inside a `<form>`. Import the editable-content styles once globally with `@import 'luxen-ui/css/prose-editor';`.

### Patch Changes

- 27204da: Fix unreadable white text on `<l-toast-item>` variants (info/success/warning/danger) in browsers that support `contrast-color()`. The variant text now uses its `text-<variant>` token directly, so it renders consistently across all browsers and stays legible on the soft background.

## 0.6.2

### Patch Changes

- d323879: Add `--header-padding` and `--footer-padding` custom properties to `<l-dialog>`, both defaulting to `--padding`, so the header and footer paddings can be tweaked independently.
- 1073cff: Reduce the default `--border-radius` of `<l-drawer>` from `0.75rem` to `0.375rem` (≈6px) for a tighter inner-edge curve.
- 84148bb: Fix the `<button class="l-close" data-appearance="square">` icon being offset by ~2px from the button's geometric center. The `padding: 8px` had no effect on the button size (Tailwind's global `box-sizing: border-box` absorbs it) but shrunk the grid content area below the icon's intrinsic size, breaking centering. Removing the padding restores proper centering.
- 48c6ef0: Fix `<l-drawer>` edge-attached placements being offset from the viewport edge by the scrollbar-gutter width (~15px) when opened on a page with an active vertical scrollbar. The scroll-lock stylesheet now reserves the gutter only for centered `<l-dialog>` (where it prevents horizontal page shift) and skips it for `<l-drawer>` (which sits flush to the edge).

## 0.6.1

### Patch Changes

- e440a33: Fix TypeScript errors in `luxen-ui/vite-plugin` surfaced by strict consumers (e.g. Nuxt 4 with `noUncheckedIndexedAccess`). Adds a `.d.ts` for the bundled PostCSS plugin so `vite-plugin.ts` type-checks cleanly in strict projects. No public API change.

## 0.6.0

### Minor Changes

- b04d5b9: Extract design tokens into a new `@luxen-ui/design-tokens` workspace (vendored from Tailwind v4 oklch palette). Tailwind is now opt-in via a separate bridge preset.

  **Breaking changes:**
  - `@import 'luxen-ui/css'` → `@import 'luxen-ui/css/preset'`
  - `@import 'luxen-ui/tailwind'` → `@import 'luxen-ui/tailwind/preset'`
  - `@import 'luxen-ui/css/base'` no longer includes tokens (now just runtime helpers — `.l-visually-hidden`, custom element FOUC fix)

  **New atomic CSS imports:**
  - `luxen-ui/css/preset` — opinionated default (base + tokens)
  - `luxen-ui/css/base` — runtime helpers only
  - `luxen-ui/css/tokens` — primitives + aliases combined
  - `luxen-ui/css/tokens/primitives` — palette + spacing + radius + text + …
  - `luxen-ui/css/tokens/aliases` — semantic tokens (text-primary, bg-fill-brand, …)
  - `luxen-ui/css/tokens/palette` — extended 21 Tailwind palette families
  - `luxen-ui/tailwind/preset` — opt-in Tailwind v4 bridge

  **New CLI:** `npx luxen-ui import {preset,tailwind,design-tokens}` copies any preset for customization.

- 2d84aaf: New `npx luxen-ui generate-skill` CLI subcommand that produces a brand-aware Agent Skill folder for your project — uses your prefix, your brand tokens, your design system name. The skill is fully self-contained: a single `<name>-standalone.{js,css}` pair under `assets/` loads every element in a mockup HTML with one `<link>` and one `<script>` — no CDN dependency.

  Both the CLI and the Vite plugin now read a shared `luxen.config.mjs` at the project root (`elementPrefix`, `cssPrefix`, `emitTypes`, `themeCss`, …) — one source of truth for dev/build and skill generation. The Vite plugin also rewrites the runtime registry initialisers at build time, so `setPrefix()` is no longer needed in consumer entry points (still exported for advanced cases).

  Also:
  - `defineConfig` helper + `LuxenConfig` / `LuxenEmitTypesConfig` types exported from `luxen-ui` for editor autocompletion in `luxen.config.mjs` without TypeScript.
  - Standalone CDN bundle (`cdn/standalone.js` + `cdn/standalone.css`) shipped alongside the existing code-split `cdn/` tree (public jsDelivr consumers unchanged).

  `packages/ui/dist/skills/` is no longer produced; every consumer generates their own via the CLI.

- ed44f7b: Elements no longer ship a global `HTMLElementTagNameMap` augmentation. The Vite plugin gains an `emitTypes` option that generates a project-local, prefix-aware type map you own and commit, so `document.querySelector('l-badge')` (or your rebranded prefix) type-checks. Prop types are now exported from `luxen-ui/<name>/element` (e.g. `BadgeVariant`, `ToastPlacement`).

  `emitTypes` also accepts `target: 'vue'`, which augments Vue's `GlobalComponents` so custom elements get strict prop/typo checking inside `.vue` templates (with `vueCompilerOptions.strictTemplates`), while keeping autocomplete scoped to each element's own props.

  **Breaking**: the package no longer augments `HTMLElementTagNameMap` automatically. TypeScript consumers relying on built-in `l-*` typing should add `emitTypes: 'types/luxen.d.ts'` to the Vite plugin (or hand-write the augmentation).

- 64a21bd: `<l-story>` `pulse` halo now uses the ring's paint by default — including gradient and image rings — so the attention pulse always feels of-a-piece with the thumbnail it surrounds. Override `--pulse-color` with any `background` value (solid color, `linear-gradient`, `conic-gradient`, image) to decouple the halo from the ring.

  **Breaking**: the `--pulse-spread` custom property (px-based shadow distance) has been replaced by `--pulse-scale` (unitless transform multiplier, default `1.2`). If you set `--pulse-spread`, switch to `--pulse-scale` — roughly `1 + (spread × 2 / size)` for the equivalent visual reach.

### Patch Changes

- 9e5eee0: The luxen-ui skill now bundles MOCKUPS.md, giving agents the CDN-loading template and per-element jsDelivr paths to compose standalone HTML mockups (Claude.ai artifacts and similar). The skill also lists `l-sticky-bar` in its tag inventory, which was previously omitted.

## 0.5.0

### Minor Changes

- 3ad246f: Public element classes drop the `Luxen` prefix. Import them as `Avatar`, `Badge`, `Carousel`, `CarouselItem`, `Dialog`, `Divider`, `Drawer`, `Dropdown`, `DropdownItem`, `Icon`, `InputOtp`, `InputStepper`, `Popover`, `Rating`, `Skeleton`, `Spinner`, `Tabs`, `Toast`, `ToastItem`, `Tooltip`, `Tree`, and `TreeItem` — for example `import { Badge } from 'luxen-ui/badge'`. The internal base classes `LuxenElement` and `LuxenFormAssociatedElement` keep their prefix to avoid colliding with the DOM `Element` interface.

  This is a breaking change at the import site. Rename the class at the call site, or alias on import:

  ```ts
  import { Badge as LuxenBadge } from "luxen-ui/badge";
  ```

  Custom elements still register under the same default tags (`<l-badge>`, `<l-dialog>`, …) and `HTMLElementTagNameMap` augmentations are preserved, so `document.createElement('l-badge')` keeps its `Badge` typing.

- aa24ebe: New `<l-sticky-bar>` element — a bar docked to the viewport edge, painted in the document's **top layer** via the native `popover` attribute. Pass `for="<id>"` to track an element (e.g. an Add to cart button on a mobile product page) and the bar slides in once that element leaves the viewport. Omit `for` to keep the bar permanently visible — useful for cookie banners, promo announcements, environment indicators. Set `placement="top"` to dock against the top edge instead of the bottom; `--offset` clears a sticky header. An optional `root="<id>"` scopes the IntersectionObserver to a scrolling ancestor (CMS preview panes, modals). Animations honor `prefers-reduced-motion` and tune via `--show-duration`, `--hide-duration`, `--offset`. Style the revealed state via `l-sticky-bar:popover-open`.

  ```html
  <button id="add-to-cart" class="l-button" data-variant="primary">
    Add to cart — €42
  </button>

  <l-sticky-bar for="add-to-cart">
    <div class="...">Magic Mouse — €42 / Add to cart</div>
  </l-sticky-bar>
  ```

- 7792bee: New `<l-stories>`, `<l-story>`, and `<l-stories-viewer>` elements for Instagram-style web stories on e-commerce surfaces. The thumbnail row supports four appearances (`rounded`, `squared`, `portrait`, `landscape`); thumbnail size, radius, and gap are tweaked via CSS custom properties (`--size`, `--radius`, `--gap`). Each story can opt into a `pulse` attribute for an animated halo + breathing scale that draws attention, and a `chapters="0,5,12"` attribute to split a single video into chapters with one progress segment each. The fullscreen viewer plays the video with mute toggle, play/pause button, auto-advance, keyboard control, tap-to-advance zones (left ~30% = previous, rest = next), swipe gestures, and a `cta` slot for shoppable overlays. On desktop the prev/next chevrons sit outside the frame on the dim backdrop; on mobile they are hidden and tap zones drive navigation.

  ```html
  <l-stories for="brand" appearance="portrait">
    <l-story src="…video.mp4" poster="…jpg" label="Look #01"></l-story>
    <l-story src="…video2.mp4" poster="…jpg" label="Look #02"></l-story>
  </l-stories>

  <l-stories-viewer id="brand"></l-stories-viewer>
  ```

## 0.4.0

### Minor Changes

- b2fadaf: `<l-carousel>` gains a `max-visible-dots` attribute that caps the dot count and shrinks edge dots to indicate hidden pages.

  When the snap count exceeds `max-visible-dots`, a sliding window keeps the active dot in view and the dot at the side where dots are hidden is scaled down — like an iOS PageControl. Theme the shrink ratio with the new `--dot-edge-scale` CSS custom property (default `0.5`).

  ```html
  <l-carousel with-dots max-visible-dots="7">
    <!-- 12 slides -->
  </l-carousel>
  ```

- 78f2e56: `<l-dropdown>` gains `header` and `footer` named slots for content above and below the menu items, plus a `--padding` CSS custom property to control the panel's inner spacing. Slotted `<l-divider>` and `<hr>` elements are styled as compact section separators that bleed to the panel edges. Pressing Space or Enter on the trigger now focuses the first item, matching the documented keyboard contract.

  ```html
  <l-dropdown>
    <l-avatar slot="trigger" interactive name="Jane Cooper"></l-avatar>
    <div slot="header">…profile row…</div>
    <l-divider></l-divider>
    <l-dropdown-item>…</l-dropdown-item>
    <div slot="footer">…version label…</div>
  </l-dropdown>
  ```

- ad1cebd: Improve color contrast and align CSS custom property naming on `<l-avatar>`, `<l-tooltip>`, `<l-dropdown>` and `<select class="l-select">`:
  - `<l-avatar>` text color now derives from the actual background luminance — fixes unreadable text in dark mode when `--color` is a light pastel.
  - `<l-tooltip>` text color is now auto-derived from `--background-color` for any custom background. Set `--text-color` to override.
  - Renamed `<l-tooltip>` `--background` → `--background-color`. Removed `--color` (replaced by the optional `--text-color` override).
  - Renamed `--radius` → `--border-radius` on `<l-tooltip>`, `<l-dropdown>` and `<select class="l-select">` to align with the rest of the design system.

  Migration:
  - `style="--radius: …"` → `style="--border-radius: …"` on tooltip/dropdown/select.
  - `style="--background: …"` → `style="--background-color: …"` on tooltip.
  - `style="--color: …"` on tooltip → `style="--text-color: …"` (or remove it and let the auto-derivation handle contrast).

## 0.3.0

### Minor Changes

- 9dbbfa8: `<l-input-otp>` exposes a public CSS custom property API for cell theming: `--cell-size`, `--cell-gap`, `--cell-bg-color`, `--cell-border-color`, `--cell-border-radius`, `--cell-focus-color`, and `--cell-focus-ring` (full `box-shadow` of the active cell ring — set to `none` to disable). The `:not(:defined)` fallback now reserves the exact box the cells will occupy with a single soft-tinted rectangle, scales correctly with `--digits`, and inherits any custom theme. Renames `--size` → `--cell-size` and `--gap` → `--cell-gap` for naming consistency with the rest of the new API.

### Patch Changes

- ee8f260: Fix `<l-dialog without-header>` (and `<l-drawer without-header>`) layout where the body lost its scrollable behavior and the footer stretched to fill the available height. The grid now pins the body to the flexible row and the footer to the bottom regardless of whether the header is rendered.
- 54151f1: Add a blinking caret inside the active empty cell of `<l-input-otp>` to mirror the native text-input affordance. The native caret is hidden by design (visual cells handle focus); this stand-in gives users a clear point-of-insertion cue. Honors `prefers-reduced-motion`.
- 998245e: Fix flash of unstyled content for `<l-dialog>`, `<l-drawer>`, `<l-dropdown>`, `<l-popover>`, and `<l-tooltip>`. The base stylesheet now hides these overlay elements until their custom element has registered, so their light-DOM children no longer briefly appear inline before the upgrade. Apps that were hiding these tags themselves can drop the workaround.

## 0.2.1

### Patch Changes

- 21cf492: `<l-dialog>` (and `<l-drawer>`) now expose a `title` slot for providing a custom heading element, and a `without-header` attribute to hide the header entirely. When neither the `title` property nor the `title` slot is used, the default `<h2>` is no longer rendered.
- 71ffc8b: Tighten the visual chrome of `<l-dropdown>`, `<l-popover>`, and any element using `--l-color-border`:
  - Lighter default `--l-color-border` — moved from `gray-400 / gray-800` to `gray-300 / gray-600`, with `--l-color-divider` shifted to `gray-200 / gray-700` to keep the hierarchy. Elements affected globally: `.l-button`, `.l-disclosure`, `.l-input-otp`, `.l-input-stepper`, `.l-tabs`, `<l-tree-item>`, `<l-popover>`, `<l-dropdown>`.
  - New `--l-color-border-overlay` design token (aliases `--l-color-border` by default) so consumers can soften overlay borders — popovers, dropdowns, menus, tooltips — independently of form-control borders.
  - Smaller default `--radius` / `--border-radius` on `<l-dropdown>` and `<l-popover>` (`8px` → `6px`).
  - More subtle default `--shadow` on `<l-dropdown>` and `<l-popover>` (layered `0 4px 6px -1px / 0 2px 4px -2px` instead of `0 4px 16px`).
  - `<l-dropdown>` panel now has `0.25rem` of padding all around (was `4px 0`), and `<l-dropdown-item>` gets a `4px` radius + denser `0.375rem 0.5rem` padding so hover states sit cleanly inside the panel.

  Consumers who depended on the previous heavier `--l-color-border`, or who override `--radius` / `--shadow` / `--border-radius` on these surfaces, may see a visual difference.

  Also fixes `.l-button` default (`md`) font-size: it was previously referencing `var(--text-md)`, which is not a Tailwind v4 token, so the declaration was silently ignored and the button inherited its parent's font-size (16 px in most contexts). The default now correctly resolves to 14 px via `var(--text-sm)`.

- 6f93d49: `<l-popover>` no longer applies a default `12px 16px` padding to its content. Wrap the slotted content in a container with the spacing you want (e.g. `<div class="px-4 py-3">…</div>`). This gives full control over layout — particularly useful for menus, lists, and `full-width` mega menus where the previous padding pushed content past the viewport edge.

## 0.2.0

### Minor Changes

- 2d938bb: `<l-dialog>` (and `<l-drawer>`, which inherits from it) now expose a `--padding` CSS custom property to control the spacing of the header, footer, and the body's inline padding. Defaults to `1.5rem`. Set it to `0` for an edge-to-edge layout (e.g. full-width media).
- f18299e: `<l-input-stepper>` now exposes `--border-color` and `--border-radius` as public CSS custom properties to theme the container border (default appearance) and the button borders (rounded appearance). Defaults: `--l-color-border` and `--radius-md`.
- ac98572: `<l-popover>` now supports a `full-width` attribute that stretches the popover to the viewport width. Useful for mega menus — typically combined with `without-arrow` and `--show-duration: 0ms` for an instant, edge-to-edge dropdown.
- ac98572: `<l-popover>` renames the public CSS custom property `--radius` to `--border-radius` for consistency with `<l-dialog>`, `<l-drawer>`, `<l-input-stepper>` and the documented convention. Update consumers: `--radius: 12px;` → `--border-radius: 12px;`.

### Patch Changes

- a93a100: Fix: bare static imports of element entry points (`import 'luxen-ui/drawer'`) were tree-shaken in production builds, leaving custom elements unregistered. The `sideEffects` field now covers `dist/elements/*/index.js`, which contain the `define()` calls.
- 1320ce5: Hide the native number-input spin buttons inside `<l-input-stepper>` consistently across Firefox, Safari, and Chrome. Previously, spinners could leak through on Firefox and Safari (including in the not-defined fallback), competing with the stepper's own decrement/increment buttons.

## 0.1.2

### Patch Changes

- 199a7b4: Ship per-element CDN bundles in `cdn/` for direct ESM CDN consumption (jsDelivr, esm.sh, unpkg). The folder is now included in the npm tarball and exposed via `"./cdn/*"` in the `exports` map. Each element entry is self-contained — `lit`, `@floating-ui/dom`, `embla-carousel`, `iconify-icon` are bundled into shared chunks under `cdn/chunks/`, and shadow-DOM element CSS is inlined into the JS. Mirrors `dist/css/` to `cdn/styles/` and `dist/custom-elements.json` to `cdn/custom-elements.json` so all CDN URLs share one tree.

  Consumers can now import a single side-effecting module to register an element:

  ```html
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/luxen-ui/cdn/styles/index.css"
  />
  <script
    type="module"
    src="https://cdn.jsdelivr.net/npm/luxen-ui/cdn/elements/avatar/avatar.js"
  ></script>
  <l-avatar name="Luxen User"></l-avatar>
  ```

  The existing `dist/` output is unchanged — bundler/npm consumers continue to import from `luxen-ui` as before.

## 0.1.1

### Patch Changes

- fcc920b: Fix unresolved `catalog:` protocol in published `dependencies`. The `0.1.0` tarball on npm declared `"@floating-ui/dom": "catalog:"` literally instead of a concrete semver range, which broke installs in any non-pnpm setup. The release workflow now publishes via `pnpm publish -r`, which resolves `catalog:` and `workspace:` protocols at pack time.
