---
'luxen-ui': minor
---

`<l-tag removable>` now draws its remove button as a full-height segment at the end of the chip, split off by a rule, instead of a faint glyph that only grows a tint disc under the pointer. The affordance is there at rest — which is the only state a touch or keyboard user ever sees, and the difference between a filter bar you can scan and a row of chips with marks floating near their edges. The hover and press states fill that segment; the hit target, the `remove` event, the Backspace/Delete path and the focus ring are unchanged.

Hovering is now scoped to what is actually clickable: a display or removable-only chip no longer tints under the pointer, because its label is not a target — only the remove segment reacts. A `selectable` chip is a control in its own right and still hovers as a whole.

The label is also re-centred in its own compartment. The chip's `gap` spaces slotted items and is tighter than its padding, so fronting the remove rule with it left the label a full padding on its left and a bare gap on its right — 8px against 4px at `md`, with the last glyph touching the divider. Both sides now get `--padding-inline`, at every size.

The target floor is now enforced rather than merely defaulted: a removable chip stays at least 24px tall (WCAG 2.5.8) even when `--height` is tuned below it, so the segment can never fall under 24×24.

New `--border-color` sets the chip's line and the rule before the remove button in one declaration. Left unset it keeps deriving from `--color` and strengthens on hover, exactly as before. Set explicitly it holds in every state — a consumer handing over its own line token gets that token, not a hover-shifted mix of its text colour. With `--background` and `--color`, a chip can now be repainted from a design system's own tokens:

```css
l-tag.location {
  --background: var(--color-location-soft);
  --color: var(--color-location-ink);
  --border-color: var(--color-location-line);
}
```

`--selected-border-color` completes the selected trio beside `--selected-color` and `--selected-background`. Selecting a chip replaces its fill and its ink outright, and now its line too, so a chip themed with `--border-color` keeps the emphasis step that says "picked" instead of drawing the same border either way. It defaults to the 45% tint of `--selected-color` the derived line always used, so nothing moves for a chip that does not set it.

Chips in a `multiple` `<l-select>` trigger are fixed too: the select's `--height`, `--border-radius` and `--background` were inheriting into them, so every chip rendered at the trigger's height, corner and fill instead of its own.
