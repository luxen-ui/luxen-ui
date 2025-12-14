<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  rules: {
    type: Array,
    default: () => [],
  },
});

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = [];
  const regex = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    if (match[1] !== undefined) {
      parts.push(`<code>${escapeHtml(match[1])}</code>`);
    } else {
      parts.push(
        `<a href="${match[3]}" target="_blank" rel="noopener">${escapeHtml(match[2])}</a>`,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }
  return parts.join('');
};

const parseCriteriaGroups = (wcag) => {
  if (!wcag) return [];
  const groups = new Map();
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(wcag)) !== null) {
    const label = match[1];
    const href = match[2];
    const spaceIdx = label.lastIndexOf(' ');
    const source = spaceIdx > 0 ? label.slice(0, spaceIdx) : '';
    const criterion = spaceIdx > 0 ? label.slice(spaceIdx + 1) : label;
    if (!groups.has(source)) groups.set(source, []);
    groups.get(source).push({ criterion, href });
  }
  return [...groups.entries()].map(([source, links]) => ({ source, links }));
};
</script>

<template>
  <dl class="vp-raw a11y-list">
    <div
      v-for="(row, i) in data"
      :key="i"
      class="a11y-list-item"
    >
      <dt>
        <span
          class="a11y-check-icon"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M13.5 4.5L6.5 11.5L2.5 7.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="a11y-check-name">{{ row.Check }}</span>
      </dt>
      <dd>
        <p
          class="a11y-description"
          v-html="parseInlineMarkdown(row.Description)"
        />
        <div
          v-for="group in parseCriteriaGroups(row.WCAG)"
          :key="group.source"
          class="a11y-criteria-row"
        >
          <span class="a11y-criteria-source">{{ group.source }}</span>
          <span class="a11y-criteria-links">
            <a
              v-for="link in group.links"
              :key="link.criterion"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="a11y-criterion"
              >{{ link.criterion }}</a
            >
          </span>
        </div>
      </dd>
    </div>
  </dl>
</template>

<style>
.a11y-list {
  margin: 16px 0;
}

.a11y-list-item {
  padding: 12px 0;
}

.a11y-list-item + .a11y-list-item {
  border-top: 1px solid var(--vp-c-divider);
}

.a11y-list dt {
  display: flex;
  align-items: center;
  gap: 8px;
}

.a11y-check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--vp-c-green-soft);
  color: var(--vp-c-green-2);
}

.a11y-check-name {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1;
  color: var(--vp-c-text-1);
}

.a11y-list dd {
  margin: 6px 0 0 30px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.a11y-list dd code {
  font-weight: 500;
  font-size: 0.8125rem;
  padding: 2px 6px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 4px;
}

.a11y-list dd a:not(.a11y-criterion) {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.a11y-description {
  margin: 0;
}

.a11y-criteria-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 6px;
}

.a11y-criteria-row + .a11y-criteria-row {
  margin-top: 4px;
}

.a11y-criteria-source {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  min-width: 36px;
}

.a11y-criteria-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vp-raw .a11y-criterion {
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-brand-soft);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-skip-ink: none;
  transition: text-decoration-color 0.2s;
}

.vp-raw .a11y-criterion:hover {
  text-decoration-color: var(--vp-c-brand-1);
}
</style>
