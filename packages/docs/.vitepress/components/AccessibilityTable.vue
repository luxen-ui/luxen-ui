<script setup>
import { computed, useId } from 'vue';

// `data` lists what the element guarantees on its own ("Built in").
// `rules` lists what the integrator must do ("Your part"). A rule is either a
// plain string or a row shaped like `data` ({ Check, Description, Note, WCAG }).
// `Description` may be omitted when the `Check` title already says it all.
// `Note` is an optional second sentence: the why, or the edge case.
// `Code` names a slot holding a fenced code block, folded behind "Show code":
//   <template #label>
//
//   ```html
//   …
//   ```
//
//   </template>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  rules: {
    type: Array,
    default: () => [],
  },
  references: {
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

// "[WCAG 1.4.3](url), [RGAA 3.2](url), [WCAG 1.4.11](url)" →
// [{ source: 'WCAG', links: [1.4.3, 1.4.11] }, { source: 'RGAA', links: [3.2] }]
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

const normalize = (row) => (typeof row === 'string' ? { Description: row } : row);

const groups = computed(() =>
  [
    {
      key: 'yours',
      title: 'Your part',
      hint: 'Check these in your markup',
      done: false,
      rows: props.rules.map(normalize),
    },
    {
      key: 'builtin',
      title: 'Built in',
      hint: 'Handled by the element',
      done: true,
      rows: props.data.map(normalize),
    },
  ].filter((group) => group.rows.length),
);

const groupIds = { yours: useId(), builtin: useId() };
const refsLabelId = useId();
</script>

<template>
  <div class="a11y">
    <section
      v-for="group in groups"
      :key="group.key"
      class="a11y-group"
      :aria-labelledby="groupIds[group.key]"
    >
      <div class="a11y-group-head">
        <p
          :id="groupIds[group.key]"
          class="a11y-group-title"
        >
          {{ group.title }}
          <span class="a11y-group-count">{{ group.rows.length }}</span>
        </p>
        <span class="a11y-group-hint">{{ group.hint }}</span>
      </div>

      <ul class="a11y-rows">
        <li
          v-for="(row, i) in group.rows"
          :key="i"
          class="a11y-row"
          :data-owner="group.key"
        >
          <span
            class="a11y-mark"
            aria-hidden="true"
          >
            <svg
              v-if="group.done"
              width="14"
              height="14"
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

          <div class="a11y-body">
            <p
              v-if="row.Check"
              class="a11y-name"
              v-html="parseInlineMarkdown(row.Check)"
            />
            <p
              v-if="row.Description"
              class="a11y-description"
              v-html="parseInlineMarkdown(row.Description)"
            />
            <p
              v-if="row.Note"
              class="a11y-note"
              v-html="parseInlineMarkdown(row.Note)"
            />
            <details
              v-if="row.Code && $slots[row.Code]"
              class="a11y-code"
            >
              <summary>Show code</summary>
              <slot :name="row.Code" />
            </details>
          </div>

          <div
            v-if="row.WCAG"
            class="a11y-criteria"
          >
            <span
              v-for="ref in parseCriteriaGroups(row.WCAG)"
              :key="ref.source"
              class="a11y-criteria-row"
            >
              <span class="a11y-criteria-source">{{ ref.source }}</span>
              <a
                v-for="link in ref.links"
                :key="link.criterion"
                :href="link.href"
                target="_blank"
                rel="noopener"
                class="a11y-criterion"
                :aria-label="`${ref.source} ${link.criterion}`"
                >{{ link.criterion }}</a
              >
            </span>
          </div>
        </li>
      </ul>
    </section>

    <section
      v-if="references.length"
      class="a11y-refs"
      :aria-labelledby="refsLabelId"
    >
      <p
        :id="refsLabelId"
        class="a11y-group-title"
      >
        References
      </p>
      <ul class="a11y-refs-list">
        <li
          v-for="(reference, i) in references"
          :key="i"
          class="a11y-ref"
          v-html="parseInlineMarkdown(reference)"
        />
      </ul>
    </section>
  </div>
</template>

<style>
/* Plain (unscoped, unlayered) rules on purpose, all anchored on `.a11y` so they
   outrank the unlayered `.vp-doc p/ul/li/a/code` rules. The table is not a
   `.vp-raw` block: the snippet slots hold regular VitePress code blocks, whose
   styles (and copy button) `postcssIsolateStyles` strips inside `.vp-raw`. */
.a11y {
  margin: 16px 0 24px;
}

.a11y .a11y-group + .a11y-group,
.a11y .a11y-refs {
  margin-top: 28px;
}

.a11y .a11y-group-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.a11y .a11y-group-title {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.a11y .a11y-group-count {
  margin-left: 6px;
  font-size: 0.75rem;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
}

.a11y .a11y-group-hint {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.a11y .a11y-rows,
.a11y .a11y-refs-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.a11y .a11y-row {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  column-gap: 12px;
  margin: 0;
  padding: 12px 0;
}

.a11y .a11y-row + .a11y-row {
  border-top: 1px solid var(--vp-c-divider);
}

.a11y .a11y-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

/* One checkbox, two states: the same ring is empty for "Your part" and filled
   with a check for "Built in" — same size, stroke and color. */
.a11y .a11y-mark {
  box-shadow: inset 0 0 0 2px var(--vp-c-brand-1);
}

.a11y [data-owner='builtin'] .a11y-mark {
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.a11y .a11y-body {
  min-width: 0;
}

.a11y .a11y-body p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.a11y .a11y-body .a11y-name {
  font-weight: 600;
  line-height: 22px;
  color: var(--vp-c-text-1);
}

.a11y .a11y-body .a11y-description {
  color: var(--vp-c-text-2);
}

.a11y .a11y-name + .a11y-description {
  margin-top: 2px;
}

/* A rule without a name: the description is the headline, aligned on the mark. */
.a11y .a11y-body .a11y-description:first-child {
  line-height: 22px;
}

.a11y [data-owner='yours'] .a11y-description {
  color: var(--vp-c-text-1);
}

.a11y .a11y-body .a11y-note {
  margin-top: 4px;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

/* Optional snippet, folded by default so the checklist still scans. */
.a11y .a11y-code {
  margin-top: 6px;
}

.a11y .a11y-code summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  list-style: none;
}

.a11y .a11y-code summary::-webkit-details-marker {
  display: none;
}

.a11y .a11y-code summary::after {
  content: '';
  width: 0.4em;
  height: 0.4em;
  margin-left: 2px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-1px) rotate(-45deg);
  transition: transform 0.15s;
}

.a11y .a11y-code[open] summary::after {
  transform: translateY(-3px) rotate(45deg);
}

.a11y .a11y-code summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
  border-radius: 2px;
}

/* The snippet is a regular VitePress code block (Shiki, copy button, lang
   label) passed through a named slot; only its outer spacing changes here. */
.a11y .a11y-code div[class*='language-'] {
  margin: 8px 0 0;
  border-radius: 8px;
}

@media (prefers-reduced-motion: reduce) {
  .a11y .a11y-code summary::after {
    transition: none;
  }
}

.a11y .a11y-body a,
.a11y .a11y-ref a {
  font-weight: 500;
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.a11y .a11y-criteria {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-top: 4px;
}

.a11y .a11y-criteria-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}

.a11y .a11y-criteria-source {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--vp-c-text-3);
}

.a11y .a11y-criterion {
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

.a11y .a11y-criterion:hover {
  text-decoration-color: var(--vp-c-brand-1);
}

.a11y .a11y-refs .a11y-group-title {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.a11y .a11y-ref {
  margin: 0;
  padding: 10px 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.a11y .a11y-ref + .a11y-ref {
  border-top: 1px solid var(--vp-c-divider);
}

.a11y .a11y-ref a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.a11y .a11y-ref a:hover {
  color: var(--vp-c-text-1);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .a11y .a11y-row {
    grid-template-columns: 22px minmax(0, 1fr);
  }

  .a11y .a11y-criteria {
    grid-column: 2;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 14px;
    padding-top: 8px;
  }

  .a11y .a11y-group-hint {
    display: none;
  }
}
</style>
