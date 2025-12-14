<script setup>
const props = defineProps({
  name: String,
  base: String,
});

// 11-step scale derived from a single base color (at peak chroma, ~step 600).
// Lightness and chroma multipliers calibrated from Tailwind v4 oklch curves.
const steps = [
  { step: 50, l: '97%', c: 'calc(c * 0.06)' },
  { step: 100, l: '93%', c: 'calc(c * 0.13)' },
  { step: 200, l: '88%', c: 'calc(c * 0.24)' },
  { step: 300, l: '81%', c: 'calc(c * 0.43)' },
  { step: 400, l: '71%', c: 'calc(c * 0.67)' },
  { step: 500, l: '62%', c: 'calc(c * 0.87)' },
  { step: 600, l: '55%', c: 'c' },
  { step: 700, l: '49%', c: 'calc(c * 0.99)' },
  { step: 800, l: '42%', c: 'calc(c * 0.81)' },
  { step: 900, l: '38%', c: 'calc(c * 0.60)' },
  { step: 950, l: '28%', c: 'calc(c * 0.37)' },
];

function color(s) {
  return `oklch(from ${props.base} ${s.l} ${s.c} h)`;
}

function textColor(s) {
  const l = parseInt(s.l);
  return l > 55 ? 'oklch(25% 0 0)' : 'white';
}
</script>

<template>
  <div class="palette">
    <div class="palette__header">
      <span class="palette__name">{{ name }}</span>
      <code class="palette__base">{{ base }}</code>
    </div>
    <div class="palette__strip">
      <div
        v-for="s in steps"
        :key="s.step"
        class="palette__cell"
        :style="{ backgroundColor: color(s), color: textColor(s) }"
      >
        <span class="palette__step">{{ s.step }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.palette {
  margin-block-end: 1.5rem;
}

.palette__header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-block-end: 0.375rem;
}

.palette__name {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--vp-c-text-1);
}

.palette__base {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.palette__strip {
  display: flex;
  border-radius: 0.5rem;
  overflow: hidden;
}

.palette__cell {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
}

.palette__step {
  font-size: 0.7rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
