---
'luxen-ui': patch
---

Fix the `<button class="l-close" data-appearance="square">` icon being offset by ~2px from the button's geometric center. The `padding: 8px` had no effect on the button size (Tailwind's global `box-sizing: border-box` absorbs it) but shrunk the grid content area below the icon's intrinsic size, breaking centering. Removing the padding restores proper centering.
