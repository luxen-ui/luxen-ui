# luxen-ui

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
