---
outline: deep
---

# Colors

Luxen UI color palette built on **oklch** — a single base color per family, the entire scale derived via CSS relative color syntax.

## Palette

Each family starts from one oklch source color (at peak chroma, ~step 600). All 11 steps are derived by adjusting lightness and chroma proportionally.

<ColorPalette name="blue" base="oklch(55% 0.245 263)" />
<ColorPalette name="red" base="oklch(58% 0.245 27)" />
<ColorPalette name="green" base="oklch(63% 0.20 150)" />
<ColorPalette name="yellow" base="oklch(68% 0.16 76)" />
<ColorPalette name="gray" base="oklch(45% 0.03 260)" />

### Scale derivation

Lightness decreases linearly from 97% (step 50) to 28% (step 950). Chroma follows a bell curve peaking at step 600 (the base color).

```css
/* From a single base color: */
--blue-50: oklch(from var(--base) 97% calc(c * 0.06) h);
--blue-100: oklch(from var(--base) 93% calc(c * 0.13) h);
--blue-200: oklch(from var(--base) 88% calc(c * 0.24) h);
--blue-300: oklch(from var(--base) 81% calc(c * 0.43) h);
--blue-400: oklch(from var(--base) 71% calc(c * 0.67) h);
--blue-500: oklch(from var(--base) 62% calc(c * 0.87) h);
--blue-600: oklch(from var(--base) 55% c h); /* = base */
--blue-700: oklch(from var(--base) 49% calc(c * 0.99) h);
--blue-800: oklch(from var(--base) 42% calc(c * 0.81) h);
--blue-900: oklch(from var(--base) 38% calc(c * 0.6) h);
--blue-950: oklch(from var(--base) 28% calc(c * 0.37) h);
```

## Semantic mapping

Semantic tokens point to specific palette steps. Dark mode flips the mapping.

| Token      | Light     | Dark      | Usage                         |
| ---------- | --------- | --------- | ----------------------------- |
| `--text`   | **700**   | **300**   | Semantic text, labels         |
| `--soft`   | **50**    | **950**   | Toast, alert containers       |
| `--subtle` | **100**   | **900**   | Badges, tags, selected states |
| `--strong` | **600**   | **500**   | Solid badges, high-emphasis   |
| `--border` | 700 @ 30% | 300 @ 30% | Badge borders, outlines       |

```css
:root {
  --l-color-text-info: var(--l-blue-700);
  --l-color-bg-fill-info-soft: var(--l-blue-50);
  --l-color-bg-fill-info-subtle: var(--l-blue-100);
  --l-color-bg-fill-info-strong: var(--l-blue-600);
}

@media (prefers-color-scheme: dark) {
  --l-color-text-info: var(--l-blue-300);
  --l-color-bg-fill-info-soft: var(--l-blue-950);
  --l-color-bg-fill-info-subtle: var(--l-blue-900);
  --l-color-bg-fill-info-strong: var(--l-blue-500);
}
```

## Semantic roles

Left half = light mode, right half = dark mode.

<ColorScale name="blue" base="oklch(55% 0.245 263)" />
<ColorScale name="red" base="oklch(58% 0.245 27)" />
<ColorScale name="green" base="oklch(63% 0.20 150)" />
<ColorScale name="yellow" base="oklch(68% 0.16 76)" />
<ColorScale name="gray" base="oklch(45% 0.03 260)" />

## Usages

Real component examples using the derived palette. Top row = light mode, bottom row = dark mode.

<ColorUsage />
