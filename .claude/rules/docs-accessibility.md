---
paths:
  - 'packages/docs/elements/**/*.md'
  - 'packages/docs/foundations/**/*.md'
---

# Accessibility section of a docs page

How to write the `## Accessibility` section of an element doc or a Foundations
guide. The same content renders on the docs site and feeds the generated Agent
Skill (`packages/ui/scripts/prepare-skill-templates.mjs`), so write for both a
human scanning the page and an agent generating markup.

Reference pages: `tabs.md`, `badge.md` and `dialog.md` in `packages/docs/elements/`.

Check your work: `node packages/ui/scripts/check-a11y-tables.mjs <page>`.

## Shape

```md
## Accessibility

### Criteria

Optional one-sentence lead.

<AccessibilityTable :data="[…]" :rules="[…]" />

### Keyboard interactions

<KeyboardTable :data="[…]" />
```

`<AccessibilityTable>` renders one checklist in two groups:

| Prop          | Group         | Mark         | Holds                              |
| ------------- | ------------- | ------------ | ---------------------------------- |
| `:rules`      | **Your part** | empty ring   | what the integrator must do        |
| `:data`       | **Built in**  | checked ring | what the element guarantees itself |
| `:references` | References    | —            | optional further-reading links     |

**Your part** comes first: it is what the reader acts on. A group with no row is
not rendered — never invent a row to fill one.

## What belongs here

A row earns its place only if getting it wrong hurts someone using a keyboard, a
screen reader, magnification, high contrast or reduced motion.

- Usage or design advice with no such effect ("Reserve `tone="danger"`
  for irreversible actions", "Provide poster images") belongs in Options or
  Examples, not here.
- How to drive the element (invoker commands, the `open` property, events)
  belongs in the API reference, even when it involves a `<button>`.
- A **Built in** row states a mechanism the reader could check in DevTools: a
  role, an attribute, a key, a ratio, a media query. "Clear visual change on
  hover" is not one.

## Who owns a line

Ask "does the reader have to write or check anything?"

- Yes → `:rules`. Never put a consumer obligation in `:data`: a checked ring on
  something the reader still has to do is accessibility theatre.
- No, it happens without them → `:data`.

Wording gives obligations away. A `:data` row that says _must_, _needs_,
_requires_, _provide_, _set_, _add_, _wrap_, _pair_, _keep_, _ensure_ or
_consumer_ is in the wrong group.

| Case                                                      | Do                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `:data` row is an obligation ("Must have a `<label>`")    | Move it to `:rules`.                                             |
| It then duplicates an existing rule                       | Merge into one row; keep the `WCAG` references.                  |
| One row mixes both ("Has role X; add `aria-label` if…")   | Split: the fact in `:data`, the instruction in `:rules`.         |
| `:rules` row is really a fact ("… are set automatically") | Move it to `:data`, or drop it if `:data` already says it.       |
| Same criterion, real split of duties                      | One row on each side (see `badge.md`: built-in vs custom colors) |

**Native elements** (CSS only: `.l-button`, `.l-checkbox`, `.l-input`…): the
reader writes the HTML, so choosing the element and its attributes is **Your
part** ("Use a native `<button>`"). **Built in** is what the stylesheet adds
(focus ring, contrast, target size, reduced motion) and what the browser then
gives for free.

## A row

```js
{ Check: 'Label every tab', Description: '…', Note: '…', WCAG: '…', Code: 'label' }
```

| Field         | Required | Content                                                |
| ------------- | -------- | ------------------------------------------------------ |
| `Check`       | yes      | The title. See below.                                  |
| `Description` | no       | One short sentence: the how. Omit rather than restate. |
| `Note`        | no       | One more sentence: the why, or the edge case.          |
| `WCAG`        | no       | `[WCAG 1.4.3](url), [RGAA 3.2](url)`                   |
| `Code`        | no       | Name of a snippet slot. `:rules` rows only. See below. |

A plain string still renders as an unnamed `:rules` row. Don't write new ones.

### `Check` — a statement, not a label

The list must make sense by reading the titles alone. Write the shortest
statement that stands on its own:

- `:rules` → an instruction, verb first: "Label every tab", "Don’t add ARIA
  yourself", "Freeze with `inert`, not `disabled`".
- `:data` → a fact: "Tab roles exposed", "Disabled tabs skipped",
  "Text contrast passes".

Rules of thumb:

- Not a topic label ("Role", "Accessible name", "Focus management", "Motion"):
  it forces the reader into the description to learn what the line says.
- 2 to 6 words, 48 characters at most. Sentence case, no trailing period.
- No filler: "Always add a label" → "Add a label"; "Never hide the input" →
  "Don’t hide the input".
- A condition goes in the object, not in a clause: "Label icon-only buttons",
  not "Add `aria-label` when the button has only an icon".
- Name the thing, not the criterion: "Name the table", not "Accessible name".
- Inline code is allowed, sparingly.

### A Built in title states what the criterion checks

The `WCAG` references say which outcome is guaranteed; the title must state that
outcome, so title and references agree at a glance. How the element gets there
(a native element, an attribute it sets, "automatically") goes in
`Description`.

| Mechanism title (wrong)                 | Outcome title                     | Cites      |
| --------------------------------------- | --------------------------------- | ---------- |
| Native modal `<dialog>` semantics       | Dialog role exposed               | WCAG 4.1.2 |
| Roles set automatically                 | Tab roles exposed                 | WCAG 4.1.2 |
| `label` names the group                 | Group named from `label`          | WCAG 4.1.2 |
| Label linked automatically              | Label associated with the control | WCAG 1.3.1 |
| One-time-code purpose set automatically | Input purpose identified          | WCAG 1.3.5 |

If no cited criterion matches the title, one of the two is wrong: fix the title,
or report the reference — never leave them disagreeing.

**Your part** titles are instructions, so they name the action ("Use a native
`<button>`"); the references say why it matters.

### Recurring rows

The same guarantee is worded the same way on every page. Start from these and
adapt the object ("dialog", "menu", "field"…):

| Old label                   | Built in title                        |
| --------------------------- | ------------------------------------- |
| Role (native element)       | Dialog role exposed                   |
| Role (set by the element)   | Tab roles exposed                     |
| Motion / Reduced motion     | Reduced motion respected              |
| Focus state / Focus visible | Focus ring on keyboard focus          |
| Focus management (modal)    | Focus trapped while open              |
| Focus restoration           | Focus returns to the trigger on close |
| Focus management (roving)   | One Tab stop for the group            |
| Expanded state              | Open state exposed                    |
| Color contrast              | Text contrast passes                  |
| Non-text contrast           | Border contrast passes                |
| Target size                 | 24px minimum target                   |
| Decorative icon / elements  | Decorative icons hidden               |

| Old label or rule                 | Your part title                      |
| --------------------------------- | ------------------------------------ |
| Accessible name (form control)    | Label the field                      |
| Accessible name (`label` / title) | Name the dialog                      |
| Icon-only                         | Label icon-only buttons              |
| "Use a native `<button>`…"        | Use a native `<button>`              |
| "Never rely on `placeholder`…"    | Don’t use the placeholder as a label |
| "Do not rely on color alone…"     | Add visible text                     |

### `Description` and `Note`

- `Description` adds the how: which attribute, which element, which value. It
  never restates the title. If there is nothing to add, omit it.
- `Note` is the reason or the edge case, and only when it adds something.
- An old row written "Do X — because Y" splits naturally: X feeds `Check` and
  `Description`, Y becomes the `Note`.
- One sentence each, no trailing period.

### `WCAG`

- Give both a WCAG and an RGAA criterion where both apply.
- A row with no matching criterion takes none — don't stretch one to fit.
- Never cite a criterion from memory. Reuse one already on the page, or check
  it at the source first.
- URL shapes: `https://www.w3.org/WAI/WCAG22/Understanding/<slug>` and
  `https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#<n.n>`.

## Links

Every named pattern, spec or reference is a link to its exact source — in the
lead and in `Description` / `Note` alike:
`[APG tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)`, "per the
[APG](…#keyboardinteraction)". Link to the most specific anchor.

Only claim that an element follows a pattern when its tests or source show it.

## Code snippets

A `:rules` row may fold a snippet behind "Show code". The snippet is a regular
fenced block in a named slot, rendered by VitePress like any other code block:

````md
<AccessibilityTable :data="[…]" :rules="[
  { Check: 'Announce changing badges', Description: '…', Code: 'status' },
]">

<template #status>

```html
<span role="status">
  <l-badge variant="success">3 new</l-badge>
</span>
```

</template>

</AccessibilityTable>
````

Keep the blank lines around the fence, or Markdown won't parse it.

Add a snippet only when all of these hold:

- it is shorter than explaining the same thing in words;
- it is 8 lines at most once formatted (`vp check --fix` puts one attribute
  per line, so a tag with five attributes is already seven lines);
- it shows only the lines the rule is about — an excerpt of a real example from
  the page is ideal, a copy of a whole Examples block is not;
- the row is in `:rules` — a `:data` row leaves the reader nothing to write.

Most rows need none.

## Authoring pitfalls

- Inside `:data` / `:rules`, write a double quote as `&quot;`. An escaped `\"`
  breaks the page.
- A single quote inside a string ends it: use `’` in prose ("Don’t"), and
  `&quot;` around attribute values.
- No blank line inside the `<AccessibilityTable …>` opening tag.
- Examples are in English, with placeholder names (Jane Cooper, Acme).

## Keyboard interactions

`<KeyboardTable>` takes `{ Key, Description }` rows. Combine keys with `+`
(`Shift + Tab`). List every key the matching
[APG pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) mandates.

## Before you finish

- [ ] Titles read as a to-do list on their own
- [ ] No consumer obligation under **Built in**, no duplicate across groups
- [ ] Every row is about accessibility; every **Built in** row names a mechanism
- [ ] Every named pattern or reference is a link
- [ ] WCAG and RGAA given where both apply, none cited from memory
- [ ] Snippets only where shorter than prose, 8 formatted lines at most
- [ ] `node packages/ui/scripts/check-a11y-tables.mjs <page>` passes
- [ ] `cd packages/ui && node scripts/prepare-skill-templates.mjs`, then read
      the page's output in `dist/templates/elements/`
