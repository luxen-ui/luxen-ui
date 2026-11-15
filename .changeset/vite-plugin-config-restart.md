---
'luxen-ui': patch
---

Editing `luxen.config.mjs` (or `luxen.config.js`) while `vite dev` runs now restarts the dev server, the way editing `vite.config` does, so a renamed prefix or a new color-scheme setting takes effect without stopping and starting the server by hand.
