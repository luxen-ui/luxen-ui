<script setup>
import { computed, ref } from 'vue';
import tokensJson from '@luxen-ui/design-tokens/json';

const props = defineProps({
  category: { type: String, default: null },
});

const CATEGORIES = {
  text: 'Text',
  surface: 'Surface',
  border: 'Border',
  fill: 'Fill',
  shadow: 'Shadow',
  sizing: 'Sizing',
  spacing: 'Spacing',
};

const tokens = computed(() => tokensJson.filter((t) => t.category !== 'primitive'));

const groups = computed(() => {
  const wanted = props.category ? [props.category] : Object.keys(CATEGORIES);
  return wanted
    .map((key) => ({
      key,
      label: CATEGORIES[key],
      tokens: tokens.value.filter((t) => t.category === key),
      hasModes: tokens.value.some((t) => t.category === key && t.light != null && t.dark != null),
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
  const p = t.path;
  if (t.category === 'shadow') return 'shadow';
  if (t.category === 'sizing') return 'control';
  if (t.category === 'spacing') return 'gap';
  if (t.category === 'text') return 'text';
  if (t.category === 'border') {
    if (p[0] === 'focus-ring') return 'focus-ring';
    if (p[1] === 'divider') return 'divider';
    return 'border';
  }
  if (t.category === 'surface') {
    if (p[0] === 'backdrop' || p[0] === 'backdrop-strong') return 'backdrop';
    if (p[2] === 'hover' || p[2] === 'selected') return 'state-tint';
    if (p[1] === 'bg' && p[2] === 'disabled') return 'disabled-surface';
    return 'surface';
  }
  if (t.category === 'fill') {
    if (p[3] === undefined) return 'fill-button';
    return 'fill-tag';
  }
  return 'swatch';
}

/** Lookup helper. */
function tokenByName(name) {
  return tokensJson.find((t) => t.name === name);
}

/**
 * Context-appropriate background for a text token, per mode.
 * Matches the real-world surface the token is designed to sit on:
 *   primary/secondary/tertiary  → plain page surface
 *   neutral/info/warning/danger/success → matching `bg-fill-<tone>-soft`
 *   disabled                    → `bg-disabled`
 *   on-fill-brand               → `bg-fill-brand`
 */
function textBg(token, mode) {
  const sub = token.path[2];
  if (sub === 'on-fill-brand') return tokenByName('--l-color-bg-fill-brand')?.[mode] ?? '';
  if (sub === 'disabled') return tokenByName('--l-color-bg-disabled')?.[mode] ?? '';
  if (['neutral', 'info', 'warning', 'danger', 'success'].includes(sub)) {
    return tokenByName(`--l-color-bg-fill-${sub}-soft`)?.[mode] ?? '';
  }
  return mode === 'light' ? 'var(--l-color-white)' : 'var(--l-color-gray-900)';
}

/** Short label for sizing tokens (xs/sm/md/lg/xl). */
function controlLabel(t) {
  return t.path[2];
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
        v-for="token in group.tokens"
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
          <!-- Light + dark side by side when modes exist -->
          <template v-if="group.hasModes && hasModes(token)">
            <div
              class="tokens__cell"
              :data-mode="'light'"
            >
              <div class="tokens__cell-viz">
                <div
                  v-if="vizKind(token) === 'text'"
                  class="viz-text"
                  :style="{ background: textBg(token, 'light'), color: token.light }"
                >
                  Aa
                </div>
                <div
                  v-else-if="vizKind(token) === 'surface'"
                  class="viz-surface"
                  :style="{ background: token.light }"
                />
                <div
                  v-else-if="vizKind(token) === 'disabled-surface'"
                  class="viz-disabled"
                  :style="{ background: token.light, color: 'var(--l-color-text-disabled)' }"
                >
                  abc
                </div>
                <div
                  v-else-if="vizKind(token) === 'state-tint'"
                  class="viz-state"
                  :style="{ background: 'var(--l-color-surface)' }"
                >
                  <span
                    class="viz-state__overlay"
                    :style="{ background: token.light }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'backdrop'"
                  class="viz-backdrop viz-backdrop--light"
                >
                  <span
                    class="viz-backdrop__dim"
                    :style="{ background: token.light }"
                  />
                  <span class="viz-backdrop__modal viz-backdrop__modal--light" />
                </div>
                <div
                  v-else-if="vizKind(token) === 'border'"
                  class="viz-border-wrap"
                  :style="{ background: 'var(--l-color-surface)' }"
                >
                  <span
                    class="viz-border"
                    :style="{ borderColor: token.light }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'divider'"
                  class="viz-divider"
                  :style="{ background: 'var(--l-color-surface)' }"
                >
                  <span
                    class="viz-divider__line"
                    :style="{ background: token.light }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'fill-button'"
                  class="viz-fill-btn"
                  :style="{ background: token.light }"
                />
                <div
                  v-else-if="vizKind(token) === 'fill-tag'"
                  class="viz-fill-tag-wrap"
                >
                  <span
                    class="viz-fill-tag"
                    :style="{ background: token.light }"
                  />
                </div>
                <div
                  v-else
                  class="viz-swatch"
                  :style="{ background: token.light }"
                />
              </div>
              <div class="tokens__cell-footer">
                <span class="tokens__cell-mode">Light</span>
                <span class="tokens__cell-legend">{{ legend(token.light) }}</span>
              </div>
            </div>

            <!-- DARK cell -->
            <div
              class="tokens__cell"
              :data-mode="'dark'"
            >
              <div class="tokens__cell-viz">
                <div
                  v-if="vizKind(token) === 'text'"
                  class="viz-text"
                  :style="{ background: textBg(token, 'dark'), color: token.dark }"
                >
                  Aa
                </div>
                <div
                  v-else-if="vizKind(token) === 'surface'"
                  class="viz-surface"
                  :style="{ background: token.dark }"
                />
                <div
                  v-else-if="vizKind(token) === 'disabled-surface'"
                  class="viz-disabled"
                  :style="{ background: token.dark, color: 'var(--l-color-gray-500)' }"
                >
                  abc
                </div>
                <div
                  v-else-if="vizKind(token) === 'state-tint'"
                  class="viz-state"
                  :style="{ background: 'var(--l-color-gray-900)' }"
                >
                  <span
                    class="viz-state__overlay"
                    :style="{ background: token.dark }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'backdrop'"
                  class="viz-backdrop viz-backdrop--dark"
                >
                  <span
                    class="viz-backdrop__dim"
                    :style="{ background: token.dark }"
                  />
                  <span class="viz-backdrop__modal viz-backdrop__modal--dark" />
                </div>
                <div
                  v-else-if="vizKind(token) === 'border'"
                  class="viz-border-wrap"
                  :style="{ background: 'var(--l-color-gray-900)' }"
                >
                  <span
                    class="viz-border"
                    :style="{ borderColor: token.dark }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'divider'"
                  class="viz-divider"
                  :style="{ background: 'var(--l-color-gray-900)' }"
                >
                  <span
                    class="viz-divider__line"
                    :style="{ background: token.dark }"
                  />
                </div>
                <div
                  v-else-if="vizKind(token) === 'fill-button'"
                  class="viz-fill-btn"
                  :style="{ background: token.dark }"
                />
                <div
                  v-else-if="vizKind(token) === 'fill-tag'"
                  class="viz-fill-tag-wrap"
                >
                  <span
                    class="viz-fill-tag"
                    :style="{ background: token.dark }"
                  />
                </div>
                <div
                  v-else
                  class="viz-swatch"
                  :style="{ background: token.dark }"
                />
              </div>
              <div class="tokens__cell-footer">
                <span class="tokens__cell-mode">Dark</span>
                <span class="tokens__cell-legend">{{ legend(token.dark) }}</span>
              </div>
            </div>
          </template>

          <!-- SINGLE cell (no light/dark: focus-ring, alias-of-alias, sizing, spacing) -->
          <div
            v-if="!hasModes(token)"
            class="tokens__cell"
          >
            <div class="tokens__cell-viz">
              <div
                v-if="vizKind(token) === 'focus-ring'"
                class="viz-focus"
                :style="{ background: 'var(--l-color-surface)' }"
              >
                <span
                  class="viz-focus__el"
                  :style="{
                    background: 'var(--l-color-bg-fill-secondary)',
                    borderColor: 'var(--l-color-border)',
                    boxShadow: `0 0 0 3px ${token.value}`,
                  }"
                />
              </div>
              <div
                v-else-if="vizKind(token) === 'control'"
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
              <div
                v-else-if="vizKind(token) === 'shadow'"
                class="viz-shadow"
              >
                <span
                  class="viz-shadow__card"
                  :style="{ boxShadow: token.value }"
                />
              </div>
              <!-- Alias-of-alias (e.g. border-overlay → border): show the resolved color as a flat swatch -->
              <div
                v-else
                class="viz-swatch"
                :style="{ background: token.value }"
              />
            </div>
            <div class="tokens__cell-footer">
              <span class="tokens__cell-legend">{{ legend(token.value) }}</span>
            </div>
          </div>
        </div>
        <!-- /tokens__cells -->
      </div>
    </section>
  </div>
</template>

<style scoped>
.tokens {
  margin-block: 1.5rem;
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

/* ────────────────────── viz primitives ────────────────────── */
.viz-text {
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.viz-fill-btn {
  inline-size: 100%;
  block-size: 100%;
}
.viz-surface,
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

.viz-disabled {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.viz-state {
  position: relative;
}
.viz-state__overlay {
  position: absolute;
  inset: 0;
}

.viz-backdrop {
  position: relative;
}
.viz-backdrop--light {
  background:
    repeating-linear-gradient(
      0,
      transparent 0,
      transparent 4px,
      oklch(0% 0 0 / 8%) 4px,
      oklch(0% 0 0 / 8%) 5px
    ),
    var(--l-color-surface);
}
.viz-backdrop--dark {
  background:
    repeating-linear-gradient(
      0,
      transparent 0,
      transparent 4px,
      oklch(100% 0 0 / 10%) 4px,
      oklch(100% 0 0 / 10%) 5px
    ),
    var(--l-color-gray-900);
}
.viz-backdrop__dim {
  position: absolute;
  inset: 0;
}
.viz-backdrop__modal {
  position: absolute;
  inset-block: 25%;
  inset-inline: 22%;
  border-radius: 0.125rem;
  box-shadow: 0 1px 3px oklch(0% 0 0 / 25%);
}
.viz-backdrop__modal--light {
  background: var(--l-color-surface);
}
.viz-backdrop__modal--dark {
  background: var(--l-color-gray-800);
}

.viz-border-wrap {
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viz-border {
  inline-size: 60%;
  block-size: 60%;
  border-style: solid;
  border-width: 1.5px;
  border-radius: 0.25rem;
}

.viz-divider {
  position: relative;
  inline-size: 100%;
  block-size: 100%;
}
.viz-divider__line {
  position: absolute;
  inset-inline: 1rem;
  inset-block-start: 50%;
  block-size: 1px;
  transform: translateY(-50%);
}

.viz-focus {
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viz-focus__el {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  border-radius: 0.25rem;
  border: 1px solid;
}

.viz-fill-tag-wrap {
  inline-size: 100%;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.viz-fill-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.625rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
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

@media (max-width: 768px) {
  .tokens__row {
    grid-template-columns: 1fr;
    row-gap: 0.875rem;
  }
  .tokens__cells {
    inline-size: 100%;
  }
}
</style>
