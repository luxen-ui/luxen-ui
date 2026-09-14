---
'luxen-ui': patch
---

`<l-tabs>` no longer adds a redundant tab stop on a panel that already opens with something focusable. Pressing `Tab` out of the tablist now reaches that first link or button directly, instead of stopping on the panel box — and on a full-height panel, that also removes the viewport-sized focus ring drawn around it.

Panels keep `tabindex="0"` whenever their first content is not focusable, including a panel that opens with text and holds a control further down; dropping the stop there would send a keyboard user past everything above that control. This follows the ARIA APG Tabs pattern, which makes the attribute conditional rather than automatic.

What counts as the panel's first content is decided from what is actually rendered and focusable, not from the shape of the markup: a hidden input, a `display: none` block or an `inert` region no longer stands in for the real first content. The check re-runs when a panel's content changes, when a custom element inside it upgrades, and when panels are added or removed, so a panel filled after mount is treated like one present in the initial markup. A `tabindex` you set on a panel yourself is left alone, and a panel that currently has focus keeps its stop until focus moves on rather than being blurred mid-update.
