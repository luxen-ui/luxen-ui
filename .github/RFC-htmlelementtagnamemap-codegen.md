# RFC — Codegen for `HTMLElementTagNameMap` under a custom prefix

> Status: deferred
> Owner: TBD
> Branch (when picked up): `feat/luxen-types-codegen` (suggested)

## Problem

luxen-ui is white-label. The Vite plugin + PostCSS plugin let consumers re-prefix tags and CSS tokens (`<acme-story>`, `--acme-foo`). With [`RFC-rebrand-public-classes`](./RFC-rebrand-public-classes.md) shipped, the JS class identifiers also follow (`Story`, `Avatar`, …).

The remaining gap is TypeScript IntelliSense for the rebranded tags.

Every element augments `HTMLElementTagNameMap` with the literal `'l-'` prefix:

```ts
// packages/ui/src/html/elements/story/index.ts
declare global {
  interface HTMLElementTagNameMap {
    'l-story': Story;
  }
}
```

This is a **TypeScript module augmentation** — it must use a static string literal. There's no way to make the key `\`${prefix}-story\`` because TS interfaces don't accept template-literal type computation at augmentation time across module boundaries.

Consequences when a consumer renames the prefix to `acme-`:

```ts
const el = document.createElement('acme-story');
//    ^? HTMLElement   — TS knows nothing about the renamed tag
const el2 = document.querySelector('acme-story');
//    ^? Element | null
```

The consumer loses IntelliSense for the renamed tags. They must cast manually:

```ts
const el = document.createElement('acme-story') as Story;
```

## Possible solutions to evaluate

1. **Status quo + documented cast pattern**. Ship with the limitation, add a short doc page ("TypeScript with renamed prefix") explaining the manual cast. Lowest cost, lives with the trade-off.

2. **Generated augmentation via custom prefix**. Ship a TS helper / codemod that the consumer runs once at integration time:

   ```ts
   // generated/luxen-types.ts
   import type { Story, Stories, Avatar /* ... */ } from 'luxen-ui';
   declare global {
     interface HTMLElementTagNameMap {
       'acme-story': Story;
       'acme-stories': Stories;
       'acme-avatar': Avatar;
       // ...
     }
   }
   ```

   Generator script: read `dist/custom-elements.json` (already produced by `cem analyze`), emit one augmentation file. Consumer adds it to their `tsconfig.json` `include`. Heavier but correct.

3. **Drop the augmentation entirely**. Force consumers to use a typed factory:

   ```ts
   import { create } from 'luxen-ui';
   const el = create('story'); // → Story (typed via base name, not tag)
   ```

   Cleaner runtime but breaks idiomatic `document.createElement` typing.

4. **Augment for a configured set of prefixes via declaration merging**. Ask the consumer to write their own augmentation file (3 lines per element). Documentable but ergonomically poor.

**Recommendation to evaluate at implementation time**: option 2 (codegen). Best DX, auditable output, scales with future elements. Source of truth: `dist/custom-elements.json` (single file already produced by CEM, contains tag → class mapping for all elements).

## Sketch — option 2 implementation

- New script: `packages/ui/scripts/generate-types.mjs`. Reads `dist/custom-elements.json`, emits a `.d.ts` augmentation parameterized by `--prefix`.
- New `bin` entry in `packages/ui/package.json`: `"luxen-types": "./scripts/generate-types.mjs"`. Consumer runs `npx luxen-types --prefix acme --out src/luxen-types.d.ts`.
- Optional: hook into `vite-plugin.ts` so the file is emitted automatically when `elementPrefix` is configured. Better DX, more code.
- New docs page: `packages/docs/guides/typescript-with-custom-prefix.md`.
- Smoke test: scratch project with `elementPrefix: 'acme'`, confirm `document.createElement('acme-avatar')` is typed `Avatar`.

## Verification plan (when picked up)

1. `vp check` — 0 errors.
2. Generated `.d.ts` matches all 22 elements (and any future ones, since the script reads the manifest).
3. Sandbox project with custom prefix: `document.createElement('acme-X')` resolves to the correct class type.
4. Removing the generated file from `tsconfig.include` reverts to `HTMLElement` typing — confirms the codegen is the actual bridge.
