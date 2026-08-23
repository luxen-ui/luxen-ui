---
'luxen-ui': minor
---

New `pill` appearance for `<l-input-stepper>`. The container becomes a filled capsule and the two buttons become solid circles inset into it, separated from the track by a hairline ring and lifted off it by a shadow — the quantity picker you get in a cart row or a booking widget. Select it with `appearance="pill"` and import `luxen-ui/css/input-stepper/pill`.

It is the inverse of `rounded`, which drops the container entirely and outlines each button. Reach for `pill` when the stepper stands on its own and should read as a single tactile object, and for `default` when it sits in a form beside other text inputs and has to match their box.

At a bound the button flattens into the track instead of staying a dead white disc, and the whole control greys out to an opaque fill — so the animated roller (`with-roller`) stays flush with the capsule behind it rather than showing as a lighter rectangle.

`rounded` also gets a softer hover and press: its button border used to jump to `--l-color-text-primary`, which lands near-black on a white page and near-white on a dark one — a hard edge for a hairline circle. Both states now use `--l-form-control-border-color-hover`, the token the system names for a hovered form control, so `rounded` and `pill` share one hover vocabulary. Its buttons also shrink on press now, the same way `pill`'s do — both appearances hang their buttons as free-standing discs, so both can press one into the surface. `default` keeps its fill-only press: its buttons sit flush inside the container's border, and shrinking one opens a gap in the corner of the box.

Three further fixes to `rounded` fall out of this. It no longer loses its button borders on a page that imports a second input-stepper appearance after it — every appearance now qualifies its rules so the skin survives whatever order the imports land in. And it finally has the pre-hydration fallback the other appearances already had: its bordered, gapped buttons need more reserved space than the base sets aside, so before its JS loaded it rendered 12px short and 12px narrow, then jumped on hydration. Lastly, its animated roller no longer paints a hard rectangle behind the value: the overlay was filling itself with the page surface to mask the input underneath, which only matches when the stepper sits directly on the page — and `rounded`, alone among the appearances, has no container of its own to guarantee that. It now leaves the overlay transparent and hides the input instead, so whatever is behind the stepper simply shows through.
