/**
 * How each form token is illustrated on the Design Tokens page.
 *
 * Every token renders twice with a real Luxen control: once at its default
 * value, once with ONLY that token forced to a highlight (a vivid color for
 * color tokens, an exaggerated value for the others) — so the second cell
 * shows exactly which part of the control the token paints or sizes.
 *
 *   preview   → which control markup to render (see FormTokenPreview.vue)
 *   highlight → value the token is forced to in the "Touches" cell
 *   paint     → (optional) extra style put on the affected element in the
 *               "Touches" cell, for tokens that aren't a color (sizes, gaps,
 *               weights): paints the area they control in the same violet
 *   touches   → short caption naming the affected part
 *
 * Groups are listed in display order; the page renders one
 * `<DesignTokens category="form" group="…">` per group.
 */

/** Violet — a hue no Luxen token uses (brand orange, accent blue, status red/green/amber, match yellow), so it can't be mistaken for a default. */
// Lighter in dark mode so violet text and borders keep their contrast on dark surfaces.
export const HL = 'light-dark(oklch(55% 0.22 295), oklch(72% 0.17 295))';
/** Same hue, translucent — for fills that sit behind text. */
const HL_FILL = 'oklch(55% 0.22 295 / 22%)';
/** Paints the control's border violet — for the border geometry tokens. */
const PAINT_BORDER = { '--l-form-control-border-color': HL };
/** Dashed violet frame around each toggle box. */
const PAINT_FRAME = { outline: `1px dashed ${HL}`, outlineOffset: '2px' };

export const FORM_TOKEN_GROUPS = {
  // Shared by text fields AND the checkbox / radio box — previewed on both
  // (`mixed*`), so the highlight shows every control the token reaches.
  control: {
    '--l-form-control-background-color': {
      preview: 'mixed',
      highlight: HL_FILL,
      touches: 'Field and toggle fill',
    },
    '--l-form-control-border-color': {
      preview: 'mixed',
      highlight: HL,
      touches: 'Border at rest',
    },
    '--l-form-control-border-color-hover': {
      preview: 'mixed-hover',
      highlight: HL,
      touches: 'Border on hover',
    },
    '--l-form-control-border-color-invalid': {
      preview: 'mixed-invalid',
      highlight: HL,
      touches: 'Border when invalid',
    },
    '--l-form-control-border-width': {
      preview: 'mixed',
      highlight: '3px',
      paint: PAINT_BORDER,
      touches: 'Border thickness',
    },
  },
  field: {
    '--l-form-control-value-color': { preview: 'input', highlight: HL, touches: 'Entered value' },
    '--l-form-control-placeholder-color': {
      preview: 'placeholder',
      highlight: HL,
      touches: 'Placeholder text',
    },
    '--l-form-control-border-radius': {
      preview: 'input',
      highlight: '9999px',
      paint: PAINT_BORDER,
      touches: 'Corner rounding',
    },
    '--l-form-control-height': {
      preview: 'input',
      highlight: '3.5rem',
      paint: { '--l-form-control-background-color': HL_FILL },
      touches: 'Control height',
    },
    '--l-form-control-padding-inline': {
      preview: 'input',
      highlight: '2.5rem',
      // Violet on the padding box, the control fill back on the content box:
      // only the inline padding shows (text controls have no block padding).
      paint: {
        backgroundImage: `linear-gradient(var(--l-form-control-background-color) 0 0), linear-gradient(${HL_FILL} 0 0)`,
        backgroundClip: 'content-box, padding-box',
      },
      touches: 'Inline padding',
    },
    '--l-form-control-icon-size': {
      preview: 'select',
      highlight: '2em',
      paint: { '--caret-color': HL },
      touches: 'End glyphs',
    },
  },
  // The focused text field: stroke and halo. Previewed pinned in the focus
  // state; the highlight recolors the ring violet so the stroke reads apart
  // from the brand-orange default.
  focus: {
    '--l-form-control-focus-border-width': {
      preview: 'input-focus',
      highlight: '5px',
      paint: { '--l-focus-ring-color': HL },
      touches: 'Focus stroke width',
    },
    '--l-form-control-focus-halo-width': {
      preview: 'input-focus',
      highlight: '8px',
      paint: { '--l-focus-ring-color': HL },
      touches: 'Focus halo width',
    },
  },
  toggle: {
    '--l-form-control-activated-color': {
      preview: 'toggles-on',
      highlight: HL,
      touches: 'Checked / on fill',
    },
    '--l-form-control-activated-content-color': {
      preview: 'toggles-on',
      highlight: HL,
      // The checkbox check and radio dot are baked-white SVGs — only the switch
      // thumb reads this token (its description says so too).
      touches: 'Switch thumb only',
    },
    '--l-form-control-toggle-size': {
      preview: 'toggles-on',
      highlight: '2em',
      paint: PAINT_FRAME,
      touches: 'Toggle box size',
    },
    '--l-form-control-toggle-halo-ratio': {
      preview: 'halo',
      highlight: '0.6',
      touches: 'Hover halo width',
    },
    '--l-form-control-track-color-off': {
      preview: 'switch-off',
      highlight: HL,
      touches: 'Switch track, off',
    },
  },
  disabled: {
    '--l-form-control-background-color-disabled': {
      preview: 'mixed-disabled',
      highlight: HL_FILL,
      touches: 'Fill, box and off track',
    },
    '--l-form-control-border-color-disabled': {
      preview: 'mixed-disabled',
      highlight: HL,
      touches: 'Field and box border',
    },
    '--l-form-control-text-color-disabled': {
      preview: 'field-disabled',
      highlight: HL,
      touches: 'Label and hint',
    },
    '--l-form-control-mark-color-disabled': {
      preview: 'switch-off-disabled',
      highlight: HL,
      touches: 'Switch thumb, off + disabled',
    },
  },
  labels: {
    '--l-form-control-label-color': { preview: 'label', highlight: HL, touches: 'Field label' },
    '--l-form-control-hint-color': { preview: 'hint', highlight: HL, touches: 'Hint text' },
    '--l-form-control-error-message-color': {
      preview: 'error',
      highlight: HL,
      touches: 'Error message',
    },
    '--l-form-control-required-content': {
      preview: 'required',
      highlight: "' (required)'",
      touches: 'Required indicator',
    },
    '--l-form-control-required-color': {
      preview: 'required',
      highlight: HL,
      touches: 'Required indicator',
    },
  },
  layout: {
    '--l-form-control-label-gap': {
      preview: 'stacked',
      highlight: '1.25rem',
      paint: { background: HL_FILL },
      touches: 'Label ↔ control',
    },
    '--l-form-control-choice-label-gap': {
      preview: 'inline',
      highlight: '2.5rem',
      paint: { background: HL_FILL },
      touches: 'Toggle ↔ label',
    },
  },
  match: {
    '--l-form-control-match-background-color': {
      preview: 'match',
      highlight: HL_FILL,
      touches: 'Matched characters',
    },
    '--l-form-control-match-font-weight': {
      preview: 'match',
      highlight: 'var(--l-font-weight-bold)',
      paint: { color: HL },
      touches: 'Matched characters',
    },
  },
};

/** Flat lookup: token name → spec. */
export const FORM_TOKEN_SPEC = Object.fromEntries(
  Object.values(FORM_TOKEN_GROUPS).flatMap((group) => Object.entries(group)),
);
