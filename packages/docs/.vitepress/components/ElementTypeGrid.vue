<script setup>
import metadata from 'luxen-ui/metadata' with { type: 'json' };

const TYPE_META = {
  native: { glyph: '⏣', label: 'Native' },
  progressive: { glyph: '⬡', label: 'Progressive' },
  custom: { glyph: '◇', label: 'Plain' },
  shadow: { glyph: '⬢', label: 'Shadow-DOM' },
};

// Derive the set of slugs that have a docs page under packages/docs/elements/
const docPages = import.meta.glob('../../elements/*.md');
const docSlugs = new Set(
  Object.keys(docPages).map((p) => p.replace('../../elements/', '').replace('.md', '')),
);

const elements = metadata.elements
  .filter((el) => docSlugs.has(el.name))
  .map((el) => ({
    name: el.displayName,
    tag: el.tag ?? el.nativeTag ?? '',
    type: el.type,
    link: `/elements/${el.name}`,
  }));
</script>

<template>
  <div class="element-type-grid">
    <a
      v-for="el in elements"
      :key="el.tag + el.name"
      :href="el.link"
      class="element-type-card"
      :data-type="el.type"
    >
      <span class="glyph">{{ TYPE_META[el.type].glyph }}</span>
      <span class="body">
        <span class="name">{{ el.name }}</span>
        <code class="tag">&lt;{{ el.tag }}&gt;</code>
      </span>
      <span class="type-label">{{ TYPE_META[el.type].label }}</span>
    </a>
  </div>
</template>

<style scoped>
.element-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
  margin: 22px 0 30px;
}

.element-type-card {
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);

  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 16px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--vp-c-divider));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 6%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 70%
  );
  color: var(--vp-c-text-1);
  text-decoration: none !important;
  transition:
    transform 0.15s,
    border-color 0.15s,
    background 0.15s;
  overflow: hidden;
  font-weight: normal;
}

.element-type-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  opacity: 0.85;
}

.element-type-card:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--vp-c-divider));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 12%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 80%
  );
  transform: translateY(-1px);
}

.element-type-card[data-type='native'] {
  --accent: #0e9f6e;
  --accent-2: #34d399;
}
.element-type-card[data-type='progressive'] {
  --accent: #2563eb;
  --accent-2: #60a5fa;
}
.element-type-card[data-type='custom'] {
  --accent: #9333ea;
  --accent-2: #c084fc;
}
.element-type-card[data-type='shadow'] {
  --accent: #dc2626;
  --accent-2: #f87171;
}
:global(.dark) .element-type-card[data-type='native'] {
  --accent: #34d399;
  --accent-2: #6ee7b7;
}
:global(.dark) .element-type-card[data-type='progressive'] {
  --accent: #60a5fa;
  --accent-2: #93c5fd;
}
:global(.dark) .element-type-card[data-type='custom'] {
  --accent: #c084fc;
  --accent-2: #d8b4fe;
}
:global(.dark) .element-type-card[data-type='shadow'] {
  --accent: #f87171;
  --accent-2: #fca5a5;
}

.glyph {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--accent);
  opacity: 0.9;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.tag {
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.type-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  white-space: nowrap;
}
</style>
