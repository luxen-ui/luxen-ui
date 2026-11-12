/**
 * How each semantic color token is illustrated on the Design Tokens page — the
 * same Default / Touches pattern as the form and component tokens (see
 * form-token-spec.js): a real piece of UI at the token's default, then with
 * ONLY that token forced to violet, so the second cell shows where it lands.
 *
 *   preview   → which illustration to render (see ColorTokenPreview.vue)
 *   highlight → value the token is forced to in the "Touches" cell
 *   touches   → short caption naming what the token paints
 *   height    → (optional) cell height, for illustrations taller than 5rem
 *
 * The status fills (`--l-color-bg-fill-<tone>-<tier>`) are not listed: one
 * Touches row each would teach nothing — the matrix in FillTokenMatrix.vue
 * shows the tone × tier grid on real badges instead.
 */
import { HL } from './form-token-spec.js';

/** Same hue as HL, translucent — for fills that sit behind text. */
const HL_FILL = 'oklch(55% 0.22 295 / 22%)';
/** Same hue, a solid tint — for a fill that IS the shape (skeleton). */
const HL_SOLID = 'light-dark(oklch(80% 0.1 295), oklch(45% 0.16 295))';
/** Same hue as a scrim — dims the page like a backdrop does. */
const HL_SCRIM = 'oklch(45% 0.2 295 / 45%)';
/**
 * HL inverted — for text on the brand fill, which inverts too (near-black in
 * light mode, near-white in dark): the light violet reads on the dark fill and
 * the deep one on the light fill.
 */
const HL_ON_FILL = 'light-dark(oklch(78% 0.14 295), oklch(50% 0.22 295))';

const STATUS_TOUCHES = 'Alert accents, badge';

export const COLOR_TOKEN_SPEC = {
  // ─── Text ───
  '--l-color-text-primary': { preview: 'card', highlight: HL, touches: 'Headings and body text' },
  '--l-color-text-secondary': { preview: 'card', highlight: HL, touches: 'Supporting text' },
  '--l-color-text-tertiary': { preview: 'card', highlight: HL, touches: 'Metadata, placeholders' },
  '--l-color-text-neutral': { preview: 'status', highlight: HL, touches: 'Alert icon, badge' },
  '--l-color-text-info': { preview: 'status', highlight: HL, touches: STATUS_TOUCHES },
  '--l-color-text-warning': { preview: 'status', highlight: HL, touches: STATUS_TOUCHES },
  '--l-color-text-danger': { preview: 'status', highlight: HL, touches: STATUS_TOUCHES },
  '--l-color-text-success': { preview: 'status', highlight: HL, touches: STATUS_TOUCHES },
  // Luxen's own form controls dim with the translucent `--l-form-control-*-disabled`
  // tokens; the three disabled semantics are the recipe for custom controls,
  // so they share a field drawn from them.
  '--l-color-text-disabled': { preview: 'disabled', highlight: HL, touches: 'Disabled text' },
  '--l-color-text-on-fill-brand': {
    preview: 'buttons',
    highlight: HL_ON_FILL,
    touches: 'Primary button label',
  },

  // ─── Surface ───
  '--l-color-surface': { preview: 'page', highlight: HL_FILL, touches: 'Page and field fill' },
  '--l-color-surface-overlay': {
    preview: 'menu',
    highlight: HL_FILL,
    touches: 'Menu, popover, dialog',
    height: '7.5rem',
  },
  '--l-color-bg-disabled': { preview: 'disabled', highlight: HL_FILL, touches: 'Disabled fill' },
  '--l-color-bg-loading': { preview: 'skeleton', highlight: HL_SOLID, touches: 'Skeleton shapes' },
  '--l-color-bg-loading-shimmer': {
    preview: 'skeleton',
    highlight: HL_SOLID,
    touches: 'Sheen of the wave',
  },
  '--l-color-bg-state-hover': {
    preview: 'menu',
    highlight: HL_FILL,
    touches: 'Hovered row',
    height: '7.5rem',
  },
  '--l-color-bg-state-selected': {
    preview: 'menu',
    highlight: HL_FILL,
    touches: 'Selected row (tree)',
    height: '7.5rem',
  },
  '--l-backdrop': { preview: 'backdrop', highlight: HL_SCRIM, touches: 'Behind a dialog' },
  '--l-backdrop-strong': {
    preview: 'backdrop',
    highlight: HL_SCRIM,
    touches: 'Behind a media viewer',
  },

  // ─── Border ───
  '--l-color-border': { preview: 'fields', highlight: HL, touches: 'Field and button edge' },
  '--l-color-border-interactive': { preview: 'kbd', highlight: HL, touches: 'Key caps, rings' },
  '--l-color-border-overlay': {
    preview: 'menu',
    highlight: HL,
    touches: 'Menu and popover edge',
    height: '7.5rem',
  },
  '--l-color-border-disabled': { preview: 'disabled', highlight: HL, touches: 'Disabled border' },
  '--l-color-divider': {
    preview: 'menu',
    highlight: HL,
    touches: 'Separator line',
    height: '7.5rem',
  },

  // ─── Fill ───
  '--l-color-bg-fill-brand': { preview: 'buttons', highlight: HL, touches: 'Primary button' },
  '--l-color-bg-fill-brand-hover': {
    preview: 'buttons-hover',
    highlight: HL,
    touches: 'Primary button, hovered',
  },
  '--l-color-bg-fill-brand-active': {
    preview: 'buttons-active',
    highlight: HL,
    touches: 'Primary button, pressed',
  },
  '--l-color-bg-fill-secondary': {
    preview: 'buttons',
    highlight: HL_FILL,
    touches: 'Secondary button',
  },
};

/** `--l-color-bg-fill-<tone>-<tier>` → { tone, tier }, or null for any other token. */
export function statusFill(name) {
  const m = name.match(
    /^--l-color-bg-fill-(neutral|info|warning|danger|success)-(soft|subtle|strong)$/,
  );
  return m ? { tone: m[1], tier: m[2] } : null;
}
