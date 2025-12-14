<script setup>
const props = defineProps({
  name: String,
  base: String,
});

const roles = [
  {
    name: 'soft',
    label: 'Soft',
    desc: 'Toast, alert containers',
    light: { l: '97%', c: 'calc(c * 0.08)' },
    dark: { l: '20%', c: 'calc(c * 0.15)' },
  },
  {
    name: 'subtle',
    label: 'Subtle',
    desc: 'Badges, tags, selected states',
    light: { l: '93%', c: 'calc(c * 0.18)' },
    dark: { l: '25%', c: 'calc(c * 0.35)' },
  },
  {
    name: 'strong',
    label: 'Strong',
    desc: 'Solid badges, high-emphasis',
    light: { l: '55%', c: 'c' },
    dark: { l: '62%', c: 'calc(c * 0.85)' },
  },
  {
    name: 'text',
    label: 'Text',
    desc: 'Semantic text, labels',
    light: { l: '42%', c: 'calc(c * 0.85)' },
    dark: { l: '80%', c: 'calc(c * 0.55)' },
  },
  {
    name: 'border',
    label: 'Border',
    desc: 'Badge borders, outlines',
    light: { l: '42%', c: 'calc(c * 0.85)', alpha: '30%' },
    dark: { l: '80%', c: 'calc(c * 0.55)', alpha: '30%' },
  },
];

function lightColor(role) {
  const alpha = role.light.alpha ? ` / ${role.light.alpha}` : '';
  return `oklch(from ${props.base} ${role.light.l} ${role.light.c} h${alpha})`;
}

function darkColor(role) {
  const alpha = role.dark.alpha ? ` / ${role.dark.alpha}` : '';
  return `oklch(from ${props.base} ${role.dark.l} ${role.dark.c} h${alpha})`;
}

function formula(role, mode) {
  const r = role[mode];
  const alpha = r.alpha ? ` / ${r.alpha}` : '';
  return `oklch(… ${r.l} ${r.c} h${alpha})`;
}
</script>

<template>
  <div class="color-scale">
    <div class="color-scale__header">
      <h4 class="color-scale__name">{{ name }}</h4>
      <code class="color-scale__base">{{ base }}</code>
    </div>

    <div class="color-scale__grid">
      <!-- Base swatch -->
      <div class="color-scale__item">
        <div
          class="color-scale__swatch color-scale__swatch--base"
          :style="{ backgroundColor: base }"
        >
          <span
            class="color-scale__contrast-sample"
            style="color: white"
            >Aa</span
          >
          <span
            class="color-scale__contrast-sample"
            style="color: black"
            >Aa</span
          >
        </div>
        <div class="color-scale__label">Base</div>
        <div class="color-scale__desc">Source color</div>
      </div>

      <!-- Derived swatches -->
      <div
        v-for="role in roles"
        :key="role.name"
        class="color-scale__item"
      >
        <div class="color-scale__swatch-pair">
          <div
            class="color-scale__swatch color-scale__swatch--half"
            :style="{ backgroundColor: lightColor(role) }"
            title="Light mode"
          >
            <span
              v-if="role.name === 'text'"
              class="color-scale__text-sample"
              :style="{ color: lightColor(role), backgroundColor: 'white' }"
              >Aa</span
            >
            <span
              v-else-if="role.name === 'strong'"
              class="color-scale__contrast-sample"
              style="color: white"
              >Aa</span
            >
          </div>
          <div
            class="color-scale__swatch color-scale__swatch--half"
            :style="{ backgroundColor: darkColor(role) }"
            title="Dark mode"
          >
            <span
              v-if="role.name === 'text'"
              class="color-scale__text-sample"
              :style="{ color: darkColor(role), backgroundColor: '#1a1a1e' }"
              >Aa</span
            >
            <span
              v-else-if="role.name === 'strong'"
              class="color-scale__contrast-sample"
              style="color: white"
              >Aa</span
            >
          </div>
        </div>
        <div class="color-scale__label">{{ role.label }}</div>
        <div class="color-scale__desc">{{ role.desc }}</div>
        <code class="color-scale__formula">{{ formula(role, 'light') }}</code>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-scale {
  margin-block: 1.5rem;
}

.color-scale__header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-block-end: 0.75rem;
}

.color-scale__name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.color-scale__base {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.color-scale__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .color-scale__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.color-scale__item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-scale__swatch {
  height: 4rem;
  border-radius: 0.5rem;
  border: 1px solid oklch(0% 0 0 / 8%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.color-scale__swatch--base {
  height: 4rem;
}

.color-scale__swatch-pair {
  display: flex;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid oklch(0% 0 0 / 8%);
}

.color-scale__swatch--half {
  flex: 1;
  height: 4rem;
  border: none;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-scale__contrast-sample {
  font-size: 0.875rem;
  font-weight: 600;
}

.color-scale__text-sample {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.color-scale__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.color-scale__desc {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}

.color-scale__formula {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  word-break: break-all;
}
</style>
