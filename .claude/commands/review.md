---
description: 'Review a Luxen UI element against the project rules.'
argument-hint: '[element-name]'
---

# Review Luxen UI Element

Audit the **$ARGUMENTS** element. **Only report problems — skip anything correct.**

## Read the rules

- `packages/ui/AGENTS.md` — element types, reference metadata
- `.claude/rules/element-css.md`
- `.claude/rules/element-ts.md` (when the element has TypeScript)

## Read the element files

Look the element up in `packages/ui/elements.json` for its `type`, then read
whichever of these exist:

- **Light-DOM CSS**: `packages/ui/src/css/elements/$ARGUMENTS.css`, or the
  appearance directory `packages/ui/src/css/elements/$ARGUMENTS/`
- **Element folder**: `packages/ui/src/html/elements/$ARGUMENTS/` — the class
  (`$ARGUMENTS.ts`), the shadow styles (`$ARGUMENTS.css`), or the native
  metadata sidecar (`$ARGUMENTS.meta.ts`)

If the element is not in `elements.json`, stop and report it was not found.

## Audit instructions

Check the element against every rule in the files above. Also check that its
metadata (JSDoc or `.meta.ts`) matches the API the CSS and the class actually
expose. For Baseline, report only features outside `baseline newly available`
that have no working fallback. Also flag plain CSS bugs (broken nesting, invalid
selectors, typos, references to tokens that do not exist).

## Output format

**Be synthetic. Only list problems.**

```
## Review: $ARGUMENTS

### Issues

#### [Issue title]
**Rule**: [file → section]
**Severity**: FAIL | WARN
**Location**: file:line
[1-2 sentence explanation]
**Fix**: [concrete fix, with code if helpful]

---

### Bugs
[CSS bugs found — broken nesting, invalid selectors, typos, etc.]
```

If no issues found:

```
## Review: $ARGUMENTS

No issues found.
```
