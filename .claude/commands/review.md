---
description: 'Review a Luxen UI element against the design principles.'
argument-hint: '[element-name]'
---

# Review Luxen UI Element

Audit the **$ARGUMENTS** element. **Only report problems — skip anything correct.**

## Read the element files

- **CSS** (required): `packages/ui/src/css/elements/$ARGUMENTS.css`
- **TypeScript** (optional): `packages/ui/src/html/elements/$ARGUMENTS/$ARGUMENTS.ts`

If the CSS file does not exist, stop and report the element was not found.

## Audit instructions

Apply all 5 Luxen UI Design Principles (from `luxen-design-principles` skill). For the Baseline audit, only report non-Baseline features — do not list Widely Available or Newly Available features. Also flag any CSS bugs (broken nesting, invalid selectors, typos, undefined variables without fallbacks).

## Output format

**Be synthetic. Only list problems.**

```
## Review: $ARGUMENTS

### Issues

#### [Issue title]
**Principle**: [which principle]
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
