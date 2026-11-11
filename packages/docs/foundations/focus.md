---
outline: deep
---

<script setup>
import tabThrough from '../.vitepress/examples/focus/TabThrough.html?raw'
import onBand from '../.vitepress/examples/focus/OnBand.html?raw'
import oneThickness from '../.vitepress/examples/focus/OneThickness.html?raw'
import fieldStroke from '../.vitepress/examples/focus/FieldStroke.html?raw'
</script>

# Focus

The focus indicator shows where the keyboard is. Every Luxen element draws it from the same three tokens, on `:focus-visible`, as an `outline`. Press <kbd>Tab</kbd>:

<ComponentWrapper :html="tabThrough" />

## Anatomy

<FocusFigure name="anatomy">
Each shape at real size, then one edge magnified 20×. The stroke is drawn inward from the field's outer edge, over the border: hatched where it lands once set.
</FocusFigure>

| Part   | Token                                          | Default                      |
| ------ | ---------------------------------------------- | ---------------------------- |
| Offset | `--l-focus-ring-offset`                        | `2px`                        |
| Ring   | `--l-focus-ring-width`, `--l-focus-ring-color` | `2px`, `#d9461f`             |
| Halo   | `--l-form-control-focus-halo-width`            | `3px`, the ring color at 22% |
| Border | `--l-form-control-border-width`                | `1px`, in the ring color     |
| Stroke | `--l-form-control-focus-border-width`          | `0`, drawn inward            |

An invalid field takes `--l-form-control-border-color-invalid` for its halo, border and stroke.

## Placements

<FocusFigure name="shapes">
The same three tokens, three placements.
</FocusFigure>

| Placement     | Drawn                                                        | Used by                                                                                                                                                         |
| ------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Outside       | `outline-offset: var(--l-focus-ring-offset)`                 | Button, link, checkbox, radio, switch, tag, avatar, breadcrumb, slider thumb, rating star, carousel buttons                                                     |
| Inside        | `outline-offset: calc(var(--l-focus-ring-width) * -1)`       | Menu item, tabs, segmented control, disclosure summary, input stepper, carousel dots — items set edge to edge, where an outside ring would overlap the neighbor |
| Field         | Border recolored, stroke inward, halo outside (`box-shadow`) | Input, textarea, select, `l-input-group`, `l-select` and its search box, `l-combobox`, `l-prose-editor`, the active `l-input-otp` cell                          |
| Active option | Inside ring, once the arrow keys moved it                    | `l-select` and `l-combobox` options                                                                                                                             |

In a listbox, DOM focus stays on the field and `aria-activedescendant` points at the option. The browser draws no focus there, so the option draws the ring itself when the keyboard moved it. A mouse-driven highlight stays a tint, like a hover.

## Shown when it helps

[`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible) lets the browser decide whether focus needs an indicator. Luxen never styles `:focus` alone.

| Focus arrives by           | On                         | Indicator                      |
| -------------------------- | -------------------------- | ------------------------------ |
| <kbd>Tab</kbd>, arrow keys | Any control                | Shown                          |
| Click or tap               | Button, checkbox, tab, row | Hidden                         |
| Click or tap               | Text field                 | Shown — typing follows         |
| Script (`element.focus()`) | Any control                | Same as the element focus left |

When a script moves focus after a click and the user must see where it landed, force it: `element.focus({ focusVisible: true })`.

## Contrast

The ring needs **3:1** against the surface it sits on. The default passes on Luxen surfaces in both schemes, not on every background you may put under it.

<FocusFigure name="contrast">
The same ring on four surfaces, with its contrast against each.
</FocusFigure>

Tokens cascade: set the color on the container that changes the background.

```css
.hero {
  --l-focus-ring-color: white;
}
```

<ComponentWrapper :html="onBand" />

Over a photo or a video no single color is safe. Use two — a light ring edged with dark ([WCAG technique C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40)), as `l-stories-viewer` does for the buttons over its media:

```css
.on-media :focus-visible {
  outline: var(--l-focus-ring-width) solid white;
  outline-offset: var(--l-focus-ring-offset);
  box-shadow: 0 0 0 calc(var(--l-focus-ring-offset) + var(--l-focus-ring-width) * 2) black;
}
```

## Never hidden

A sticky header or bar can cover the element that just received focus. Reserve their height on the scroll container:

<FocusFigure name="obscured">
Tabbing backward scrolls the focused link under the header. <code>scroll-padding</code> keeps it clear.
</FocusFigure>

```css
html {
  scroll-padding-block: 4rem 5rem; /* sticky header, sticky bar */
}
```

A container with `overflow: hidden` clips an outside ring. Give it padding of at least offset + width (`4px` by default).

## Forced colors

In forced colors mode (Windows High Contrast), the browser drops every `box-shadow` and repaints `outline` in a system color. Luxen rings are outlines. A field's halo is a shadow, so fields add a transparent outline there for the system to repaint.

<FocusFigure name="forced-colors">
Left of each pair: default rendering. Right: forced colors, simulated.
</FocusFigure>

## Variants

Deliberate departures from the three tokens, each for a reason:

| Where                                 | Variant                                                            | Why                                                                |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Invalid field                         | Border, stroke and halo in `--l-form-control-border-color-invalid` | The error stays readable while the field is focused                |
| Destructive menu item                 | Ring in `--l-color-text-danger`                                    | Matches the item's own danger color                                |
| Tree row, prose editor toolbar button | Half the offset                                                    | Rows and buttons sit edge to edge; a full gap reaches the neighbor |
| Carousel buttons                      | Gap filled with `--l-color-surface`                                | They float over slides: the ring always sits next to a known color |
| Stories viewer buttons                | Light ring edged with a dark band                                  | They float over video, whose brightness is unknown                 |
| `l-input-otp`, `l-prose-editor`       | `--cell-focus-color`, `--border-color-focus`                       | Per-element color override, defaulting to `--l-focus-ring-color`   |

## Your own controls

Plain links, `<button>` and `<summary>` already take the ring from Luxen's base CSS (zero specificity: any rule of yours wins). For anything else, reuse the tokens so custom controls match:

```css
.card-link:focus-visible {
  outline: var(--l-focus-ring-width) solid var(--l-focus-ring-color);
  outline-offset: var(--l-focus-ring-offset);
}

/* Inside a clipping container: flush with the inner edge */
.menu-row:focus-visible {
  outline: var(--l-focus-ring-width) solid var(--l-focus-ring-color);
  outline-offset: calc(var(--l-focus-ring-width) * -1);
}

/* Ring on a wrapper whose focusable child is visually hidden */
.swatch:has(input:focus-visible) {
  outline: var(--l-focus-ring-width) solid var(--l-focus-ring-color);
  outline-offset: var(--l-focus-ring-offset);
}
```

## Theming

### Brand color

One value per scheme with `light-dark()` — 6.9:1 on white, 8.8:1 on the dark surface. For a neutral ring that follows the scheme and forced colors on its own, use the system color `CanvasText`.

```css
:root {
  --l-focus-ring-color: light-dark(oklch(48% 0.2 265), oklch(78% 0.14 265));
}
```

### One thickness everywhere

Point the field stroke at the ring width and drop the halo:

```css
:root {
  --l-focus-ring-width: 3px;
  --l-form-control-focus-border-width: var(--l-focus-ring-width);
  --l-form-control-focus-halo-width: 0;
}
```

<ComponentWrapper :html="oneThickness" />

### Crisp field stroke

A 2px stroke, no halo. The stroke is drawn inward: the field keeps its size and its text does not move.

```css
:root {
  --l-form-control-focus-border-width: 2px;
  --l-form-control-focus-halo-width: 0;
}
```

<ComponentWrapper :html="fieldStroke" />

::: details Code
<<< @/.vitepress/examples/focus/FieldStroke.html [HTML]
:::

## Accessibility

<AccessibilityTable :data="[
  { Check: 'Visible', Description: 'Every focusable element shows an indicator on keyboard focus', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Contrast', Description: 'The indicator has 3:1 against adjacent colors: 4.3:1 on white, 4.1:1 on the dark surface', WCAG: '[WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast), [RGAA 3.3](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#3.3)' },
  { Check: 'Size', Description: 'Outside rings are a solid 2px perimeter, the minimum area of Focus Appearance (AAA). Inside rings and the default field border cover less: set `--l-focus-ring-width` and `--l-form-control-focus-border-width` to `3px` to meet it everywhere', WCAG: '[WCAG 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)' },
  { Check: 'Not obscured', Description: 'Rings between items set edge to edge are drawn inside, so none is covered by a neighbor; `scroll-padding` keeps focus clear of sticky content', WCAG: '[WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum), [WCAG 2.4.12](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-enhanced)' },
  { Check: 'Forced colors', Description: 'Indicators are outlines, repainted by the system; never a `box-shadow` alone', WCAG: '[WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible), [RGAA 10.7](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#10.7)' },
  { Check: 'Order', Description: 'Focus follows DOM order; composite widgets (tabs, tree, menu, radio group) are one Tab stop with arrow keys inside, and focus is never trapped', WCAG: '[WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order), [WCAG 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap), [RGAA 12.8](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.8), [RGAA 12.9](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#12.9)' },
]" :rules="[
  'Never write `outline: none` without an equally visible replacement',
  'Style `:focus-visible`, not `:focus`',
  'Draw indicators with `outline`; a `box-shadow` alone disappears in forced colors',
  'Keep `--l-focus-ring-width` at `2px` or more',
  'Check `--l-focus-ring-color` at 3:1 against every background it lands on, in light and dark; scope it where a background differs',
  'Set `scroll-padding` on the scroll container when the page has sticky headers or bars',
  'Never use a positive `tabindex`',
]" :references="[
  '[Sara Soueidan — A guide to designing accessible, WCAG-conformant focus indicators](https://www.sarasoueidan.com/blog/focus-indicators/) — the reference walkthrough of area, contrast and outline vs box-shadow',
  '[Patrick H. Lauke, TetraLogical — What’s new in WCAG 2.2](https://tetralogical.com/blog/2023/10/05/whats-new-wcag-2.2) — Focus Not Obscured (2.4.11, 2.4.12) and Focus Appearance (2.4.13), and why the latter moved to AAA',
  '[Adrian Roselli — Avoid default browser focus styles](https://adrianroselli.com/2017/02/avoid-default-browser-focus-styles.html) — why browser defaults fail contrast on many backgrounds',
  '[Adrian Roselli — 2.4.11: adversarial conformance](https://adrianroselli.com/2023/10/2-4-11-adversarial-conformance.html) — why a sliver of visible control is not enough in practice',
  '[GOV.UK Design System — Understanding focus state styles](https://design-system.service.gov.uk/get-started/focus-states/) — a two-color indicator that contrasts on any background',
  '[Eric Bailey, Piccalilli — Taking a shot at the double focus ring problem using modern CSS](https://piccalil.li/blog/taking-a-shot-at-the-double-focus-ring-problem-using-modern-css/) — two-color rings without extra markup',
  '[Melanie Richards and Alison Maher, Microsoft Edge — Styling for Windows high contrast with forced colors](https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/) — what forced colors overrides: `box-shadow` reverted, `outline-color` replaced',
  '[WCAG techniques](https://www.w3.org/WAI/WCAG22/Techniques/) — [C45](https://www.w3.org/WAI/WCAG22/Techniques/css/C45) `:focus-visible`, [C40](https://www.w3.org/WAI/WCAG22/Techniques/css/C40) two-color indicator, [C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43) `scroll-padding`, [G195](https://www.w3.org/WAI/WCAG22/Techniques/general/G195) author-supplied indicator, [F78](https://www.w3.org/WAI/WCAG22/Techniques/failures/F78) failure: indicator removed',
  '[ARIA APG — Developing a keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) — roving `tabindex` and `aria-activedescendant` for composite widgets',
  '[Selectors Level 4 — the :focus-visible pseudo-class](https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo) — the heuristics browsers apply',
]" />

## Tokens

<DesignTokens category="focus" />

<DesignTokens category="form" group="focus" />
