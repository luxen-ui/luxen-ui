---
'luxen-ui': minor
---

Harden `luxen-ui generate-skill` output. Fixes a correctness bug where CSS classes inside `class="…"` attributes were rebranded with the element prefix instead of the css prefix — so a skill generated with asymmetric prefixes (e.g. `elementPrefix: po`, `cssPrefix: p`) emitted copyable `class="po-button"` examples that didn't match the compiled CSS. Classes now correctly use the css prefix while tags keep the element prefix. The hand-written badge quick-pattern also now uses the `variant=` attribute to match the generated per-element reference.

The generated `SKILL.md` gains a `## Conventions` section (JS vs CSS imports, per-appearance sub-imports, the invoker pattern, per-element attribute conventions), a stronger "ALWAYS read the per-element reference before emitting an element" directive, and a `compatibility` frontmatter field. A new `references/tokens.md` is emitted from the shipped token CSS — the semantic `--*` custom properties (with descriptions) plus the `text-*` / `bg-*` / `border-*` utility classes — so agents use real design tokens instead of arbitrary values.
