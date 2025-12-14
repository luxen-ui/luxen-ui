<script setup>
const TYPE_META = {
  native: { glyph: '⏣', label: 'Native HTML' },
  progressive: { glyph: '⬡', label: 'Progressive' },
  custom: { glyph: '◇', label: 'Custom' },
  shadow: { glyph: '⬢', label: 'Shadow DOM' },
};

const elements = [
  { name: 'Avatar', tag: 'l-avatar', type: 'shadow', link: '/elements/avatar' },
  { name: 'Badge', tag: 'l-badge', type: 'custom', link: '/elements/badge' },
  { name: 'Button', tag: 'button', type: 'native', link: '/elements/button' },
  { name: 'Carousel', tag: 'l-carousel', type: 'shadow', link: '/elements/carousel' },
  { name: 'Close Button', tag: 'button', type: 'native', link: '/elements/close-button' },
  { name: 'Dialog', tag: 'l-dialog', type: 'shadow', link: '/elements/dialog' },
  { name: 'Disclosure', tag: 'details', type: 'native', link: '/elements/disclosure' },
  { name: 'Divider', tag: 'l-divider', type: 'custom', link: '/elements/divider' },
  { name: 'Drawer', tag: 'l-drawer', type: 'shadow', link: '/elements/drawer' },
  { name: 'Dropdown', tag: 'l-dropdown', type: 'shadow', link: '/elements/dropdown' },
  { name: 'Icon', tag: 'l-icon', type: 'shadow', link: '/elements/icon' },
  { name: 'Input OTP', tag: 'l-input-otp', type: 'progressive', link: '/elements/input-otp' },
  {
    name: 'Input Stepper',
    tag: 'l-input-stepper',
    type: 'progressive',
    link: '/elements/input-stepper',
  },
  { name: 'Kbd', tag: 'kbd', type: 'native', link: '/elements/kbd' },
  { name: 'Popover', tag: 'l-popover', type: 'shadow', link: '/elements/popover' },
  { name: 'Progress', tag: 'progress', type: 'native', link: '/elements/progress' },
  { name: 'Rating', tag: 'l-rating', type: 'shadow', link: '/elements/rating' },
  { name: 'Select', tag: 'select', type: 'native', link: '/elements/select' },
  { name: 'Skeleton', tag: 'l-skeleton', type: 'custom', link: '/elements/skeleton' },
  { name: 'Spinner', tag: 'l-spinner', type: 'shadow', link: '/elements/spinner' },
  { name: 'Tabs', tag: 'l-tabs', type: 'progressive', link: '/elements/tabs' },
  { name: 'Toast', tag: 'l-toast', type: 'custom', link: '/elements/toast' },
  { name: 'Tooltip', tag: 'l-tooltip', type: 'shadow', link: '/elements/tooltip' },
  { name: 'Tree', tag: 'l-tree', type: 'shadow', link: '/elements/tree' },
];
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
  --accent: var(--vp-c-brand-1);
  --accent-2: var(--vp-c-brand-3);
}
.element-type-card[data-type='custom'] {
  --accent: #0d9488;
  --accent-2: #2dd4bf;
}
.element-type-card[data-type='shadow'] {
  --accent: #d97706;
  --accent-2: #fbbf24;
}
:global(.dark) .element-type-card[data-type='native'] {
  --accent: #34d399;
  --accent-2: #6ee7b7;
}
:global(.dark) .element-type-card[data-type='custom'] {
  --accent: #5eead4;
  --accent-2: #99f6e4;
}
:global(.dark) .element-type-card[data-type='shadow'] {
  --accent: #fbbf24;
  --accent-2: #fcd34d;
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
