---
'luxen-ui': patch
---

Fix `l-tooltip` auto-derived text color on custom backgrounds. The `contrast-color()` path used the withdrawn `color-contrast()` syntax (`… vs … to AA`), so its `@supports` guard evaluated false in every browser and the native path never ran — text color always fell back to an OKLCH-lightness threshold, which tracks hue rather than luminance and could collapse contrast to ≈1:1 on a saturated `--background-color`. The tooltip now uses the single-argument `contrast-color()` where supported and a squared-sRGB luminance approximation as the fallback, matching `l-avatar`.
