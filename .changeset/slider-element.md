---
'luxen-ui': minor
---

Add `<l-slider>`, a single- or dual-thumb range slider. Set `value` (with `min`, `max`, `step`), or add `range` with `min-value` / `max-value` for a min–max selection whose thumbs cannot cross. It's a form-associated custom element — the value is submitted under `name` (range mode submits the low and high values as two entries) — with full keyboard support (arrows, Page, Home/End), `role="slider"` thumbs, size variants (`xs`–`xl`), and a shadcn-style look. Emits typed `input` and `change` events (with `value` and `values`) and exposes the `base`, `track`, `indicator` and `thumb` CSS parts plus `--track-size`, `--thumb-size`, `--track-color`, `--indicator-color` and `--thumb-color`.
