---
'luxen-ui': minor
---

The focus ring now has three design tokens, named after what they set: `--l-focus-ring-color`, `--l-focus-ring-width` and the new `--l-focus-ring-offset` (default `2px`), the gap between an element and its ring. The design tokens page lists them in a new Focus section, together with the text-field focus tokens, and a new Focus guide under Foundations covers anatomy, theming and accessibility.

| Before           | After                  |
| ---------------- | ---------------------- |
| `--l-focus-ring` | `--l-focus-ring-color` |

`<l-slider>`, `<l-rating>` and `<l-stories-viewer>` now follow these tokens as well. The slider thumb draws a solid ring instead of a translucent halo, so the ring keeps its contrast and stays visible in forced-colors mode (Windows High Contrast). Rating stars use the focus color instead of `--active-color`: the default gold had too little contrast on a white background. Stories viewer buttons sit over the story media, so they keep a light ring, now edged with a dark band to stay visible on any frame, and take the ring width and offset from the tokens. The search box of a searchable `<l-select>` now looks focused like every other text field (ring-colored border, halo, `--l-form-control-focus-*` tokens) and stays visible in forced-colors mode, where it previously lost its focus indicator.

Every focus indicator now comes from these tokens:

- In `<l-select>` and `<l-combobox>`, the option moved to with the arrow keys draws the focus ring. Before, only a faint tint showed it, the same as a hover, and forced-colors mode dropped even that. A mouse-driven highlight stays a tint.
- The active cell of `<l-input-otp>` looks focused like a text field: ring-colored border, the `--l-form-control-focus-*` stroke and halo, and an outline in forced-colors mode, where it used to vanish. `--cell-focus-ring` now defaults to that halo instead of a 1px ring.
- `<l-carousel>` buttons and dots draw the focus ring instead of the browser default. The buttons fill the gap with the surface color, so the ring stays visible over any slide.
- `<l-rating>` in edit mode rings the focused star. The star ring never showed (the star's mask clipped it), and a second ring went around the whole group, also on mouse clicks.
- Plain links, `<button>` and `<summary>` elements take the same ring from the base styles, with zero specificity, so any rule of yours still wins.
- In forced-colors mode, text fields draw their indicator at `--l-focus-ring-width` instead of a fixed 2px.
- A focused text field is easier to spot: `--l-form-control-focus-border-width` now defaults to `2px` instead of `0`, so the 1px border thickens to 2px inward (the field does not move). Set it back to `0` for the previous look.

**Migration.** Rename any override of `--l-focus-ring` to `--l-focus-ring-color`. The old name is not kept as an alias, so an override left on it is silently ignored and the ring falls back to the default color.
