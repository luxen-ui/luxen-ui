<script setup>
const flavors = [
  {
    key: 'native',
    glyph: '⏣',
    label: 'Native element',
    desc: 'A standard HTML element styled purely with CSS — no JavaScript at all.',
    tag: '<button class="l-button">',
  },
  {
    key: 'progressive',
    glyph: '⬡',
    label: 'Progressive Custom Element',
    desc: 'Wraps and enhances the HTML composed inside it; all its HTML and CSS live in the light DOM.',
    tag: '<l-input-stepper>',
  },
  {
    key: 'custom',
    glyph: '◇',
    label: 'Plain Custom Element',
    desc: 'A brand-new tag with no native equivalent — CSS lives in the light DOM, no Shadow-DOM.',
    tag: '<l-badge>',
  },
  {
    key: 'shadow',
    glyph: '⬢',
    label: 'Shadow-DOM Custom Element',
    desc: 'Encapsulated rendering — best suited to UI patterns where server-side rendering is not required.',
    tag: '<l-tooltip>',
  },
];
</script>

<template>
  <div class="flavors vp-raw">
    <article
      v-for="f in flavors"
      :key="f.key"
      class="flavor"
      :data-type="f.key"
    >
      <header>
        <span
          class="glyph"
          aria-hidden="true"
          >{{ f.glyph }}</span
        >
        <h4>{{ f.label }}</h4>
      </header>
      <p>{{ f.desc }}</p>
      <code>{{ f.tag }}</code>
    </article>
  </div>
</template>

<style scoped>
.flavors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin: 24px 0 16px;
}

.flavor {
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 16px 14px 18px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider));
  background: linear-gradient(
    150deg,
    color-mix(in srgb, var(--accent) 7%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 72%
  );
  overflow: hidden;
}
.flavor::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  opacity: 0.9;
}

.flavor[data-type='native'] {
  --accent: #0e9f6e;
  --accent-2: #34d399;
}
.flavor[data-type='progressive'] {
  --accent: #2563eb;
  --accent-2: #60a5fa;
}
.flavor[data-type='custom'] {
  --accent: #9333ea;
  --accent-2: #c084fc;
}
.flavor[data-type='shadow'] {
  --accent: #dc2626;
  --accent-2: #f87171;
}
:global(.dark) .flavor[data-type='native'] {
  --accent: #34d399;
  --accent-2: #6ee7b7;
}
:global(.dark) .flavor[data-type='progressive'] {
  --accent: #60a5fa;
  --accent-2: #93c5fd;
}
:global(.dark) .flavor[data-type='custom'] {
  --accent: #c084fc;
  --accent-2: #d8b4fe;
}
:global(.dark) .flavor[data-type='shadow'] {
  --accent: #f87171;
  --accent-2: #fca5a5;
}

.flavor header {
  display: flex;
  align-items: center;
  gap: 9px;
}
.glyph {
  font-size: 1.15rem;
  line-height: 1;
  color: var(--accent);
}
.flavor h4 {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.flavor p {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  flex: 1;
}

.flavor code {
  align-self: flex-start;
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 6px;
  color: color-mix(in srgb, var(--accent) 80%, var(--vp-c-text-1));
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
