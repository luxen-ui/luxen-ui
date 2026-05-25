<script setup>
const lanes = [
  {
    step: 'e',
    title: 'elementPrefix',
    badge: 'tag-shaped identifiers',
    body: 'Anything that matches a Luxen custom-element tag name.',
    items: [
      { label: 'Custom element tag names', example: '<pulse-toast>' },
      { label: 'Element type selectors', example: 'pulse-toast { … }' },
    ],
  },
  {
    step: 'c',
    title: 'cssPrefix',
    badge: 'CSS-shaped identifiers',
    body: 'Class names, custom properties, keyframes, and runtime identifiers built by JS.',
    items: [
      { label: 'CSS classes', example: '.p-button' },
      { label: 'Custom properties', example: '--p-color-text-primary' },
      { label: 'Keyframe names', example: '@keyframes p-toast-…' },
      { label: 'Generated IDs', example: 'p:toast:1' },
      { label: 'Classes added by JS', example: 'p-toast-icon' },
    ],
  },
];
</script>

<template>
  <div class="prefix-pipelines">
    <div
      v-for="(lane, i) in lanes"
      :key="i"
      class="lane"
      :data-lane="i === 0 ? 'build' : 'runtime'"
    >
      <header>
        <span class="step">{{ lane.step }}</span>
        <div class="head-text">
          <span class="title">{{ lane.title }}</span>
          <span class="badge">{{ lane.badge }}</span>
        </div>
      </header>
      <p class="lane-body">{{ lane.body }}</p>
      <ul>
        <li
          v-for="item in lane.items"
          :key="item.label"
        >
          <span class="dot" />
          <span class="label">{{ item.label }}</span>
          <code>{{ item.example }}</code>
        </li>
      </ul>
    </div>

    <div class="note">
      Both prefixes are rewritten at build time by the Vite plugin — no runtime call needed.
    </div>
  </div>
</template>

<style scoped>
.prefix-pipelines {
  --build-accent: #0d9488;
  --build-accent-2: #2dd4bf;
  --runtime-accent: var(--vp-c-brand-1);
  --runtime-accent-2: var(--vp-c-brand-3);

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 24px 0 28px;
}
:global(.dark) .prefix-pipelines {
  --build-accent: #5eead4;
  --build-accent-2: #99f6e4;
}

.lane {
  --accent: var(--build-accent);
  --accent-2: var(--build-accent-2);

  position: relative;
  padding: 18px 18px 16px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 6%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 100%
  );
  overflow: hidden;
}
.lane[data-lane='runtime'] {
  --accent: var(--runtime-accent);
  --accent-2: var(--runtime-accent-2);
}
.lane::before {
  content: '';
  position: absolute;
  inset: -40% -20% auto auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--accent-2) 22%, transparent) 0%,
    transparent 60%
  );
  filter: blur(20px);
  pointer-events: none;
}

.lane header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.step {
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}
.head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
.badge {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--accent);
  text-transform: uppercase;
}

.lane-body {
  position: relative;
  margin: 0 0 12px;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.lane ul {
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}
.lane li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 5%, var(--vp-c-bg-soft));
  border: 1px solid color-mix(in srgb, var(--accent) 12%, var(--vp-c-divider));
}
.lane .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
.lane .label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.lane code {
  font-size: 0.74rem;
  padding: 2px 7px;
  background: color-mix(in srgb, var(--accent) 10%, transparent) !important;
  color: var(--accent) !important;
  border-radius: 5px;
  border: none !important;
}

.note {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  padding: 6px 12px;
  background: color-mix(in srgb, var(--vp-c-text-1) 4%, var(--vp-c-bg-soft));
  border: 1px dashed var(--vp-c-divider);
  border-radius: 999px;
}

@media (max-width: 720px) {
  .prefix-pipelines {
    grid-template-columns: 1fr;
  }
}
</style>
