---
'luxen-ui': minor
---

Themed display chips: `<l-badge>` now takes a consumer palette coherently, and `<l-icon>` can render an icon set you ship yourself.

### Breaking — `<l-tag>` colour properties renamed

`--color` and `--background` were ambiguous beside `--border-color`: a bare `--color` mimics the CSS property, which means text, while the chip also exposes a fill and a line. The rule the library follows is now explicit — `--color` only where an element has a single colour (`l-divider`, `l-icon`), and the explicit trio wherever there is a family:

| Before                  | After                         |
| ----------------------- | ----------------------------- |
| `--background`          | `--background-color`          |
| `--color`               | `--text-color`                |
| `--selected-background` | `--selected-background-color` |
| `--selected-color`      | `--selected-text-color`       |

`--border-color`, `--selected-border-color`, `--border-radius`, `--height`, `--font-size` and `--padding-inline` are unchanged. A find-and-replace on the four names above is the whole migration.

This also removes a collision: `--background` is declared by `l-dropdown`, `l-popover`, `l-select`, `l-combobox` and `l-prose-editor`, and custom properties inherit through a shadow boundary — so a chip inside any of those panels picked up the panel's fill. `<l-select>` carried a per-chip reset for exactly that; it is no longer needed for the fill.

**Badge — four theming hooks.** `--text-color`, `--background-color`, `--border-color` and `--border-radius`, the same names `<l-tag>` now uses, so one rule themes either chip. They win over `variant`, `appearance` and `pill` rather than competing with them, so a badge tinted with your own token family keeps its tint through an appearance change. Reach for them when the color says _what kind of thing_ this is — a site, a department, an asset class — rather than how something went; `variant` stays the interface-state axis, and a business family belongs in your own class where a variant added later cannot collide with it.

Each hook hides something: the border is a 30% tint of `--text-color`, so that one declaration repaints an outlined chip; `--background-color` replaces whichever per-appearance token was in play; `--border-color` holds through `appearance="filled"`, whose default line is transparent; `--border-radius` keeps the squircle corner (`pill` is what trades it for a true arc). Size deliberately has none: `size` is already the API for that axis.

**Badge — the border follows the ink.** It is now a tint of `currentColor` rather than of the element's private text variable, so a badge coloured from outside repaints as a whole instead of keeping a neutral line.

**Badge — icons at either end.** A leading `<l-icon>` now gets the same padding correction a raw `<iconify-icon>` always got; previously the icon rendered but sat 2px too far in, because the selector only matched the inner element that `<l-icon>` keeps in its shadow root. Inline `<svg>` icons match too. A **trailing** icon is now corrected as well, and a badge can carry one at each end — wrap the label in a `<span>` so the badge can tell which edge the icon is on, since `:first-child` counts elements and not text. The pattern is documented for the first time.

**Icon — your own collection.** `luxen-ui/icon` re-exports `addCollection`, `addIcon` and `setCustomIconLoader` from `iconify-icon`, bound to the same icon storage `<l-icon>` reads from. A collection registered through a framework binding such as `@iconify/vue` writes to a different copy of that module and was invisible here, rendering an empty 0px box with no error. On the CDN build, assign `window.IconifyPreload` before the script tag.

**Icon — no more silent misses.** A name that resolves to nothing now logs one warning per name instead of collapsing quietly to zero width.
