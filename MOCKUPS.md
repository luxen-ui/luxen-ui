# MOCKUPS.md

Instructions for AI assistants composing single-page HTML mockups (Claude.ai artifacts, etc.) that use `<l-*>` tags from `luxen-ui`.

Read this before writing the artifact.

## Starter template (copy into the artifact)

Pin a minor range like `@0.1` (latest patch in `0.1.x`) — never `@latest`. The minor pin protects you from breaking changes in `0.2.0` while picking up patches automatically.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <!-- 1. Tokens + base reset (load once, before any element CSS or JS) -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/luxen-ui@0.1/cdn/styles/index.css"
    />

    <!-- 2. One <script> per element you use. Each module side-effect-registers its
         custom element. Always import the element's index.js (the registrar),
         NOT its <name>.js (which only exports the class). -->
    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/luxen-ui@0.1/cdn/elements/avatar/index.js';
      import 'https://cdn.jsdelivr.net/npm/luxen-ui@0.1/cdn/elements/badge/index.js';
      // …one import per element used
    </script>
  </head>
  <body>
    <l-avatar name="Luxen User"></l-avatar>
    <l-badge>Beta</l-badge>
  </body>
</html>
```

That's it. After registration, every `l-*` is a real custom element with shadow DOM, lifecycle, and behavior — focus traps, positioning, events all work.

## Per-element load rule

For every `<l-foo>` tag in the body, add **one** `<script type="module">` import for its `index.js` on jsDelivr. Tokens CSS is loaded once at the top, regardless of how many elements you use.

## Path derivation

For tag `<l-foo>`:

- JS module: `https://cdn.jsdelivr.net/npm/luxen-ui@<version>/cdn/elements/foo/index.js`
- The `l-` prefix is dropped; element names map 1:1 to directory basenames.

### Light-DOM elements need an extra CSS link

A few light-DOM elements (`l-badge`, `l-divider`, `l-toast`, `l-input-stepper`, `l-tabs`) ship their styles as separate CSS rather than inlined in JS. Add the per-element CSS too:

- `https://cdn.jsdelivr.net/npm/luxen-ui@<version>/cdn/styles/elements/badge.css`
- `https://cdn.jsdelivr.net/npm/luxen-ui@<version>/cdn/styles/elements/divider.css`
- …etc.

Some have appearance-variant subdirectories (load the variant you use):

- `cdn/styles/elements/close-button/{ring,square,circle}.css`
- `cdn/styles/elements/input-stepper/{default,rounded}.css`
- `cdn/styles/elements/tabs/{line,enclosed}.css`

If unsure which elements need a CSS link, fetch the authoritative file listing:

```
https://data.jsdelivr.com/v1/package/npm/luxen-ui@0.1/flat
```

Returns JSON `{"files":[{"name":"/cdn/styles/elements/badge.css", ...}, ...]}`. Anything under `cdn/styles/elements/` is loadable; if a CSS exists for the element, link it.

## Available `l-*` tags

`l-avatar`, `l-badge`, `l-carousel`, `l-carousel-item`, `l-dialog`, `l-divider`, `l-drawer`, `l-dropdown`, `l-dropdown-item`, `l-icon`, `l-input-otp`, `l-input-stepper`, `l-popover`, `l-rating`, `l-skeleton`, `l-spinner`, `l-tabs`, `l-toast`, `l-tooltip`, `l-tree`, `l-tree-item`.

## Element APIs

For each element's real attributes, slots, events, and CSS custom properties: read the CEM manifest. Same data is reachable at:

```
https://cdn.jsdelivr.net/npm/luxen-ui@0.1/cdn/custom-elements.json
```

Use this when writing tag attributes — don't invent attribute names.

## Don't

- Don't pin to `@latest`. Use a minor range like `@0.1` (latest patch in `0.1.x`) — `@latest` crosses minor bumps which can break in pre-1.0.
- Don't use Tailwind utility classes for layout/colors. Use the `--l-*` design tokens defined in `cdn/styles/index.css`.
- Don't fake a tag without consulting `custom-elements.json` for its real shape.
- Don't import `cdn/elements/<name>/<name>.js` directly — that exports the class but doesn't call `customElements.define()`. Always import `cdn/elements/<name>/index.js`.

## Notes for specific elements

- **`<l-icon>`** proxies to `iconify-icon`, which fetches icon sets at runtime from `api.iconify.design`. Works in artifacts, requires network egress.
- **Form elements** (`l-input-otp`, `l-input-stepper`) render correctly but don't submit data without a custom form handler. Fine for visual mockups, not form-logic prototypes.
- **Dark mode**: tokens use `light-dark()`. To force a mode in a mockup, set `color-scheme: dark` (or `light`) on `<html>`.
