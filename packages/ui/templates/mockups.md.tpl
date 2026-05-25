# {{displayName}} — standalone HTML mockups

Instructions for AI assistants composing single-page HTML mockups (Claude.ai artifacts, etc.) that use `<l-*>` tags from `{{name}}`.

Read this before writing the artifact. The mockup loads **two locally-bundled assets** — no CDN dependency, no per-element imports.

## Starter template (copy into the artifact)

The paths below assume the mockup `.html` lives in the same directory as the skill folder (i.e. next to `SKILL.md`). Adjust the `./assets/…` prefix if you place the mockup elsewhere.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <!-- 1. One CSS file: tokens + base + all element CSS, with your prefix baked in -->
    <link
      rel="stylesheet"
      href="./assets/{{name}}-standalone.css"
    />

    <!-- 2. One JS bundle: every <l-*> element registered when this script loads -->
    <script
      type="module"
      src="./assets/{{name}}-standalone.js"
    ></script>
  </head>
  <body>
    <l-avatar name="User"></l-avatar>
    <l-badge>Beta</l-badge>
  </body>
</html>
```

That's it. Two `<link>` / `<script>` tags load everything. After the JS runs, every `l-*` tag below is a real custom element with shadow DOM, lifecycle, and behaviour (focus traps, positioning, events).

## Available `l-*` tags

All tags below are registered by `{{name}}-standalone.js` — no per-element imports needed.

{{tagsList}}

## Element APIs

For each element's real attributes, slots, events, and CSS custom properties, open the matching file in `references/` (e.g. `references/dialog.md`).

A machine-readable manifest is also available at `./assets/{{name}}-custom-elements.json` — not bundled by default. If you need it, the source lives at `./assets/{{name}}-standalone.js` (look for `customElements.define` calls and class metadata).

## Don't

- Don't use Tailwind utility classes for layout/colors. The bundle ships {{displayName}} only — Tailwind isn't loaded, so any utility class (`bg-rose-500`, `flex`, `gap-2`) is just dead text. Use the `--l-*` design tokens (defined in `{{name}}-standalone.css`) for colors, and plain CSS for layout.
- Don't fake a tag without verifying its API in the matching `references/<name>.md` file.
- Don't try to load individual element files — the standalone bundle is everything-in-one. Just include the two assets above.

## Notes for specific elements

- **`<l-icon>`** proxies to `iconify-icon`, which fetches icon sets at runtime from `api.iconify.design`. Works in artifacts, requires network egress.
- **Form elements** (`l-input-otp`, `l-input-stepper`) render correctly but don't submit data without a custom form handler. Fine for visual mockups, not form-logic prototypes.
- **Dark mode**: tokens use `light-dark()`. To force a mode in a mockup, set `color-scheme: dark` (or `light`) on `<html>`.
