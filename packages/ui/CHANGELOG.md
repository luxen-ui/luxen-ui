# luxen-ui

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
