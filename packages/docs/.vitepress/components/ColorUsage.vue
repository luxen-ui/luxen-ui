<script setup>
const palettes = [
  { name: 'neutral', base: 'oklch(45% 0.03 260)' },
  { name: 'info', base: 'oklch(55% 0.245 263)' },
  { name: 'success', base: 'oklch(63% 0.20 150)' },
  { name: 'warning', base: 'oklch(68% 0.16 76)' },
  { name: 'danger', base: 'oklch(58% 0.245 27)' },
];

function derived(base, mode, role) {
  const formulas = {
    light: {
      soft: (b) => `oklch(from ${b} 97% calc(c * 0.08) h)`,
      subtle: (b) => `oklch(from ${b} 93% calc(c * 0.18) h)`,
      strong: (b) => `oklch(from ${b} 55% c h)`,
      text: (b) => `oklch(from ${b} 42% calc(c * 0.85) h)`,
      border: (b) => `oklch(from ${b} 42% calc(c * 0.85) h / 30%)`,
    },
    dark: {
      soft: (b) => `oklch(from ${b} 20% calc(c * 0.15) h)`,
      subtle: (b) => `oklch(from ${b} 25% calc(c * 0.35) h)`,
      strong: (b) => `oklch(from ${b} 62% calc(c * 0.85) h)`,
      text: (b) => `oklch(from ${b} 80% calc(c * 0.55) h)`,
      border: (b) => `oklch(from ${b} 80% calc(c * 0.55) h / 30%)`,
    },
  };
  return formulas[mode][role](base);
}
</script>

<template>
  <div class="color-usage">
    <!-- Outlined badges (default) -->
    <h4>Outlined (default)</h4>
    <div class="color-usage__row">
      <span
        v-for="p in palettes"
        :key="p.name + '-outlined'"
        class="color-usage__badge"
        :style="{
          color: derived(p.base, 'light', 'text'),
          borderColor: derived(p.base, 'light', 'border'),
        }"
        >{{ p.name }}</span
      >
    </div>
    <div class="color-usage__row color-usage__row--dark">
      <span
        v-for="p in palettes"
        :key="p.name + '-outlined-dark'"
        class="color-usage__badge"
        :style="{
          color: derived(p.base, 'dark', 'text'),
          borderColor: derived(p.base, 'dark', 'border'),
        }"
        >{{ p.name }}</span
      >
    </div>

    <!-- Filled badges -->
    <h4>Filled</h4>
    <div class="color-usage__row">
      <span
        v-for="p in palettes"
        :key="p.name + '-filled'"
        class="color-usage__badge"
        :style="{
          color: derived(p.base, 'light', 'text'),
          backgroundColor: derived(p.base, 'light', 'subtle'),
          borderColor: 'transparent',
        }"
        >{{ p.name }}</span
      >
    </div>
    <div class="color-usage__row color-usage__row--dark">
      <span
        v-for="p in palettes"
        :key="p.name + '-filled-dark'"
        class="color-usage__badge"
        :style="{
          color: derived(p.base, 'dark', 'text'),
          backgroundColor: derived(p.base, 'dark', 'subtle'),
          borderColor: 'transparent',
        }"
        >{{ p.name }}</span
      >
    </div>

    <!-- Accent badges -->
    <h4>Accent</h4>
    <div class="color-usage__row">
      <span
        v-for="p in palettes"
        :key="p.name + '-accent'"
        class="color-usage__badge"
        :style="{
          color: 'white',
          backgroundColor: derived(p.base, 'light', 'strong'),
          borderColor: 'transparent',
        }"
        >{{ p.name }}</span
      >
    </div>
    <div class="color-usage__row color-usage__row--dark">
      <span
        v-for="p in palettes"
        :key="p.name + '-accent-dark'"
        class="color-usage__badge"
        :style="{
          color: 'white',
          backgroundColor: derived(p.base, 'dark', 'strong'),
          borderColor: 'transparent',
        }"
        >{{ p.name }}</span
      >
    </div>

    <!-- Soft background usage -->
    <h4>Soft backgrounds</h4>
    <div class="color-usage__row">
      <div
        v-for="p in palettes"
        :key="p.name + '-soft'"
        class="color-usage__alert"
        :style="{
          color: derived(p.base, 'light', 'text'),
          backgroundColor: derived(p.base, 'light', 'soft'),
          borderColor: derived(p.base, 'light', 'border'),
        }"
      >
        <strong>{{ p.name }}</strong> — Alert message
      </div>
    </div>
    <div class="color-usage__row color-usage__row--dark">
      <div
        v-for="p in palettes"
        :key="p.name + '-soft-dark'"
        class="color-usage__alert"
        :style="{
          color: derived(p.base, 'dark', 'text'),
          backgroundColor: derived(p.base, 'dark', 'soft'),
          borderColor: derived(p.base, 'dark', 'border'),
        }"
      >
        <strong>{{ p.name }}</strong> — Alert message
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-usage h4 {
  margin-block: 1.25rem 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.color-usage h4:first-child {
  margin-block-start: 0;
}

.color-usage__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  margin-block-end: 0.25rem;
}

.color-usage__row--dark {
  background-color: #1a1a1e;
}

.color-usage__badge {
  display: inline-flex;
  align-items: center;
  padding-inline: 0.375rem;
  min-height: 1.375rem;
  border: 1px solid;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  font-family: var(--vp-font-family-base);
}

.color-usage__alert {
  flex: 1;
  min-width: 120px;
  padding: 0.625rem 0.75rem;
  border: 1px solid;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.4;
}
</style>
