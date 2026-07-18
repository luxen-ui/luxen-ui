# luxen-ui

## 0.17.0

### Minor Changes

- db634a3: Add `data-marker-placement` to `<l-disclosure>`. Set `data-marker-placement="start"` to render the marker icon before the summary label instead of after it (the default remains `end`). Works with both `arrow` and `plus` markers.
- 118d7dd: Add `<l-segmented-control>` — a single-select switch between a few mutually-exclusive options, with a sliding pill behind the selected segment. It progressively enhances light-DOM `<button>`s into a `radiogroup` with roving-tabindex keyboard support (arrow keys, `Home`/`End`), and emits a `change` event carrying the selected `value` and `index`. It is form-associated: give it a `name` and its selected value is submitted with the form (and restored on reset), like a native radio group. It aligns with `.l-button` and form controls via the shared `size` scale (`sm`/`md`/`lg`/`xl`), and segments hold any content — labels, `<l-icon>` + label, or icon-only (auto-squared, with `aria-label`) — so filter toolbars stay visually consistent.

### Patch Changes

- 1837550: Fix `l-avatar` producing wrong initials for accented or non-ASCII names. The fallback initials for a name like "Markus Nösterer" now correctly read "MN" instead of "MS" — the derivation was based on ASCII-only word boundaries (`\b`/`\w`), which treat an accented letter as a word break and split the name mid-word. Initials are now derived by splitting on whitespace and taking the first code point of the first and last words, so accents, umlauts, and other non-ASCII letters are preserved.

## 0.16.2

### Patch Changes

- 4a81474: Fix `l-tooltip` reappearing after a dialog (or any modal) closes. A hover/focus tooltip on a button that opens an `l-dialog` used to pop back up once the dialog was dismissed, because the dialog restores focus to its trigger. Focus-triggered tooltips now only show on `:focus-visible` (keyboard focus), matching the platform's native `title` and the ARIA tooltip pattern — so a mouse user no longer sees the tooltip resurrect on close, while keyboard users still get it on focus return.

## 0.16.1

### Patch Changes

- 968f26f: Fix `<l-tooltip>` (and hover-triggered `<l-popover>`) staying open after the pointer left the trigger. The safe polygon that lets the pointer travel to the bubble without flicker was only re-evaluated on `pointermove`, so a pointer that left the trigger and immediately came to rest (a quick flick-and-stop) fired no further event and the tooltip stayed visible until the next, possibly never-coming, move. Hiding is now backed by a short timed fallback that closes the tooltip once the pointer has settled in the corridor between the trigger and the bubble. The fallback is only armed in that corridor — resting the pointer on the bubble itself (to read it, or to click inside an interactive popover) keeps it open, and it no longer stacks on top of `hide-delay`.

## 0.16.0

### Minor Changes

- c8c2ac0: Add `data-marker-placement` to `<l-disclosure>`. Set `data-marker-placement="start"` to render the marker icon before the summary label instead of after it (the default remains `end`). Works with both `arrow` and `plus` markers.
- 3bc4265: Add `show-delay` and `hide-delay` attributes to `<l-tooltip>`. `show-delay` requires the pointer to dwell on the trigger for the given number of milliseconds before the tooltip opens, so sweeping across a toolbar or a grid of icon triggers no longer flashes a tooltip on every control the pointer passes over. `hide-delay` waits before closing after the pointer leaves, bridging a brief exit-and-return without flicker. Both default to `0` (today's immediate behaviour) and apply to `hover` only — keyboard focus always shows the tooltip immediately.

## 0.15.0

### Minor Changes

- f23c439: Add `<l-select>`, a searchable select with a button trigger and a popover listbox. It supports single and multiple selection (with removable `<l-tag>` chips), in-popover search with accent/case-insensitive filtering, rich options via the shared `.l-select-item-*` classes, `<option selected>` pre-selection, sizes, a clear button, and full keyboard/ARIA support. It is form-associated — single mode submits one value, multiple mode submits one entry per value.

  Options are authored as a native `<datalist>` of `<option>`, the same surface as `<l-combobox>`. The zero-JS native `<select class="l-select">` continues to ship as the "platform" tier and is now documented alongside `<l-select>` on a single Select page.

- f23c439: Add `<l-tag>`, a compact chip element for tokens, filters, and selected values. It supports an optional remove button (click or Backspace/Delete), a leading `prefix` slot for an icon or avatar, three sizes, and a disabled state. As a Shadow DOM element it renders correctly anywhere, including inside another element's shadow root.
- 9f5cf80: The generated agent skill now ships a `choosing-elements.md` reference that helps AI agents pick the right element from user intent — when to prefer a native HTML element with a CSS class over a custom element, and how to tell apart common look-alikes (alert vs toast, switch vs checkbox, dropdown vs select).

### Patch Changes

- ee5f578: Fix scoped elements (`l-toast`, `l-story`, `l-input-otp`, `l-input-stepper`) rendering completely unstyled when a custom `elementPrefix` is configured. Their CSS wraps rules in an `@scope (l-…)` block, and the prelude was left un-rewritten — so the scope root matched nothing and the whole block went inert. The `@scope` prelude is now rewritten to the configured prefix like every other selector.
- 1ef8308: Fix `l-dropdown`: a click dispatched programmatically on an `l-dropdown-item` host (`item.click()`, a synthetic `MouseEvent`, or a testing tool that retargets to the host) now fires `select`. Previously only pointer/keyboard hits on the inner row were honored, which broke programmatic activation and E2E tests. Hits inside a parent item's submenu panel are still correctly ignored.
- 7f7b816: Fix `<l-tabs>` rendering with JavaScript disabled. The tablist, tabs, and panels are now styled from the light-DOM structure (`l-tabs > div > button`) instead of the ARIA roles the element adds at runtime, so this progressive element looks correct before its script loads. Mark the initially-active tab with `aria-selected="true"` to style it as selected without JS.
- cfde125: Fix `l-tooltip`: at most one hover/focus/click-triggered tooltip is visible at a time. On dense trigger grids (heatmaps, calendars, avatar stacks), sweeping the pointer across a row could leave two or three tooltips open at once because each instance's safe polygon kept it alive while the neighbour opened — opening a tooltip now dismisses the previous one and invalidates every peer's safe polygon. `trigger="manual"` tooltips opt out: several can stay open together and hover opens never evict them. Also, the `for` property now reflects to the attribute, so `[for="…"]` CSS and `querySelector` calls match when a framework (Vue, React) sets it as a DOM property.
- 2651ad8: Fix `l-tooltip` auto-derived text color on custom backgrounds. The `contrast-color()` path used the withdrawn `color-contrast()` syntax (`… vs … to AA`), so its `@supports` guard evaluated false in every browser and the native path never ran — text color always fell back to an OKLCH-lightness threshold, which tracks hue rather than luminance and could collapse contrast to ≈1:1 on a saturated `--background-color`. The tooltip now uses the single-argument `contrast-color()` where supported and a squared-sRGB luminance approximation as the fallback, matching `l-avatar`.

## 0.14.0

### Minor Changes

- 9753dd2: Add the `breadcrumb` element — a CSS-only navigation trail (`.l-breadcrumb` on a native `<nav>`) following the WAI-ARIA breadcrumb pattern. Underlined links with a minimal hover, a subtler current page, and an oblique `/` separator themeable via `--separator` / `--separator-color`. The trail scrolls horizontally with touch momentum instead of wrapping, and `data-unstyled-links` opts out of link theming so you can apply your own link class.
- 0302cf2: Add `<l-combobox>`, a searchable text input paired with a filterable list of options (the ARIA combobox pattern). Options are authored as a native `<datalist>` of `<option>` — the same authoring surface as `<select>`. It's a form-associated custom element (submits the chosen `value` under `name`), with client-side filtering (overridable via the `filter` property), match highlighting, full keyboard support (Up/Down, Home/End, Enter, Escape, Tab) on the `aria-activedescendant` model, `with-clear` and `allow-custom` options, size variants (`xs`–`xl`), and a shadcn-style look. Emits typed `change` and `input` events and exposes the `base`, `control`, `input`, `panel`, `listbox` and `option` CSS parts.

### Patch Changes

- cb350c1: Fix `l-form-field` not wiring up form-associated custom element controls such as `l-slider`. A slider (or any custom control) inside a form field no longer shows its `.l-error` message on load, and now receives the proper `id`/`label[for]`/`aria-describedby` accessibility wiring. The field also re-attempts wiring once a lazily-loaded control element upgrades, so it works regardless of script load order. The error message's resting visibility is now driven by CSS from the field's `invalid` state, so it stays hidden by default even before the element upgrades or if its script never runs.

## 0.13.0

### Minor Changes

- d147f7a: Add `<l-alert>`, a contextual callout that highlights an inline message with a semantic color and a leading icon. It supports `info` / `success` / `warning` / `danger` variants (each with a default icon), an `icon` override or `no-icon` to control the glyph, and a `dismissible` attribute that adds a close button emitting cancelable `hide` / `after-hide` events. Authored content (an optional `.l-alert-title` plus body) stacks automatically, and the whole callout adapts to dark mode through the design tokens.
- 9e16be1: Add `<l-alert-dialog>`, an interruptive confirmation dialog built on `<l-dialog>`. It ships built-in cancel/confirm actions, a `tone="danger"` destructive variant, cancelable `confirm` / `cancel` events (call `preventDefault()` to keep it open for async work), a `loading` state, and `role="alertdialog"` with an accessible description.

  The `destructive` button variant (`data-variant="destructive"`) is now a solid, high-emphasis danger fill (previously a soft, low-emphasis tint) so a destructive action reads as prominently as `primary`. Buttons also pick up disabled styling from `aria-disabled` (not just the native `disabled` attribute).

- df0ca55: Restyle the Select (`.l-select`) for consistency: the trigger now matches the other form controls (border, focus ring, invalid and disabled states) and the picker mirrors the dropdown panel. The native chevron is recolored via `--caret-color` and replaceable via `--caret-icon`. Adds rich `<option>` support with `.l-select-item-media`, `.l-select-item-text`, `.l-select-item-title` and `.l-select-item-description`, where selection is marked by an inline-start checkmark and the trigger mirrors the chosen option.
- f5d09c1: Add `<l-slider>`, a single- or dual-thumb range slider. Set `value` (with `min`, `max`, `step`), or add `range` with `min-value` / `max-value` for a min–max selection whose thumbs cannot cross. It's a form-associated custom element — the value is submitted under `name` (range mode submits the low and high values as two entries) — with full keyboard support (arrows, Page, Home/End), `role="slider"` thumbs, size variants (`xs`–`xl`), and a shadcn-style look. Emits typed `input` and `change` events (with `value` and `values`) and exposes the `base`, `track`, `indicator` and `thumb` CSS parts plus `--track-size`, `--thumb-size`, `--track-color`, `--indicator-color` and `--thumb-color`.
- 51f68a3: Add a Switch element: a CSS-only `<input type="checkbox" role="switch">` skin with a sliding thumb, accent hover halo, full keyboard and form support, dark mode, forced-colors and reduced-motion support. Checkbox and radio now share the switch's hover halo for a consistent toggle feel.

### Patch Changes

- d03a529: Fix the custom-element prefix rename so it stays consistent across the library. `<l-stories>` now resolves its `<l-story>` / `<l-stories-viewer>` children through the prefix registry instead of hardcoded `l-` tag literals, so the playlist and the auto-singleton viewer keep working under a custom `elementPrefix`. The library also no longer ships fixed `l-*` keys in the global `HTMLElementTagNameMap` for a handful of elements — consumer-side tag typing is emitted with the configured prefix via the Vite plugin's `emitTypes` option instead.

## 0.12.0

### Minor Changes

- 3624b69: `<l-drawer>` gains a `top` placement and an `inset` attribute. `inset` detaches the drawer from the viewport edges, floating it with a uniform gap (`--inset-gap`, default `1rem`), rounded corners on every side, and a drop shadow (`--shadow`). Both work with every `placement` (`start`, `end`, `top`, `bottom`).
- 510f064: `<l-dropdown>` now supports nested submenus. Nest `<l-dropdown-item slot="submenu">` elements inside an item to create a submenu at any depth — the parent item shows a chevron and opens its panel on hover, click, Enter or ArrowRight (ArrowLeft/Escape close one level at a time). Selecting a nested item fires the usual `select` event on the dropdown and closes the whole menu; checkbox items keep it open. Parent items expose `aria-haspopup="menu"`/`aria-expanded`, and submenu panels follow the dropdown's existing theming custom properties (`--background`, `--padding`, `--border-radius`, `--shadow`).
- 3624b69: Add a semantic elevation scale to the shipped token layer — `--l-shadow-sm`, `--l-shadow-md`, `--l-shadow-lg` — whose shadow color uses `light-dark()` so it deepens in dark mode, where a faint black cast would otherwise disappear. `<l-popover>`, `<l-dropdown>`, and `<l-drawer>` now default their `--shadow` to these tokens, so their shadows stay visible on dark surfaces.
- 4c5e35d: Events are now typed `Event` subclasses with direct payload properties instead of `CustomEvent` with a `detail` object. This is a breaking change for event consumers:
  - Read payloads from the event itself (`event.index`, `event.toast`, `event.selection`…) instead of `event.detail.*`.
  - Most events no longer bubble and are no longer `composed` — listen on the element itself rather than relying on delegation or shadow-DOM crossing. `change`/`select` still bubble (matching native `change`) but are not composed.
  - `show` is now cancelable on `l-dialog`, `l-drawer` and `l-stories-viewer` (it already was on dropdown/toast/sticky-bar) — `event.preventDefault()` keeps the element closed.
  - The internal `l-tree-item-toggle` event was renamed to `selection-toggle` (private contract between `l-tree-item` and `l-tree`; consumers should listen for `selection-change` on `l-tree`).

  New: event classes are exported (e.g. `import { HideEvent } from 'luxen-ui/events'`, or per-element classes like `TabsChangeEvent`) so you can narrow with `instanceof`, and direct `addEventListener` on an element is typed for its events.

- 5be0372: Built-in UI strings are now localizable. The accessible labels the components ship themselves — the spinner's "Loading", the carousel's slide/fullscreen buttons, the input-stepper's increment/decrement buttons, the prose-editor toolbar, and the stories-viewer controls — are resolved from a small in-house translation registry instead of being hardcoded in English. The active language follows the page: each element reads the closest `[lang]` ancestor (falling back to `<html lang>`, then English) and re-renders automatically when the document language changes.

  English ships by default. Activate another locale with a side-effect import — French is included:

  ```js
  import "luxen-ui/translations/fr";
  ```

  Register your own locale (or override terms) via the new `luxen-ui/localize` export:

  ```js
  import { registerTranslation } from "luxen-ui/localize";
  registerTranslation({
    $code: "es",
    $name: "Español",
    $dir: "ltr",
    loading: "Cargando" /* … */,
  });
  ```

  A consumer-supplied label (an explicit `aria-label`, or a labelling prop) always takes precedence over the localized default. The mechanism is SSR-safe: importing the elements or the registry in Node touches no DOM APIs.

- 9c6f8b3: Add a radio form control — `.l-radio` on a native `<input type="radio">`.
  - **`.l-radio`** styles a native radio with a round box and a centered dot for the selected state, sharing the same `--l-form-control-*` look as the checkbox (border, hover, focus ring, disabled and invalid states). Native `name` grouping handles single selection and arrow-key navigation, so there is no JavaScript.
  - Inside `l-form-field` a bare `<input type="radio">` is auto-styled (the class is optional there), and the field switches to its inline toggle layout.
  - **Size & accent**: override `--size` for the box and `--accent` for the selected fill; override `--dot` to swap the selected icon.

  Import `luxen-ui/css/radio` for the styles.

- 7363d63: Recalibrate the control-size scale (`--l-size-control-xs` … `xl`) up one step to **28 / 32 / 36 / 40 / 44px**. The default medium height grows from 32px to 36px for buttons, inputs and selects, and the extra-large size now reaches the 44px WCAG 2.5.5 / Apple HIG touch-target minimum. Controls render ~4px taller across the board.
- 991e087: Add a text input and its adornment wrapper, and polish the shared form-control look.
  - **`.l-input`** styles a native `<input>` across every text-like type (text, search, number, password, email, url, tel, date, time) with consistent border, focus, disabled and invalid states. Date/time inputs get custom picker icons and search a custom clear button — all with zero JavaScript. Inside `l-form-field` or `l-input-group` a bare text input is auto-styled.
  - **`<l-input-group>`** (progressive) wraps an input with leading/trailing adornments in DOM order — an `<l-icon>` before, a unit `<span>` or `<button>` after, no classes needed. Its `password-toggle` attribute injects an accessible show/hide button at upgrade time (localized label, `aria-pressed`, eye icon swap); without JavaScript the field stays a plain password input.
  - **Size**: `data-size` (native `.l-input` / `.l-select`) and `size` (`l-input-group`) map the control height to the shared `--l-size-control-*` scale (xs–xl), affecting only the height — not the label or hint/error.
  - **States**: on focus the border takes the focus-ring color with a soft halo; invalid adds a red border plus a faint danger wash; disabled now renders a solid greyed fill (new `--l-form-control-disabled-*` tokens) instead of fading the control with opacity. `.l-select` gains size and disabled support too.
  - Form-field labels are now `14px` / medium weight with a tighter label-to-control gap.

  Import `luxen-ui/css/input` (+ `luxen-ui/css/select`) for the styles and `luxen-ui/input-group` for the password-toggle behavior.

- 51a3674: Add a `.l-textarea` style for native `<textarea>` controls. A bare `<textarea>` inside `l-form-field` is auto-styled (no class needed); `data-size` (`xs`–`xl`) sets the height and `data-resize` (`vertical`, `none`, `both`, `auto`) controls the resize handle, with `auto` growing the box to fit its content.

### Patch Changes

- 27b5601: Accessibility fixes across seven elements, surfaced by the new axe-core test suite. `<l-button-group>` no longer sets `aria-orientation` on `role="group"` (not allowed by ARIA 1.2 — the attribute still drives the layout via CSS). An interactive `<l-avatar>` now exposes its accessible name on the inner button instead of an illegal focusable `role="img"` host. `<l-carousel>` navigation buttons gained accessible names ("Previous slide", "Next slide", "Toggle fullscreen"). `<l-input-otp>` no longer hides its real input from assistive technology — only the decorative cells are `aria-hidden`, so the input is now exposed as a textbox. `<l-popover>` no longer emits an `aria-controls` reference that cannot resolve across its shadow boundary. `<l-prose-editor>` forwards the host's `aria-label` (default "Rich text editor") onto the editable region. The `<l-stories-viewer>` progress bar is now named ("Story progress").
- cd39b3e: `<l-dialog>` and `<l-drawer>` now expose an accessible name: the `title`
  property (or a slotted `slot="title"` heading) names the native dialog via
  `aria-labelledby`/`aria-label`, so screen readers announce the dialog by its
  title instead of an unnamed dialog (WCAG 4.1.2).
- 1122893: `<l-dialog>` (vetoed close) and `<l-prose-editor>` (first render) no longer
  schedule redundant re-renders from inside their update cycles, removing Lit
  dev-mode warnings and an extra render pass each.
- cf0dc0a: Dropdown accessibility hardening: keyboard focus now shows a focus ring distinct from hover, `Tab` closes the menu (and any open submenus) as documented, and the trigger exposes `aria-haspopup="menu"` plus an initial `aria-expanded`. Every `role="menu"` panel now has an accessible name (the root menu after its trigger, each submenu after its parent item), submenu parents link their panel via `aria-controls`, and item hosts carry `role="none"` so the menu owns its menuitems directly. Focus is no longer lost when a submenu collapses while focused, and roving within a level now closes a sibling's open submenu.
- edd6cfb: `l-input-stepper` now creates its button icons via DOM APIs instead of HTML string interpolation, so icon names sourced from application data can never inject markup.
- da9f736: Light-DOM elements (`l-input-stepper`, `l-input-otp`, `l-tabs`) now initialize in hidden tabs, iframes, and prerendered documents, and no longer double-initialize after being moved in the DOM. Setup previously waited for an animation frame, which never fires while the document is hidden.
- d8cedcc: The `l-prose-editor` emoji picker no longer breaks after the element is moved or remounted: the picker is rebuilt on next use instead of pointing at a detached node, and a picker still loading when the editor is removed is no longer orphaned in the document.
- 68d043a: `<l-input-otp>` now keeps its native input visible and usable before the element
  upgrades (or if JavaScript never loads), instead of hiding it until hydration.
  The pre-upgrade field is styled with the cell tokens and the Luxen focus ring.
- 15d571d: The `<l-prose-editor>` toolbar now follows the APG toolbar keyboard pattern:
  one tab stop with arrow-key navigation between buttons (ArrowLeft/ArrowRight
  with wrap-around, Home/End), instead of a tab stop per button.
- d3ddc88: `<l-rating>` no longer schedules a redundant re-render on first update,
  removing a Lit dev-mode warning and an extra render pass.
- 5781a4d: `<l-stories-viewer>` no longer schedules redundant re-renders when opening or
  advancing between stories, removing a Lit dev-mode warning and an extra
  render cycle per story change.
- 2890376: `<l-tabs>` now positions its active-tab indicator without relying on
  `requestAnimationFrame`, so the indicator renders correctly when the tabs
  start inside a hidden container (background tab, `display: none` ancestor,
  preview panes) and stays aligned when the tablist resizes.
- 510f064: Element styles now reference design tokens without hardcoded fallback values (the tokens stylesheet is a required dependency). This also fixes the dropdown and popover panel backgrounds, which referenced a non-existent `--l-color-bg-surface` token and silently rendered with the browser `Canvas` color instead of `--l-color-surface-overlay` — they now match other overlays (dialog, toast), most visibly in dark mode.

## 0.11.1

### Patch Changes

- e386aba: `l-dropdown-item` now has a minimum height of 36px, giving menu items a more comfortable click/tap target (up from 33px).
- c21e325: `<l-tabs variant="line">` now exposes four CSS custom properties to restyle the
  indicator and track: `--indicator-color`, `--indicator-thickness`,
  `--track-color` and `--track-thickness`.

## 0.11.0

### Minor Changes

- a75955b: Add a dedicated `--l-tooltip-background-color` token for `<l-tooltip>` and stop the tooltip from borrowing the brand fill. Previously the tooltip's background defaulted to `--l-color-bg-fill-brand` — the same token as primary buttons — so re-theming the brand color (e.g. a green primary button) unintentionally recolored every tooltip. Tooltips now read a neutral inverse surface token instead; the default appearance is unchanged, and you can override `--l-tooltip-background-color` globally to re-skin all tooltips or `--background-color` per instance.

### Patch Changes

- f744252: The generated AI skill now ships a reference page for every documented element — including divider, dropdown, popover, tooltip, carousel, tabs, rating, icon, kbd, disclosure, tree-item and the stories family — instead of a hand-curated subset. Consumers running `luxen-ui generate-skill` now get complete component coverage.

## 0.10.0

### Minor Changes

- bcf6094: `<l-prose-editor>`: replace the emoji picker with the lightweight, framework-agnostic `emoji-picker-element` and make the picker dismiss reliably. Clicking outside the picker — including directly in the editor content — now always closes it, even on browsers where native popover light-dismiss was suppressed by the editor's own pointer handling. A new `emoji-data-source` attribute lets you serve the emoji data locally for offline or behind-auth apps instead of fetching it from a CDN.

### Patch Changes

- d554cd2: Add a public `--size` custom property to `<l-avatar>` for arbitrary pixel sizing. Set `--size` to any length to render an avatar at a custom size beyond the `xs`–`xl` token scale; the font scales proportionally and the radius (rounded square or circle) follows. The named `size` tokens are unchanged.

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
