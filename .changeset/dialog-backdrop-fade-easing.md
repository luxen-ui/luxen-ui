---
'luxen-ui': minor
---

`<l-dialog>`, `<l-alert-dialog>` and `<l-drawer>` now fade their backdrop in and out with the panel. It used to pop in at full strength and vanish at once, which a blurred backdrop (`--backdrop-blur`) turned into a visible flash. Their transitions also get a real curve — fast start, soft landing — instead of the browser's default `ease`, tunable with the new `--easing` custom property. `<l-drawer>` opens in `300ms` instead of `200ms`, since a slide travels much further than a fade; closing stays at `200ms`. `prefers-reduced-motion` still turns every transition off.
