# MOCKUPS.md

Instructions for AI assistants composing single-page HTML mockups (Claude.ai artifacts, etc.) that use `<l-*>` tags from `luxen-ui`.

Read this before writing the artifact.

## ⚠️ Current state — `luxen-ui@0.1.1` does NOT load from any ESM CDN

The published package is broken for direct CDN/sandbox use. Verified failing on esm.sh, jsDelivr, unpkg, skypack. Root cause:

- `dist/elements/*/*.js` contains unresolved Vite directives like `import rawStyles from './avatar.css?inline'`. CDNs cannot resolve `?inline` → 404.
- The `cdn/` build folder (where Vite resolves these) is not in the `files` array of `package.json`, so it is absent from the npm tarball.
- The published per-element CSS files (`dist/css/elements/*.css`) only contain top-level composition styles (e.g. `.l-avatar-group`). The actual element visuals are embedded as JS strings applied to the shadow DOM — unreachable without working JS.

**Until the package is patched, do NOT use a `<script type="module" src=".../luxen-ui">"` import in artifacts. It will fail.**

## What works today — visual mockups with real Luxen tokens

Use this approach for static mockups. `l-*` tags stay as **unknown elements** (no behavior, no Shadow DOM), but they get styled with real Luxen design tokens for color/spacing/radius/typography fidelity.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <!-- Real Luxen design tokens (--l-color-*, --l-space-*, etc.) and base reset -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/luxen-ui@0.1.1/dist/css/index.css"
    />

    <style>
      /* Hand-rolled rules per <l-*> tag using real Luxen tokens.
       This replaces the shadow-DOM CSS we can't load from JS. */
      l-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: var(--l-color-surface-2);
        color: var(--l-color-text);
        font-weight: 600;
        overflow: hidden;
      }
      l-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      l-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.5rem;
        border-radius: var(--l-radius-full, 9999px);
        background: var(--l-color-brand-100);
        color: var(--l-color-brand-700);
        font-size: 0.75rem;
        font-weight: 600;
      }

      /* …add a small block per <l-*> tag you actually use */
    </style>
  </head>
  <body>
    <l-avatar>LX</l-avatar>
    <l-badge>Beta</l-badge>
  </body>
</html>
```

Why this is better than nothing:

- **Real tokens**: colors, spacing, radius, typography all match the design system.
- **Tags read like the real API**: `<l-avatar>`, `<l-badge>` etc. — when ported to a real Luxen page, only the hand-rolled `<style>` block is dropped.
- **No infrastructure**: zero JS, zero dependency on a working ESM CDN.

Limits:

- ❌ No `customElements.define()`, no Shadow DOM, no behavior.
- ❌ `<l-tooltip>` doesn't position. `<l-dialog>` doesn't trap focus. `<l-rating>` is a static picture. `<l-dropdown>` doesn't open.
- ❌ Don't try to mockup interactive flows that depend on real component behavior.

Use this for static visual mockups (cards, page layouts, hero sections). For anything interactive, see the higher-fidelity options below.

## Higher-fidelity options (require setup)

When the workaround isn't enough:

1. **Vendor source from the repo** — copy `packages/ui/src/html/elements/<name>/*` and shared deps into the design project, serve them locally. Lossy: re-vendor on every release.
2. **Local self-contained bundle** — run a Vite build locally with `noExternal: true` to produce a single `.js` inlining `lit` + `@floating-ui/dom` + `iconify-icon` + `embla-carousel` + all elements. Host on a Gist, raw GitHub, or pinned branch. Real components, real behavior.
3. **Wait for the package fix** — see "Long-term fix" below.

## Element APIs

For each element's real attributes, slots, events, and CSS custom properties: read `packages/ui/custom-elements.json` (the CEM manifest). Same data is reachable at:

```
https://cdn.jsdelivr.net/npm/luxen-ui@0.1.1/custom-elements.json
```

Use this when writing tag attributes — do not invent attribute names.

## Available `l-*` tags

`l-avatar`, `l-badge`, `l-carousel`, `l-carousel-item`, `l-dialog`, `l-divider`, `l-drawer`, `l-dropdown`, `l-dropdown-item`, `l-icon`, `l-input-otp`, `l-input-stepper`, `l-popover`, `l-rating`, `l-skeleton`, `l-spinner`, `l-tabs`, `l-toast`, `l-tooltip`, `l-tree`, `l-tree-item`.

## Don't

- Don't use a `<script type="module"> import 'https://esm.sh/luxen-ui@0.1.1/...'` in an artifact — it will 404 on `?inline` lookups.
- Don't pin to `@latest`. Pin a concrete version.
- Don't use Tailwind utility classes for layout/colors. Use the `--l-*` design tokens defined in `dist/css/index.css`.
- Don't fake a tag without consulting `custom-elements.json` for its real shape.

## Long-term fix (for maintainers)

The package needs one of:

1. **Inline CSS at build time** — replace the `tsc`-generated `dist/elements/*/*.js` (which keeps `?inline` raw) with a Vite-built `dist/` where Vite resolves the directive into an embedded string.
2. **Publish `cdn/`** — add `"cdn/"` to the `files` array, AND change `vite.config.ts` to bundle deps (`build.rollupOptions.external = []` or use `vite-plugin-singlefile`-equivalent) so CDNs serve a self-contained module.

After the fix, this file should switch back to a CDN-loading template that produces real custom elements. Until then, the workaround above is the supported path.
