# AGENTS.md

Guidance for the `luxen-ui` package. This file holds what applies to every
change; the detailed rules are split by the files they govern:

| Working on                                 | Read                             |
| ------------------------------------------ | -------------------------------- |
| Element CSS (`src/css/`, `src/html/*.css`) | `.claude/rules/element-css.md`   |
| Element TypeScript (`src/html/`)           | `.claude/rules/element-ts.md`    |
| Tests (`tests/`)                           | `.claude/rules/element-tests.md` |

Paths are from the repository root. Claude Code loads each rule automatically
when it touches a matching file; other agents must open it.

## Element Types

Luxen elements fall into four buckets. Pick one at creation time — it drives the render strategy and the `<ElementSpec type="…">` value in the doc.

| Type            | Render strategy                                                                                                           | When to pick                                                                                                                       | `ElementSpec`        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Native**      | CSS only, no TS file                                                                                                      | Styling a standard HTML element with CSS (e.g. `<button>`, `<details>`, `<progress>`)                                              | `type="native"`      |
| **Progressive** | Lit + `createRenderRoot() { return this }` + `querySelector` on a native child (`<input>`, `<button>`…) usable without JS | Upgrading a native element with richer behavior while keeping an HTML-first fallback (e.g. `<l-input-stepper>`, `<l-tabs>`)        | `type="progressive"` |
| **Custom**      | Lit + `createRenderRoot() { return this }`, no native element wrapped                                                     | New custom tag in light DOM holding text or imperative children — no native upgrade (e.g. `<l-badge>`, `<l-divider>`, `<l-toast>`) | `type="custom"`      |
| **Shadow DOM**  | Lit with default Shadow DOM                                                                                               | Encapsulated rendering for UI patterns where SSR isn't required (e.g. `<l-dialog>`, `<l-tooltip>`)                                 | `type="shadow"`      |

**Rule of thumb**: if the element wraps native children that already work without JS and only enhances them (behavior, ARIA, semantics — whether or not it queries them, e.g. `<l-button-group>` just adds `role="group"` around native `<button>`s), it's `progressive`. If it's light-DOM without wrapping a native element, it's `custom`. Otherwise, it's `shadow`.

The README element tables (root `README.md` and `packages/ui/README.md`) are generated from `dist/metadata/index.json`. After adding an element, run `node scripts/generate-readme-tables.mjs --write` to regenerate them; the build's `--check` call will fail if they drift. The docs grid (`<ElementTypeGrid />`) reads `luxen-ui/metadata` directly and shows a card for every element whose docs page exists under `packages/docs/elements/` — so only `elements.json` (and the docs page) need updating when adding a new element.

## Element Reference Metadata (keep it in sync with the code)

The reference data shown in the docs (`<ApiTable element="…" section="…" />`, `<ElementSpec element="…" />`) and shipped to AI consumers via the `luxen-ui/metadata` export is **generated from the element source**, not hand-written. The pipeline is `cem analyze` (config: `custom-elements-manifest.config.js`, plugins: `scripts/cem-plugins/*`) → `scripts/normalize-metadata.mjs` → `dist/metadata/*.json`, validated by `scripts/check-metadata.mjs` (runs in `build`; fails the build on gaps). Regenerate locally with `pnpm run metadata`.

**This means every element's public API must be described in its source.** When you add or modify an element, update its metadata in the same change:

### Custom elements (`progressive` / `custom` / `shadow`)

Maintain the JSDoc block above the `export class …` declaration. The class **must** carry a `@customElement l-<name>` tag (or decorator) — without it the analyzer treats the class as plain and extracts **nothing**. Document the full public surface with these tags:

- `@summary` — one-line description (required for `inSkill` elements)
- `@cssproperty [--name=default] - description` — public CSS custom property (bracket-default syntax; never document `--_private` ones)
- `@event name - description` — every event the element emits (write "Not cancelable" / "Cancelable" — the word is parsed)
- `@slot name - description`, `@csspart name - description`
- `@cssstate name - description` — a custom state the element sets on itself (`:state(name)`). A shared base class outside `src/html/elements/` (e.g. `LuxenFormAssociatedElement`) documents its states on its own class; `scripts/cem-plugins/inherited-css-states.js` copies them into every subclass
- `@attribute name - a | b — description` — public `data-*` or HTML attributes (reactive `@property` fields are picked up automatically; use `@attribute` only for non-property attributes)
- `@cssClass .l-<name>-<child> - description` — internal light-DOM classes (custom/progressive only)
- `@command --name - description` — Invoker commands (e.g. dialog/drawer)

### Native elements (`native` — CSS only, no Lit class)

A CSS-only native element has no class for the analyzer to read, so it **must** ship a sidecar `src/html/elements/<name>/<name>.meta.ts` — a JSDoc-only class. **When you create a new native element, create its `.meta.ts`. When you change a native element's CSS API, update its `.meta.ts`.** For `inSkill` native elements this is enforced: `check-metadata.mjs` fails the build if the sidecar is missing. See `src/html/elements/button/button.meta.ts` for the template:

```ts
/**
 * @summary Buttons trigger actions such as submitting forms or navigating.
 * @nativeElement button          // host HTML tag → marks the element native
 * @selector .l-button            // consumer-facing selector
 * @attribute data-variant - primary | destructive — Visual variant.
 * @cssproperty [--height=32px] - Button height.
 * @cssClass .l-button - Base button style.
 */
// oxlint-disable-next-line typescript/no-extraneous-class -- JSDoc-only metadata carrier.
export class ButtonMeta {}
```

Keep the `.meta.ts` in sync with the element's `.css` file (the CSS custom properties, `data-*` selectors, and classes you actually expose).

### Registry

Every element has an entry in `elements.json` with a `type` field (`native` | `progressive` | `custom` | `shadow`) — add it for new elements; it drives metadata extraction and the `<ElementSpec>` banner.

## Adding an element

Every step below is needed; the ones marked ⛔ fail the build or CI when skipped, the others fail silently.

1. **Registry** — add the entry to `elements.json` (`name`, `displayName`, `kind`, `type`, `inSkill`, `inMockups`). A custom element also joins the `ElementBaseName` union in `src/html/registry.ts`.
2. **Source** — per the element type: CSS in `src/css/elements/<name>.css` (light DOM) or co-located in `src/html/elements/<name>/` (shadow), the class plus `index.ts` calling `define()`, or the `<name>.meta.ts` sidecar for a native element. Rules: `.claude/rules/element-css.md`, `.claude/rules/element-ts.md`.
3. **Metadata** ⛔ — JSDoc on the class or the `.meta.ts`, then `pnpm run metadata` (see above).
4. **Accessibility fixture** ⛔ — `tests/elements/a11y/fixtures/<name>.ts` with `defineA11yFixture({ name, states })`, one state per variant that changes colors, roles or structure. The suite's completeness guard fails for any `elements.json` entry without a fixture (or not listed in another fixture's `covers`, for sub-items). Run `pnpm test:components a11y`.
5. **Component tests** — `tests/elements/<name>.browser.test.ts` for anything with behavior. Rules: `.claude/rules/element-tests.md`.
6. **Docs page** — `packages/docs/elements/<name>.md`, following `packages/docs/AGENTS.md`. Then, in `packages/docs`:
   - add `@import 'luxen-ui/css/<name>';` to `.vitepress/theme/tailwind.css` for a light-DOM element — without it the page renders the element unstyled, and nothing fails;
   - add the sidebar entry in `.vitepress/config.js` (`el('Name', 'l-name', 'name')`);
   - add the element to the list in `overview/introduction.md`.
7. **README tables** ⛔ — `node scripts/generate-readme-tables.mjs --write` (root `README.md` and `packages/ui/README.md`; never edit them by hand).
8. **Changeset** — `minor` for `luxen-ui`.

Check the result in a browser: the docs page is the only place where a missing stylesheet import or a broken `:data` attribute shows.
