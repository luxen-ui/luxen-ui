---
'luxen-ui': patch
---

`l-prose-editor` now shows a visible focus indicator on the field itself: focusing the editable area turns the whole editor frame — toolbar and content — to the focus-ring color and adds the soft halo, fading in over 150ms. It is now indistinguishable from a focused `l-input` or `l-textarea`. Focusing a toolbar button still shows only that button's own ring. The color is themable through the new `--border-color-focus` custom property.

The frame's border is the primary layer, so the indicator follows `--border-radius` (including the collapsed corners under `toolbar-placement`) and survives an ancestor with `overflow: hidden`, which would clip the halo. Consumers who added their own focus ring around the editable area can remove it.

Two related fixes to the same frame:

- The toolbar had no `border-radius`, so the editor rendered with square top corners and a rounded bottom instead of one rounded box. Both halves now start from `--border-radius`.
- The editor stretches to full width like the other text controls, so it no longer collapses to fit-content inside `l-form-field` (or any other shrink-to-fit container such as a flex or grid item).
