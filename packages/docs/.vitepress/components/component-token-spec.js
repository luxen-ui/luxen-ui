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
 *               and, for the icon tokens, each element drawing the icon:
 *                 caret, marker, picker, menuItem / menuLabel, tree, close
 *   legend    → (optional) Default-cell caption, when the raw value is
 *               unreadable (an icon's data URI)
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

/**
 * "Touches" value of every icon token: a solid dot in place of the icon, so
 * each spot the token is drawn stands out.
 */
const HL_ICON = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='7'/></svg>")`;
/** Paints the icons violet, each through its element's own color knob. */
const PAINT_ICON = {
  caret: { '--caret-color': HL },
  marker: { '--marker-color': HL },
  picker: { '--l-form-control-placeholder-color': HL },
  // The menu-item icons take the row color: paint the row, give the label its color back.
  menuItem: { '--l-color-text-primary': HL },
  menuLabel: { color: 'var(--vp-c-text-1)' },
  tree: { '--l-color-text-secondary': HL },
  close: { '--icon-color': HL },
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

  '--l-icon-chevron-down': {
    preview: 'icon-chevron-down',
    highlight: HL_ICON,
    paint: PAINT_ICON,
    legend: 'lucide:chevron-down',
    touches: 'Select, combobox, disclosure, open tree item',
  },
  '--l-icon-chevron-right': {
    preview: 'icon-chevron-right',
    highlight: HL_ICON,
    paint: PAINT_ICON,
    legend: 'lucide:chevron-right',
    touches: 'Submenu indicator, closed tree item',
  },
  '--l-icon-check': {
    preview: 'icon-check',
    highlight: HL_ICON,
    paint: PAINT_ICON,
    legend: 'lucide:check',
    touches: 'Checked menu item, selected option',
  },
  '--l-icon-close': {
    preview: 'icon-close',
    highlight: HL_ICON,
    paint: PAINT_ICON,
    legend: 'lucide:x',
    touches: 'Close button',
  },
  '--l-icon-clear': {
    preview: 'icon-clear',
    highlight: HL_ICON,
    // No color paint: the clear button shares its color with the chevron.
    legend: 'lucide:x',
    touches: 'Select, combobox & search clear',
  },
  '--l-icon-plus': {
    preview: 'icon-plus',
    highlight: HL_ICON,
    paint: PAINT_ICON,
    legend: 'lucide:plus',
    touches: 'Disclosure plus marker, stepper increment',
  },
  '--l-icon-minus': {
    preview: 'icon-minus',
    highlight: HL_ICON,
    // No color paint: both stepper buttons share the host color.
    legend: 'lucide:minus',
    touches: 'Stepper decrement',
  },
};
