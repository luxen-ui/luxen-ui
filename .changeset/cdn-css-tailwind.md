---
'luxen-ui': patch
---

Fix `cdn/styles/index.css` shipping unprocessed Tailwind v4 `@theme` directives. The published file now resolves `@theme` into `:root { --l-* }` declarations at build time, so design tokens are actually defined when consumed directly in a browser (CDN/sandboxed iframe). Previously, browsers silently ignored the unknown `@theme` at-rules and `var(--l-color-*)` returned empty.

Implementation: a new `vite.config.cdn-css.ts` runs `@tailwindcss/vite` against a `_index-cdn.css` wrapper that opts into Tailwind's pipeline. The original `dist/css/index.css` remains source-CSS for bundler consumers running their own Tailwind. Output is also smaller (~12 KB instead of 33 KB) because Tailwind tree-shakes unused utilities.
