---
outline: deep
---

# Using with Tailwind

`luxen-ui/tailwind/preset` is the bridge that maps Luxen tokens to Tailwind utility classes. Optional — Luxen works standalone via `var(--l-color-*)` references.

## Quick start

Add two lines on top of the [installation CSS block](/overview/installation/vite#import-the-css) :

```css [CSS]{1,2}
@import 'tailwindcss';
@import 'luxen-ui/tailwind/preset';
@import 'luxen-ui/css/preset';

/* CSS-only elements — apply a Luxen class to a native HTML tag, no JS needed.
   Available: button, close-button (ring|square|circle), disclosure, kbd, progress, select. */
@import 'luxen-ui/css/button';
@import 'luxen-ui/css/disclosure';

/* Light-DOM custom elements — need their JS module too (see Import JS below). */
@import 'luxen-ui/css/badge';
@import 'luxen-ui/css/toast';
```

That's it. You can now write:

```html
<button class="bg-fill-brand text-on-fill-brand p-4 rounded-md">Save</button>
<span class="text-primary">Body text</span>
<span class="text-info">Hint</span>
```

The bridge generates ~40 semantic utilities (`text-primary`, `bg-fill-brand`, `bg-fill-info-soft`, `border-interactive`, etc.) plus the standard Tailwind scales (`p-4`, `rounded-md`, `text-sm`, etc.) mapped to Luxen primitives.

The cascade layers line up too: Luxen's tokens sit in `@layer theme`, next to Tailwind's theme variables, and its element styles in `base` and `components`. Tailwind's `@layer theme, base, components, utilities;` order applies to both, so a utility class always beats a Luxen element style and a `:root` theme of your own beats Luxen's tokens.

## Customize

For full control — add palette families, custom tokens, strip pieces — copy the preset into your project:

```bash
npx luxen-ui import tailwind
# → creates ./luxen-tailwind.css
```

Then replace `@import 'luxen-ui/tailwind/preset'` with `@import './luxen-tailwind.css'` and edit freely. The file is self-documenting. See the [CLI reference](/overview/cli#import) for the other files you can import.

## Reference: full bridge source

<details>
<summary>View <code>luxen-ui/tailwind/preset</code> output</summary>

<<< @/../ui/dist/css/tailwind/preset.css

</details>
