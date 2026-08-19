---
'luxen-ui': minor
---

New `.l-radio-group`: a `<fieldset>` of native radios captioned by its `<legend>`, each input wrapped in the `<label>` that names it. That is the platform's own way to group and name a set of radios — the technique WCAG H71 and RGAA 11.6 ask for — so there is no ARIA to add and no `for`/`id` pair to keep in sync. When no visible caption fits, name the fieldset with `aria-label` instead.

Two appearances. Left alone it renders the radio primitive: put `.l-radio` on each input and you get the dot with its label beside it. Add `data-appearance="button"` on the group and `.l-button` on each label and the items become joined buttons, the form counterpart of a segmented control. `data-orientation="vertical"` stacks either one.

It ships **no JavaScript**, because there is nothing to implement. Radios sharing a `name` already give single selection, arrow-key navigation, a single tab stop, form submission, reset and validation — this is a stylesheet, not a component. A disabled item is skipped by the arrow keys and drops out of the tab order, again from the browser rather than from us.

Reach for the button appearance when the value is submitted with a form, and for `l-segmented-control` when the choice takes effect immediately.

`.l-button` also gains the checked state that goes with it: a button wrapping a checked radio or checkbox now gets the same fill as a pressed toggle button, defined once for both.
