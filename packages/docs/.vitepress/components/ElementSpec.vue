<script setup>
import { computed } from 'vue';
import metadata from 'luxen-ui/metadata' with { type: 'json' };

const TYPE_LABEL = {
  native: 'Native HTML Element',
  progressive: 'Progressive Custom Element',
  custom: 'Custom Element (no Shadow DOM)',
  shadow: 'Custom Element · Shadow DOM',
};

// Preferred: <ElementSpec element="dialog" /> — tag + type come from metadata.
// Legacy: <ElementSpec tag="button" type="native" /> — explicit props.
const props = defineProps({
  element: { type: String, default: null },
  tag: { type: String, default: null },
  type: {
    type: String,
    default: null,
    validator: (v) => v == null || ['native', 'progressive', 'custom', 'shadow'].includes(v),
  },
});

const entry = computed(() =>
  props.element ? metadata.elements.find((e) => e.name === props.element) : null,
);
// Display tag: custom tag for custom elements (l-dialog), native host tag for
// native elements (button). Falls back to the legacy `tag` prop.
const tag = computed(() => entry.value?.tag ?? entry.value?.nativeTag ?? props.tag);
const type = computed(() => entry.value?.type ?? props.type);
</script>

<template>
  <div
    class="element-spec"
    :data-type="type"
  >
    <div class="element-spec-glow" />

    <div class="element-spec-head">
      <span class="element-spec-kicker">HTML tag</span>
      <code class="element-spec-tag">&lt;{{ tag }}&gt;</code>
    </div>

    <div class="element-spec-types">
      <div
        class="element-spec-chip"
        :class="{ 'is-on': type === 'native' }"
      >
        <span class="glyph">⏣</span>
        <span class="label">Native HTML</span>
      </div>
      <div
        class="element-spec-chip"
        :class="{ 'is-on': type === 'progressive' }"
      >
        <span class="glyph">⬡</span>
        <span class="label">Progressive</span>
      </div>
      <div
        class="element-spec-chip"
        :class="{ 'is-on': type === 'custom' }"
      >
        <span class="glyph">◇</span>
        <span class="label">Custom</span>
      </div>
      <div
        class="element-spec-chip"
        :class="{ 'is-on': type === 'shadow' }"
      >
        <span class="glyph">⬢</span>
        <span class="label">Shadow DOM</span>
      </div>
    </div>

    <div class="element-spec-badge">
      <span class="dot" />
      {{ TYPE_LABEL[type] }}
    </div>
  </div>
</template>

<style scoped>
.element-spec {
  --spec-accent: var(--vp-c-brand-1);
  --spec-accent-2: var(--vp-c-brand-3);

  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'head badge'
    'types types';
  align-items: center;
  gap: 18px 24px;
  margin: 22px 0 30px;
  padding: 22px 24px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--spec-accent) 22%, var(--vp-c-divider));
  background:
    radial-gradient(
      120% 140% at 100% 0%,
      color-mix(in srgb, var(--spec-accent-2) 14%, transparent) 0%,
      transparent 55%
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--spec-accent) 8%, var(--vp-c-bg)) 0%,
      var(--vp-c-bg) 100%
    );
  overflow: hidden;
}

.element-spec[data-type='native'] {
  --spec-accent: #0e9f6e;
  --spec-accent-2: #34d399;
}
.element-spec[data-type='progressive'] {
  --spec-accent: var(--vp-c-brand-1);
  --spec-accent-2: var(--vp-c-brand-3);
}
.element-spec[data-type='custom'] {
  --spec-accent: #0d9488;
  --spec-accent-2: #2dd4bf;
}
.element-spec[data-type='shadow'] {
  --spec-accent: #d97706;
  --spec-accent-2: #fbbf24;
}
:global(.dark) .element-spec[data-type='native'] {
  --spec-accent: #34d399;
  --spec-accent-2: #6ee7b7;
}
:global(.dark) .element-spec[data-type='custom'] {
  --spec-accent: #5eead4;
  --spec-accent-2: #99f6e4;
}
:global(.dark) .element-spec[data-type='shadow'] {
  --spec-accent: #fbbf24;
  --spec-accent-2: #fcd34d;
}

.element-spec-glow {
  position: absolute;
  pointer-events: none;
  inset: -40% -10% auto auto;
  width: 320px;
  height: 320px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--spec-accent-2) 25%, transparent) 0%,
    transparent 60%
  );
  filter: blur(20px);
  opacity: 0.9;
}

.element-spec-head {
  grid-area: head;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  z-index: 1;
}

.element-spec-kicker {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--spec-accent) 75%, var(--vp-c-text-2));
}

.element-spec-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--vp-c-text-1);
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  letter-spacing: -0.01em;
}

.element-spec-badge {
  grid-area: badge;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--spec-accent);
  background: color-mix(in srgb, var(--spec-accent) 12%, var(--vp-c-bg));
  border: 1px solid color-mix(in srgb, var(--spec-accent) 35%, transparent);
  border-radius: 999px;
  white-space: nowrap;
  z-index: 1;
  box-shadow: 0 1px 2px color-mix(in srgb, var(--spec-accent) 20%, transparent);
}

.element-spec-badge .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--spec-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--spec-accent) 22%, transparent);
}

.element-spec-types {
  grid-area: types;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px dashed color-mix(in srgb, var(--spec-accent) 20%, var(--vp-c-divider));
  z-index: 1;
}

.element-spec-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}

.element-spec-chip .glyph {
  font-size: 0.9rem;
  opacity: 0.5;
}

.element-spec-chip.is-on {
  color: var(--spec-accent);
  background: color-mix(in srgb, var(--spec-accent) 14%, transparent);
}

.element-spec-chip.is-on .glyph {
  opacity: 1;
}

@media (max-width: 640px) {
  .element-spec {
    grid-template-columns: 1fr;
    grid-template-areas:
      'head'
      'badge'
      'types';
    padding: 18px 18px 16px;
  }
  .element-spec-badge {
    justify-self: start;
  }
}
</style>
