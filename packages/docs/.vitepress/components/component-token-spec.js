/**
 * How each component token (button, popover & menus, tooltip) is illustrated
 * on the Design Tokens page — the same Default / Touches pattern as the form
 * tokens (see form-token-spec.js).
 *
 *   preview   → which illustration to render (see ComponentTokenPreview.vue)
 *   highlight → value the token is forced to in the "Touches" cell
 *   paint     → (optional) styles put on named parts of the illustration in
 *               the "Touches" cell, painting the area the token sizes in violet:
 *                 button  → every `.l-button`
 *                 panel   → the menu panel
 *                 rowHost → every l-dropdown-item host (behind its row)
 *                 row     → the first row, shown in its hover state
 *                 content → the icon and label of every row
 *                 label   → the label text of every row
 *   touches   → short caption naming the affected part
 */
import { HL } from './form-token-spec.js';

/** Same hue as HL, translucent — for fills that sit behind text. */
const HL_FILL = 'oklch(55% 0.22 295 / 22%)';
/** Paints every button border violet — for the button geometry tokens. */
const PAINT_BUTTON_BORDER = { button: { '--border-color': HL, '--border-color-hover': HL } };
/** Paints the hovered row violet. */
const PAINT_ROW = { row: { background: HL_FILL } };
/** Paints the row violet but gives its icon and label the panel color back, so only the spacing around them shows. */
const PAINT_ROW_SPACING = {
  ...PAINT_ROW,
  content: { background: 'var(--l-color-surface-overlay)' },
};

export const COMPONENT_TOKEN_SPEC = {
  '--l-button-border-radius': {
    preview: 'buttons',
    highlight: '9999px',
    paint: PAINT_BUTTON_BORDER,
    touches: 'Corner rounding',
  },
  '--l-button-border-width': {
    preview: 'buttons',
    highlight: '3px',
    paint: PAINT_BUTTON_BORDER,
    touches: 'Border and seams',
  },

  '--l-popover-border-radius': {
    preview: 'menu',
    highlight: '1.5rem',
    paint: { panel: { borderColor: HL } },
    touches: 'Panel corners',
  },
  '--l-popover-padding': {
    preview: 'menu',
    highlight: '1rem',
    paint: {
      panel: { background: HL_FILL },
      rowHost: { background: 'var(--l-color-surface-overlay)' },
    },
    touches: 'Panel inset',
  },
  '--l-popover-shadow': {
    preview: 'menu',
    highlight: `0 10px 24px -2px ${HL}`,
    touches: 'Panel elevation',
  },
  '--l-popover-font-size': {
    preview: 'menu',
    highlight: '1.125rem',
    paint: { label: { color: HL } },
    touches: 'Row text size',
  },
  '--l-popover-line-height': {
    preview: 'menu',
    highlight: '2.75',
    paint: { label: { display: 'inline-block', background: HL_FILL } },
    touches: 'Line box',
  },
  '--l-menu-item-min-height': {
    preview: 'menu',
    highlight: '3rem',
    paint: PAINT_ROW,
    touches: 'Row height',
  },
  '--l-menu-item-padding-block': {
    preview: 'menu',
    highlight: '0.875rem',
    paint: PAINT_ROW_SPACING,
    touches: 'Row top / bottom inset',
  },
  '--l-menu-item-padding-inline': {
    preview: 'menu',
    highlight: '1.5rem',
    paint: PAINT_ROW_SPACING,
    touches: 'Row side inset',
  },
  '--l-menu-item-gap': {
    preview: 'menu',
    highlight: '1.5rem',
    paint: PAINT_ROW_SPACING,
    touches: 'Icon ↔ label',
  },
  '--l-menu-item-border-radius': {
    preview: 'menu',
    highlight: '1rem',
    paint: PAINT_ROW,
    touches: 'Row corners',
  },

  '--l-tooltip-background-color': {
    preview: 'tooltip',
    highlight: HL,
    touches: 'Tooltip surface',
  },
};
