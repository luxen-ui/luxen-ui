<script setup>
import { computed, ref } from 'vue';
import tokensJson from '@luxen-ui/design-tokens/json';
import ColorTokenPreview from './ColorTokenPreview.vue';
import ComponentTokenPreview from './ComponentTokenPreview.vue';
import FillTokenMatrix from './FillTokenMatrix.vue';
import { COLOR_TOKEN_SPEC, statusFill } from './color-token-spec.js';
import FormTokenPreview from './FormTokenPreview.vue';
import { COMPONENT_TOKEN_SPEC } from './component-token-spec.js';
import { FORM_TOKEN_GROUPS, FORM_TOKEN_SPEC, HL } from './form-token-spec.js';
import { matchesQuery, tokenQuery } from './token-filter.js';

const props = defineProps({
  category: { type: String, default: null },
  /** Sub-group of the `form` category (a key of FORM_TOKEN_GROUPS). */
  group: { type: String, default: null },
});

const CATEGORIES = {
  text: 'Text',
  surface: 'Surface',
  fill: 'Fill',
  border: 'Border',
  shadow: 'Shadow',
  focus: 'Focus',
  sizing: 'Sizing',
  spacing: 'Spacing',
  form: 'Form',
  button: 'Button',
  popover: 'Popover & menus',
  tooltip: 'Tooltip',
  icon: 'Icons',
};

// A form token missing from every group would silently vanish from the page.
if (import.meta.env.DEV) {
  const grouped = new Set(Object.values(FORM_TOKEN_GROUPS).flatMap((g) => Object.keys(g)));
  const orphans = tokensJson.filter((t) => t.category === 'form' && !grouped.has(t.name));
  if (orphans.length) {
    console.warn(
      `[DesignTokens] form tokens not assigned to a group in form-token-spec.js: ${orphans.map((t) => t.name).join(', ')}`,
    );
  }
  // Same for a semantic color token missing from color-token-spec.js.
  const colorOrphans = tokensJson.filter(
    (t) =>
      ['text', 'surface', 'border', 'fill'].includes(t.category) &&
      !COLOR_TOKEN_SPEC[t.name] &&
      !statusFill(t.name),
  );
  if (colorOrphans.length) {
    console.warn(
      `[DesignTokens] color tokens without an illustration in color-token-spec.js: ${colorOrphans.map((t) => t.name).join(', ')}`,
    );
  }
}

/** Tokens of a category, narrowed and ordered by a form sub-group when one is given. */
function tokensFor(key) {
  const inCategory = tokens.value.filter((t) => t.category === key);
  if (key !== 'form' || !props.group) return inCategory;
  const names = Object.keys(FORM_TOKEN_GROUPS[props.group] ?? {});
  return names.map((n) => inCategory.find((t) => t.name === n)).filter(Boolean);
}

// Narrowed by the page filter (TokenNav). A block left empty renders no rows,
// and the page hides its enclosing section (`not-has-[[data-viz]]:hidden`).
const tokens = computed(() =>
  tokensJson.filter((t) => t.category !== 'primitive' && matchesQuery(t, tokenQuery.value)),
);

const groups = computed(() => {
  const wanted = props.category ? [props.category] : Object.keys(CATEGORIES);
  return wanted
    .map((key) => ({
      key,
      label: CATEGORIES[key],
      tokens: tokensFor(key),
    }))
    .filter((g) => g.tokens.length > 0);
});

/** Whether the token has distinct light/dark values. */
function hasModes(t) {
  return t.light != null && t.dark != null;
}

/**
 * Maps a token to its visualization kind. Each kind has a dedicated template
 * branch + scoped styles for context-appropriate rendering.
 */
function vizKind(t) {
  if (t.category === 'form') return 'form';
  if (COLOR_TOKEN_SPEC[t.name]) return 'color';
  if (statusFill(t.name)) return 'fill-matrix';
  if (t.category === 'shadow') return 'shadow';
  if (t.category === 'focus') return 'focus-ring';
  if (t.category === 'sizing') return 'control';
  if (t.category === 'spacing') return 'gap';
  if (COMPONENT_TOKEN_SPEC[t.name]) return 'component';
  // An icon token no element draws by default: the icon alone.
  if (t.category === 'icon') return 'icon';
  return 'swatch';
}

/** Tokens drawn as a row — the status fills go to the matrix below the rows. */
function rowTokens(group) {
  return group.tokens.filter((t) => vizKind(t) !== 'fill-matrix');
}

/**
 * The focus-ring rows, shown like the form tokens: the controls that draw the
 * ring (button, checkbox, switch) at their default, then with ONLY this
 * token forced to an exaggerated value and the ring painted violet — so the
 * second cell shows what the token changes. Focus can't be triggered on an
 * inert preview, so their `:focus-visible` ring is pinned on.
 */
const FOCUS_TOKEN_SPEC = {
  '--l-focus-ring-color': { highlight: HL, touches: 'Ring color' },
  '--l-focus-ring-width': {
    highlight: '5px',
    paint: { '--l-focus-ring-color': HL },
    touches: 'Ring thickness',
  },
  '--l-focus-ring-offset': {
    highlight: '6px',
    paint: { '--l-focus-ring-color': HL },
    touches: 'Gap to the ring',
  },
};
function focusVars(t, highlight) {
  if (!highlight) return {};
  const spec = FOCUS_TOKEN_SPEC[t.name];
  return spec ? { [t.name]: spec.highlight, ...spec.paint } : {};
}
const pinnedRing = {
  outline: 'var(--l-focus-ring-width) solid var(--l-focus-ring-color)',
  outlineOffset: 'var(--l-focus-ring-offset)',
};

/** Lookup helper. */
function tokenByName(name) {
  return tokensJson.find((t) => t.name === name);
}

/** Short label for sizing tokens (xs/sm/md/lg/xl). */
function controlLabel(t) {
  return t.path[2];
}

/** Spacing base (`--l-spacing`) in px — derived from the tokens, not hardcoded. */
const spacingBasePx = (() => {
  const base = tokensJson.find((t) => t.name === '--l-spacing');
  const m = typeof base?.value === 'string' && base.value.match(/^([\d.]+)rem$/);
  return m ? parseFloat(m[1]) * 16 : 4;
})();

/**
 * Pixel equivalent for length tokens (root font-size 16px), or `null` when the
 * value isn't a convertible length (colors, raw `px`, `0`). Handles the two
 * shapes used by sizing/spacing tokens: a bare `rem` and the spacing scale's
 * `calc(var(--l-spacing) * N)`.
 */
function pxEquiv(value) {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  const rem = v.match(/^(-?[\d.]+)rem$/);
  if (rem) return fmtPx(parseFloat(rem[1]) * 16);
  const mult = v.match(/^calc\(\s*var\(--l-spacing\)\s*\*\s*([\d.]+)\s*\)$/);
  if (mult) return fmtPx(parseFloat(mult[1]) * spacingBasePx);
  return null;
}

/** Trim trailing zeros so 28.00 → "28px", 2.5 → "2.5px". */
function fmtPx(n) {
  return `${Number(n.toFixed(2))}px`;
}

/**
 * Legend shown under each swatch: the underlying CSS custom property name.
 *   var(--l-color-gray-700)   →  "--l-color-gray-700"
 *   var(--l-color-white)      →  "--l-color-white"
 *   var(--l-color-border)     →  "--l-color-border"   (alias-of-alias)
 *   var(--l-spacing-4)        →  "--l-spacing-4"
 *   #d9461f, oklch(…), calc(…)  →  kept raw
 */
function legend(value) {
  if (typeof value !== 'string') return String(value ?? '');
  const m = value.match(/^var\((--l-.+)\)$/);
  if (m) return m[1];
  return value;
}

/**
 * Default-cell legend of a color token: its light and dark primitives with
 * `--l-color-` dropped, the shared hue said once (`gray-700 · 200`). `full`
 * keeps both names whole, for the tooltip.
 */
function colorLegend(t, full = false) {
  const short = (v) => legend(v).replace(/^--l-color-/, '');
  if (!hasModes(t)) return short(t.value);
  const [light, dark] = [short(t.light), short(t.dark)];
  const hue = light.match(/^([a-z]+)-\d+$/)?.[1];
  if (!full && hue && dark.startsWith(`${hue}-`)) return `${light} · ${dark.slice(hue.length + 1)}`;
  return `${light} · ${dark}`;
}

const copied = ref(null);
let copyTimer;

function copy(name) {
  navigator.clipboard?.writeText(`var(${name})`);
  copied.value = name;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => (copied.value = null), 1200);
}
</script>

<template>
  <div class="tokens">
    <section
      v-for="group in groups"
      :key="group.key"
      class="tokens__group"
      :data-category="group.key"
    >
      <!-- Token rows -->
      <div
        v-for="token in rowTokens(group)"
        :key="token.name"
        class="tokens__row"
        :data-viz="vizKind(token)"
      >
        <!-- INFO block (full width, top) -->
        <div class="tokens__info">
          <button
            class="tokens__name"
            type="button"
            :title="`Copy var(${token.name})`"
            @click="copy(token.name)"
          >
            <code>{{ token.name }}</code>
            <span class="tokens__copied">{{ copied === token.name ? 'Copied' : '' }}</span>
          </button>
          <p
            v-if="token.description"
            class="tokens__desc"
          >
            {{ token.description }}
          </p>
        </div>

        <!-- VALUES block (cells in flex row, full width below info) -->
        <div class="tokens__cells">
          <!-- FORM: the live control at its default, then with only this
               token highlighted — shows exactly what the token touches. -->
          <template v-if="vizKind(token) === 'form'">
            <div
              v-for="highlight in [false, true]"
              :key="String(highlight)"
              class="tokens__cell"
              :data-mode="highlight ? 'highlight' : 'default'"
            >
              <div class="tokens__cell-viz">
                <FormTokenPreview
                  :token="token"
                  :highlight="highlight"
                />
              </div>
              <div class="tokens__cell-footer">
                <span
                  class="tokens__cell-mode"
                  :class="{ 'tokens__cell-mode--touch': highlight }"
                  >{{ highlight ? 'Touches' : 'Default' }}</span
                >
                <span
                  class="tokens__cell-legend"
                  :class="{ 'tokens__cell-legend--touch': highlight }"
                  >{{
                    highlight ? FORM_TOKEN_SPEC[token.name]?.touches : legend(token.value)
                  }}</span
                >
              </div>
            </div>
          </template>

          <!-- COLOR: same pattern as FORM — a real piece of UI at the token's
               default (its light and dark values in the footer), then with
               only this token painted violet. -->
          <template v-else-if="vizKind(token) === 'color'">
            <div
              v-for="highlight in [false, true]"
              :key="String(highlight)"
              class="tokens__cell"
              :data-mode="highlight ? 'highlight' : 'default'"
            >
              <div
                class="tokens__cell-viz"
                :style="{ blockSize: COLOR_TOKEN_SPEC[token.name].height ?? '5rem' }"
              >
                <ColorTokenPreview
                  :token="token"
                  :highlight="highlight"
                />
              </div>
              <div class="tokens__cell-footer">
                <span
                  class="tokens__cell-mode"
                  :class="{ 'tokens__cell-mode--touch': highlight }"
                  >{{ highlight ? 'Touches' : 'Default' }}</span
                >
                <template v-if="highlight">
                  <span class="tokens__cell-legend tokens__cell-legend--touch">{{
                    COLOR_TOKEN_SPEC[token.name].touches
                  }}</span>
                </template>
                <template v-else>
                  <span
                    class="tokens__cell-dots"
                    aria-hidden="true"
                  >
                    <template v-if="hasModes(token)">
                      <i :style="{ background: token.light }" />
                      <i :style="{ background: token.dark }" />
                    </template>
                    <i
                      v-else
                      :style="{ background: `var(${token.name})` }"
                    />
                  </span>
                  <span
                    class="tokens__cell-legend"
                    :title="colorLegend(token, true)"
                    >{{ colorLegend(token) }}</span
                  >
                </template>
              </div>
            </div>
          </template>

          <!-- COMPONENT: same pattern as FORM — the illustration at its
               default, then with only this token highlighted. -->
          <template v-else-if="vizKind(token) === 'component'">
            <div
              v-for="highlight in [false, true]"
              :key="String(highlight)"
              class="tokens__cell"
              :data-mode="highlight ? 'highlight' : 'default'"
            >
              <div class="tokens__cell-viz">
                <ComponentTokenPreview
                  :token="token"
                  :highlight="highlight"
                />
              </div>
              <div class="tokens__cell-footer">
                <span
                  class="tokens__cell-mode"
                  :class="{ 'tokens__cell-mode--touch': highlight }"
                  >{{ highlight ? 'Touches' : 'Default' }}</span
                >
                <span
                  class="tokens__cell-legend"
                  :class="{ 'tokens__cell-legend--touch': highlight }"
                  >{{
                    highlight
                      ? COMPONENT_TOKEN_SPEC[token.name]?.touches
                      : (COMPONENT_TOKEN_SPEC[token.name]?.legend ?? legend(token.value))
                  }}</span
                >
              </div>
            </div>
          </template>

          <!-- FOCUS RING: default, then only this token exaggerated (violet ring). -->
          <template v-else-if="vizKind(token) === 'focus-ring'">
            <div
              v-for="highlight in [false, true]"
              :key="String(highlight)"
              class="tokens__cell"
              :data-mode="highlight ? 'highlight' : 'default'"
            >
              <div class="tokens__cell-viz">
                <div
                  class="viz-focus"
                  :style="{ background: 'var(--l-color-surface)' }"
                >
                  <div
                    inert
                    class="flex items-center gap-5"
                    :style="focusVars(token, highlight)"
                  >
                    <button
                      type="button"
                      class="l-button"
                      :style="pinnedRing"
                    >
                      Save
                    </button>
                    <input
                      type="checkbox"
                      class="l-checkbox"
                      aria-label="Checkbox"
                      :style="pinnedRing"
                    />
                    <input
                      type="checkbox"
                      role="switch"
                      class="l-switch"
                      aria-label="Switch"
                      :style="pinnedRing"
                    />
                  </div>
                </div>
              </div>
              <div class="tokens__cell-footer">
                <span
                  class="tokens__cell-mode"
                  :class="{ 'tokens__cell-mode--touch': highlight }"
                  >{{ highlight ? 'Touches' : 'Default' }}</span
                >
                <span
                  class="tokens__cell-legend"
                  :class="{ 'tokens__cell-legend--touch': highlight }"
                  >{{
                    highlight ? FOCUS_TOKEN_SPEC[token.name]?.touches : legend(token.value)
                  }}</span
                >
              </div>
            </div>
          </template>

          <!-- SHADOW: dual cells. The value bakes in light-dark(), so we force
               color-scheme per cell to surface both casts regardless of page theme. -->
          <template v-else-if="vizKind(token) === 'shadow'">
            <div
              class="tokens__cell"
              :data-mode="'light'"
            >
              <div class="tokens__cell-viz">
                <div class="viz-shadow viz-shadow--light">
                  <span
                    class="viz-shadow__card"
                    :style="{ boxShadow: token.value }"
                  />
                </div>
              </div>
              <div class="tokens__cell-footer">
                <span class="tokens__cell-mode">Light</span>
                <span class="tokens__cell-legend">{{ legend(token.value) }}</span>
              </div>
            </div>
            <div
              class="tokens__cell"
              :data-mode="'dark'"
            >
              <div class="tokens__cell-viz">
                <div class="viz-shadow viz-shadow--dark">
                  <span
                    class="viz-shadow__card"
                    :style="{ boxShadow: token.value }"
                  />
                </div>
              </div>
              <div class="tokens__cell-footer">
                <span class="tokens__cell-mode">Dark</span>
                <span class="tokens__cell-legend">{{ legend(token.value) }}</span>
              </div>
            </div>
          </template>

          <!-- SINGLE cell (no light/dark: alias-of-alias, sizing, spacing) -->
          <div
            v-else
            class="tokens__cell"
          >
            <div class="tokens__cell-viz">
              <div
                v-if="vizKind(token) === 'control'"
                class="viz-control-wrap"
              >
                <div
                  class="viz-control"
                  :style="{
                    blockSize: token.value,
                    background: 'var(--l-color-bg-fill-brand)',
                    color: 'var(--l-color-text-on-fill-brand)',
                  }"
                >
                  {{ controlLabel(token) }}
                </div>
              </div>
              <div
                v-else-if="vizKind(token) === 'gap'"
                class="viz-gap"
              >
                <span class="viz-gap__box" />
                <span
                  class="viz-gap__space"
                  :style="{ inlineSize: token.value }"
                />
                <span class="viz-gap__box" />
              </div>
              <!-- An icon token: the mask painted over currentColor, as elements do. -->
              <div
                v-else-if="vizKind(token) === 'icon'"
                class="grid size-full place-items-center text-[var(--l-color-text-primary)]"
              >
                <span
                  class="block size-8 bg-current"
                  :style="{ mask: `var(${token.name}) center / contain no-repeat` }"
                />
              </div>
              <!-- Any other token: its resolved value as a flat swatch. -->
              <div
                v-else
                class="viz-swatch"
                :style="{ background: token.value }"
              />
            </div>
            <div class="tokens__cell-footer">
              <span class="tokens__cell-legend">{{
                vizKind(token) === 'icon' ? 'Mask image' : legend(token.value)
              }}</span>
              <span
                v-if="pxEquiv(token.value)"
                class="tokens__cell-px"
                >{{ pxEquiv(token.value) }}</span
              >
            </div>
          </div>
        </div>
        <!-- /tokens__cells -->
      </div>

      <FillTokenMatrix
        v-if="group.key === 'fill'"
        :tokens="group.tokens.filter((t) => vizKind(t) === 'fill-matrix')"
      />
    </section>
  </div>
</template>

<style scoped>
.tokens {
  margin-block: 1.5rem;
  /* Rows stack on their own width, not the viewport's: the same block sits in
     the full-width tokens page and in narrower guide columns (with an aside). */
  container-type: inline-size;
}

/* ────────────────────── Token row (2 columns: info | values) ────────────────────── */
.tokens__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: 1.5rem;
  align-items: center;
  padding-block: 1.25rem;
  border-block-end: 1px solid var(--vp-c-divider);
}

/* Cells container — fixed width, cells flex equally inside it. */
.tokens__cells {
  display: flex;
  inline-size: 26rem;
  gap: 0.75rem;
}

/* ────────────────────── Info column ────────────────────── */
.tokens__info {
  min-inline-size: 0;
}
.tokens__name {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: start;
}
.tokens__name code {
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}
.tokens__name:hover code {
  color: var(--vp-c-brand-1);
}
.tokens__copied {
  font-size: 0.75rem;
  color: var(--vp-c-brand-1);
}
.tokens__desc {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

/* ────────────────────── Cell (framed swatch + footer) ────────────────────── */
.tokens__cell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-inline-size: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.375rem;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.tokens__cell-viz {
  display: flex;
  block-size: 3rem;
  inline-size: 100%;
  overflow: hidden;
}
.tokens__cell-viz > * {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
}

/* Form and component tokens render a live control — a stacked field (label +
   input) needs more room than a swatch. Focus rows need room for an
   exaggerated ring; the menu panel, for two rows at their highlighted size. */
.tokens__group[data-category='form'] .tokens__cell-viz,
.tokens__group[data-category='focus'] .tokens__cell-viz,
.tokens__group[data-category='button'] .tokens__cell-viz,
.tokens__group[data-category='tooltip'] .tokens__cell-viz {
  block-size: 5rem;
}
.tokens__group[data-category='popover'] .tokens__cell-viz {
  block-size: 8.5rem;
}
/* Icon tokens: the elements that draw them, up to two stacked. */
.tokens__group[data-category='icon'] .tokens__cell-viz {
  block-size: 7.5rem;
}

/* Footer with mode tag + legend (or just legend for single-value cells) */
.tokens__cell-footer {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  padding: 0.375rem 0.625rem;
  border-block-start: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-block-size: 1.875rem;
}
.tokens__cell-mode {
  flex-shrink: 0;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-3);
  opacity: 0.75;
}
.tokens__cell-legend {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-inline-size: 0;
  flex: 1;
}

/* "Touches" cell: tag in the same violet as the highlight, caption in
   regular text (it names a part of the control, not a value). */
.tokens__cell-mode--touch {
  color: light-dark(oklch(55% 0.22 295), oklch(72% 0.17 295));
  opacity: 1;
}
.tokens__cell-legend--touch {
  font-family: inherit;
  color: var(--vp-c-text-1);
}

/* Color swatches of the Default cell: light value, then dark. */
.tokens__cell-dots {
  display: inline-flex;
  flex-shrink: 0;
  align-self: center;
  gap: 0.1875rem;
}
.tokens__cell-dots > i {
  inline-size: 0.625rem;
  block-size: 0.625rem;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--vp-c-text-1) 35%, transparent);
}

/* Color rows carry two values and a caption in their footers — wider cells. */
.tokens__row[data-viz='color'] .tokens__cells {
  inline-size: 32rem;
}

/* Pixel equivalent for length tokens (sizing/spacing) — a fixed chip on the
   right, so the rem/calc legend keeps the flexible space. */
.tokens__cell-px {
  flex-shrink: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* ────────────────────── viz primitives ────────────────────── */
.viz-swatch {
  block-size: 100%;
}

/* Elevated card on a plain surface so the box-shadow reads. The token value
   embeds light-dark(), so the cast deepens automatically in dark mode. */
.viz-shadow {
  block-size: 100%;
  background: var(--vp-c-bg);
}
.viz-shadow__card {
  inline-size: 60%;
  block-size: 1.5rem;
  border-radius: 0.375rem;
  background: var(--l-color-surface-overlay);
}
/* Forced color-scheme per cell so the token's light-dark() shadow resolves to
   each cast — independent of the page theme. Fixed primitive backdrops/cards
   keep both cells legible regardless of the active site theme. */
.viz-shadow--light {
  color-scheme: light;
  background: var(--l-color-gray-50);
}
.viz-shadow--light .viz-shadow__card {
  background: var(--l-color-white);
}
.viz-shadow--dark {
  color-scheme: dark;
  background: var(--l-color-gray-900);
}
.viz-shadow--dark .viz-shadow__card {
  background: var(--l-color-gray-800);
}

.viz-focus {
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viz-control-wrap {
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viz-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: 5.5rem;
  border-radius: 0.25rem;
  font-size: 0.72rem;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.02em;
}

.viz-gap {
  display: flex;
  align-items: center;
  inline-size: 100%;
  padding-inline: 0.75rem;
}
.viz-gap__box {
  inline-size: 0.5rem;
  block-size: 1.5rem;
  background: var(--vp-c-brand-1);
  border-radius: 0.125rem;
  flex-shrink: 0;
}
.viz-gap__space {
  block-size: 0.5rem;
  min-inline-size: 0;
  max-inline-size: calc(100% - 1.5rem);
  border-block: 1px dashed var(--vp-c-brand-soft, var(--vp-c-brand-1));
  flex-shrink: 1;
}

/* Side by side needs room for the description (~20rem) next to the 26rem of
   cells; below that, the cells go full width under the description. */
@container (max-width: 48rem) {
  .tokens__row {
    /* minmax(0, …): a bare 1fr can't shrink below its min-content, so a long
       nowrap legend (the shadow values) would stretch the page sideways. */
    grid-template-columns: minmax(0, 1fr);
    row-gap: 0.875rem;
  }
  .tokens__cells,
  .tokens__row[data-viz='color'] .tokens__cells {
    inline-size: 100%;
  }
}
</style>
