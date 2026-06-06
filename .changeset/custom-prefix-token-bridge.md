---
'luxen-ui': patch
---

Fixed custom `cssPrefix` builds silently breaking Shadow-DOM component defaults. Shadow-DOM CSS reads canonical `--l-*` design tokens, but a custom prefix only emitted `--{prefix}-*`, so selected/hover backgrounds, borders, and focus rings resolved to nothing (the focus ring even fell back to the OS `Highlight` color). The Vite plugin now appends an automatic `:root` bridge (`--l-*: var(--{prefix}-*)`) to your imported tokens, so every Shadow-DOM token resolves with no extra setup. Default `l` builds are unchanged. The `<l-tree>` focus ring also dropped its `Highlight` fallback so it matches every other component, and `<l-tree-item>` no longer paints a second (browser-default) outline around the whole subtree when a row is focused — only the brand ring on the focused row shows.
