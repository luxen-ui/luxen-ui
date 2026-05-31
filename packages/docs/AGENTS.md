# AGENTS.md

## Docs as Skill Source

The markdown files in `elements/` are the **source of truth** for the Agent Skill that consumers generate via `npx luxen-ui generate-skill`.

At Luxen build time, `packages/ui/scripts/prepare-skill-templates.mjs` transforms these docs into plain markdown (strips VitePress syntax, inlines HTML examples) and writes them to `packages/ui/dist/templates/elements/`. The CLI then assembles a per-consumer skill (with their prefix and tokens applied) from those templates.

**Every edit to an element doc directly affects what AI agents see when generating Luxen UI code.**

## Writing Guidelines

Follow the [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices). Key rules:

### Be concise — the context window is a public good

Only write what Claude doesn't already know. Challenge every paragraph: "Does this justify its token cost?" Don't explain what HTML elements or CSS classes are — show how Luxen UI uses them.

Good:

````md
```html
<button
  class="l-button"
  data-variant="primary"
>
  Save
</button>
```
````

Bad:

```md
A button is an interactive element that users can click. To create a button
with Luxen UI, you need to add the l-button CSS class to a native HTML
button element. The primary variant can be applied by adding...
```

### One default, not many options

Provide the recommended approach. Only mention alternatives when the choice depends on context.

Good:

```md
### Primary

Add `data-variant="primary"`.
```

Bad:

```md
You can use `data-variant="primary"`, or alternatively set `--variant: primary`,
or use the CSS custom property approach, or...
```

### Consistent terminology

Pick one term per concept, use it everywhere:

- "CSS class" (not "class name", "CSS selector", "style class")
- "CSS custom property" (not "CSS variable", "custom property", "custom CSS property")
- "custom element" (not "web component", "Lit component", "component")
- "variant" (not "style", "type", "theme")
- "appearance" for `data-appearance` visual themes (not "variant", "skin")

### Element doc structure

Every element doc follows this standardized structure:

````
---
outline: deep                ← always include this frontmatter
---

# Element Name <Badge>type</Badge>

One-line description.

::: code-group               ← hero snippet (mandatory)
```html [HTML]
<element class="l-example">Label</element>
```
:::

## Options                   ← each feature in isolation
### Appearance               ← only for elements with appearances (see below)
### Feature 1                ← one-line "how" + <ComponentWrapper> + ::: details Code
### Feature 2
...

## Examples                  ← real-world combinations & patterns (skip if none add value)
### Pattern 1
### Pattern 2
...

## Accessibility             ← required for interactive elements
### Criteria                 ← <AccessibilityTable> with WCAG + RGAA criteria
### Keyboard interactions    ← <KeyboardTable> with Key/Description

## API reference
### Importing                ← @import path
### Attributes & Properties   ← <ApiTable element section="properties"|"attributes" /> (only if element has them)
### Events                   ← <ApiTable element section="events" /> (only if element has them)
### CSS classes              ← <ApiTable element section="cssClasses" />
### CSS custom properties    ← <ApiTable element section="cssProperties" />
````

- **Hero snippet** shows the most common usage (1-3 lines of HTML)
- **Options** subsections each have a one-line description explaining the "how" (e.g., "Add `data-variant=\"primary\"`.", "Native `disabled` attribute."), followed by `<ComponentWrapper>` + `::: details Code`
- **Examples** shows realistic compositions (icon+text, button group, form actions...)
- **Appearance** (optional) — for elements with multiple visual themes via `data-appearance`. List each appearance as an `####` subheading with a `<ComponentWrapper>` preview and a `::: code-group` CSS import block. See `close-button.md` for reference.
- **Accessibility** (required for interactive elements) — two subsections:
  - **Criteria** uses `<AccessibilityTable>` with `Check`, `Description`, and `WCAG` columns. Always include both **WCAG** and **RGAA** criteria where applicable. Format: `[WCAG 1.4.3](url), [RGAA 3.2](url)`. The `:rules` prop lists skill-only instructions for AI agents (e.g., "Always add `aria-label`"). See `close-button.md` for reference.
  - **Keyboard interactions** uses `<KeyboardTable>` with `Key` and `Description` columns. Keys support `+` separator (e.g., `Shift + Tab`). See `close-button.md` for reference.
- **API reference** tables are **generated from the element source**, not hand-written. Use `<ApiTable element="<name>" section="<section>" />` (sections: `properties`, `attributes`, `events`, `methods`, `slots`, `cssClasses`, `cssParts`, `cssProperties`, `commands`) and `<ElementSpec element="<name>" />`. The data comes from the element's JSDoc / native `*.meta.ts` sidecar via `luxen-ui/metadata` — to add or fix a row, edit the **source**, not the doc (see `packages/ui/CLAUDE.md` → "Element Reference Metadata"). The `metadata` build check fails if a referenced section is empty or mis-routed. Inline `<ApiTable :data="[…]" />` remains only for data that isn't code-derived (e.g. a function's options object).

### Examples over explanations

Show correct HTML. The AI learns patterns from examples, not prose.

### Always use Tailwind CSS classes, never inline styles

HTML examples must use Tailwind CSS utility classes for layout and spacing. Never use `style="..."` attributes. The docs site has Tailwind available via `@tailwindcss/vite` + `luxen-ui/tailwind` bridge — utility classes there resolve against the Luxen palette.

This is a **docs-site convention**, not a Luxen requirement. Luxen elements work in projects without Tailwind (consumers can substitute equivalent CSS or use Luxen's `var(--l-color-*)`/`var(--l-size-control-*)` tokens directly). Keep examples Tailwind-flavored anyway — copy-pasteability for the largest consumer base, and the patterns translate cleanly.

Good:

```html
<div class="flex gap-2 justify-end"></div>
```

Bad:

```html
<div style="display: flex; gap: 8px; justify-content: flex-end;"></div>
```

### No time-sensitive content

Don't write "as of v0.2" or "will be added in the next release". Use an "old patterns" section if something is deprecated.

## When Adding a New Element

Always update the element list in these files:

- `README.md` (repository root) — the element table in the project README
- `packages/docs/overview/introduction.md` — the element list on the introduction page

## Checklist Before Merging Element Docs

- [ ] Has hero code snippet below description
- [ ] Follows standardized structure: Options → Examples → Accessibility → API reference
- [ ] Each Options subsection has a one-line "how" description
- [ ] Concise — no prose Claude already knows
- [ ] One recommended approach, not multiple alternatives
- [ ] Consistent terminology (see list above)
- [ ] Options section covers each feature in isolation with `<ComponentWrapper>`
- [ ] Examples section shows real-world patterns and compositions
- [ ] Has `outline: deep` frontmatter
- [ ] Accessibility section (for interactive elements): Criteria with both WCAG + RGAA references, Keyboard interactions table
- [ ] API reference uses `<ApiTable element section>` / `<ElementSpec element>` (metadata-driven) — and the underlying element source (JSDoc / `*.meta.ts`) actually exposes every referenced section
- [ ] No inline styles — use Tailwind CSS utility classes instead
- [ ] No time-sensitive language
- [ ] Tested: run `cd packages/ui && node scripts/prepare-skill-templates.mjs` and inspect the output in `dist/templates/elements/`
