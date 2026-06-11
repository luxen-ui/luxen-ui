---
'luxen-ui': patch
---

`<l-tabs>` now positions its active-tab indicator without relying on
`requestAnimationFrame`, so the indicator renders correctly when the tabs
start inside a hidden container (background tab, `display: none` ancestor,
preview panes) and stays aligned when the tablist resizes.
