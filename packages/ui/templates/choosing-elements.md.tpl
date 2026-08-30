# Choosing an element — platform-first

Read this **before** picking an element when the intent isn't an obvious one-to-one
match. Most mistakes here aren't API misuse — they're reaching for the wrong element,
or reaching for a custom element when the platform already does the job.

Decide in two passes:

1. **Do I even need a custom element?** Prefer a native HTML element styled
   with a CSS class over a custom element whenever one exists (next section).
2. **Which element matches the user's intent?** Use the decision tables below, then
   open the matching `references/<element>.md` for the real API.

---

## Pass 1 — Native first, custom only when you must

{{displayName}} elements come in four flavors. They are **not** interchangeable, and
the cheapest one that does the job wins:

| Flavor          | What it is                                              | Needs JS? | Reach for it when…                                              |
| --------------- | ------------------------------------------------------ | --------- | -------------------------------------------------------------- |
| **Native**      | a CSS class on a standard HTML tag (`.l-button`)       | No        | a standard element exists — this is the default                |
| **Progressive** | a custom tag wrapping a native control (`<l-tabs>`)    | Enhances  | you need richer behavior but want an HTML-first fallback       |
| **Custom**      | a light-DOM custom tag holding content (`<l-badge>`)   | Yes       | there is no native element for the job                         |
| **Shadow**      | an encapsulated custom tag (`<l-dialog>`)              | Yes       | the pattern needs encapsulation (overlays, complex widgets)    |

**The rule:** if a native HTML element exists for the job, use the native class, not a
custom element. A button is `<button class="l-button">`, not a `<l-button>`. A checkbox
is `<input type="checkbox" class="l-checkbox">`. Only escalate to a custom element when
the platform genuinely can't express the behavior (a modal, a combobox, a toast).

**Don't reach for an element at all when:**

- You only want a **visual knob** (size, radius, gap, color). That's a CSS custom
  property on the element you already have — not a new element or a new attribute.
- A **plain HTML element** already does it unstyled (a `<hr>`, a `<details>`, an
  `<a>`). Add the class if one exists; otherwise leave it native.
- You're tempted to nest two elements to fake a third — check the tables first; the
  element you want probably exists.

---

## Pass 2 — Match the intent

### Pick one from a set

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| 2–5 options, all visible                             | `.l-radio`                               |
| Many options, pick one from a styled list            | `<l-select>`                             |
| Type to filter / autocomplete a long list            | `<l-combobox>`                           |
| Switch between views/panels (not a form value)       | `<l-tabs>`                               |
| Pick a node in a hierarchy                            | `<l-tree>`                               |

### Pick many

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| A few independent on/off choices                     | `.l-checkbox`                            |
| Display / remove the chosen items as chips           | `<l-tag>`                                |

### Toggle a single setting

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| Applies **immediately** (a preference)               | `.l-switch`                              |
| Submitted later **with a form**                      | `.l-checkbox`                            |

### Trigger an action

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| A single action                                      | `.l-button`                              |
| A set of related actions, segmented                  | `<l-button-group>`                       |
| A **menu** of actions behind a trigger               | `<l-dropdown>`                           |
| Dismiss/close something                              | `.l-close`                               |

### Capture input

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| One line of text                                     | `.l-input`                               |
| Multiple lines                                       | `.l-textarea`                            |
| A number with increment/decrement                    | `<l-input-stepper>`                      |
| A one-time code / PIN                                | `<l-input-otp>`                          |
| A value within a range                               | `<l-slider>`                             |
| A star/score rating                                  | `<l-rating>`                             |
| Rich text                                            | `<l-prose-editor>`                       |
| A label + help text + validation around any control  | `<l-form-field>`                         |

### Show feedback or status

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| Persistent inline message tied to a section          | `<l-alert>`                              |
| Ephemeral notification that auto-dismisses           | `<l-toast>`                              |
| A count, status or category label the user reads     | `<l-badge>`                              |
| A chip the user selects or removes                   | `<l-tag>`                                |
| Determinate progress of a task                       | `<progress class="l-progress">`          |
| Indeterminate "working…" indicator                   | `<l-spinner>`                            |
| Placeholder while content loads                      | `<l-skeleton>`                           |

### Show data (read-only)

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| A user/person image with fallback                    | `<l-avatar>`                             |
| A keyboard key                                        | `.l-kbd`                                 |
| A separator between content                          | `<l-divider>`                            |
| Hierarchical, expandable data                        | `<l-tree>`                               |

### Navigate or organize

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| Current location in a hierarchy                      | `.l-breadcrumb`                          |
| Switch between sibling panels                        | `<l-tabs>`                               |
| Expand/collapse a single section                     | `.l-disclosure` (on `<details>`)         |
| A swipeable/scrollable gallery                       | `<l-carousel>`                           |
| A bar pinned to the viewport edge                    | `<l-sticky-bar>`                         |

### Overlay or float

| User intent                                          | Element                                  |
| ---------------------------------------------------- | ---------------------------------------- |
| Modal that blocks the page                           | `<l-dialog>`                             |
| Confirm / destructive decision                       | `<l-alert-dialog>`                       |
| Panel sliding from a screen edge                     | `<l-drawer>`                             |
| Rich content anchored to a trigger                   | `<l-popover>`                            |
| A short hint on hover/focus                          | `<l-tooltip>`                            |
| A menu of actions behind a trigger                   | `<l-dropdown>`                           |

---

## Don't confuse these

- **`<l-dropdown>` is primarily a menu of *actions*.** It does support checkbox items for
  multi-select, but for picking a value from a form control reach for `.l-radio`,
  `<l-select>`, or `<l-combobox>` first.
- **`<l-alert>` vs `<l-toast>`** — persistent vs ephemeral. If the user might miss it at
  a glance and it must stay until acknowledged, it's an alert. If it's a transient
  "saved!", it's a toast.
- **`.l-switch` vs `.l-checkbox`** — instant-apply setting vs form field submitted later.
- **`<l-badge>` vs `<l-tag>`** — decide on interaction, not on meaning. A chip the user
  only reads is a badge, *including* a categorizing one (a site, a department, an asset
  class); a chip the user selects or removes is a tag. Colour is not the tiebreaker: both
  take the same `--text-color` / `--background-color` / `--border-color` trio, and on both it
  overrides the variant. Prefer the badge when either would do — it is light DOM, so it
  renders without its script, and it is 2px shorter at the same size step.
- **`<l-select>` vs `<l-combobox>`** — pick from a fixed list vs type-to-filter / free
  text with suggestions.
- **`<l-popover>` vs `<l-tooltip>`** — a popover holds interactive content; a tooltip is
  a hint only, never anything the user clicks.
- **`<l-dialog>` vs `<l-drawer>` vs `<l-popover>`** — modal centered overlay vs panel
  anchored to a screen edge vs lightweight content anchored to a trigger.
- **Body-floated overlays inside a modal `<l-dialog>`** (e.g. a tooltip or picker that
  renders to `<body>`) paint but are unclickable inside `showModal()`. Keep such content
  inside the open dialog (popover + a parent within the `<dialog>`).

---

## When no element fits

If nothing above matches:

1. **Re-check native HTML.** The platform may already have it (`<details>`, `<dialog>`,
   `<progress>`, `<meter>`, `<input type="…">`) — style it with tokens, no new element.
2. **Compose existing elements** before inventing markup.
3. **Build it with design tokens** (see `references/tokens.md`) so it matches the system,
   rather than reaching for an unrelated element and overriding it.

Whatever you choose, open `references/<element>.md` before emitting it — attribute
conventions differ per element, so guessing from memory is unsafe.
