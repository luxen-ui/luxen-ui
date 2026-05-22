---
'luxen-ui': minor
---

Elements no longer ship a global `HTMLElementTagNameMap` augmentation. The Vite plugin gains an `emitTypes` option that generates a project-local, prefix-aware type map you own and commit, so `document.querySelector('l-badge')` (or your rebranded prefix) type-checks. Prop types are now exported from `luxen-ui/<name>/element` (e.g. `BadgeVariant`, `ToastPlacement`).

`emitTypes` also accepts `target: 'vue'`, which augments Vue's `GlobalComponents` so custom elements get strict prop/typo checking inside `.vue` templates (with `vueCompilerOptions.strictTemplates`), while keeping autocomplete scoped to each element's own props.

**Breaking**: the package no longer augments `HTMLElementTagNameMap` automatically. TypeScript consumers relying on built-in `l-*` typing should add `emitTypes: 'types/luxen.d.ts'` to the Vite plugin (or hand-write the augmentation).
