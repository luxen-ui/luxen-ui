# luxen-ui

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
