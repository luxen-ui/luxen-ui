<script setup>
import { computed } from 'vue';
import metadata from 'luxen-ui/metadata' with { type: 'json' };

// Two modes:
//   <ApiTable element="dialog" section="cssProperties" />   ← reads luxen-ui metadata (preferred)
//   <ApiTable :data="[{ Name, Description }]" />            ← legacy inline rows (being migrated out)
const props = defineProps({
  element: { type: String, default: null },
  section: { type: String, default: null },
  data: { type: Array, default: null },
});

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = [];
  const remaining = text;
  const regex = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) parts.push(escapeHtml(remaining.slice(lastIndex, match.index)));
    if (match[1] !== undefined) parts.push(`<code>${escapeHtml(match[1])}</code>`);
    else parts.push(`<a href="${match[3]}">${escapeHtml(match[2])}</a>`);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < remaining.length) parts.push(escapeHtml(remaining.slice(lastIndex)));
  return parts.join('');
};

// --- Metadata mode: turn a section array into uniform display rows ----------
// Each row: { name, label, annotations: string[], description }
const SECTION_LABEL = {
  properties: 'Property',
  attributes: 'Attribute',
  events: 'Event',
  methods: 'Method',
  slots: 'Slot',
  cssClasses: 'Class',
  cssParts: 'Part',
  cssProperties: 'Custom property',
  commands: 'Command',
};

function sectionToRows(section, items) {
  return items.map((it) => {
    const annotations = [];
    let name = it.name;
    let description = it.description ?? '';

    // Each annotation is { label?, value? }: `value` renders as a code chip,
    // `label` as muted inline text (e.g. "default:" before the chip).
    if (section === 'properties') {
      name = it.attribute ?? it.name;
      if (it.type) annotations.push({ value: it.type });
      if (it.default != null && it.default !== "''")
        annotations.push({ label: 'default:', value: it.default });
    } else if (section === 'attributes') {
      if (it.values?.length) annotations.push({ value: it.values.join(' | ') });
    } else if (section === 'cssProperties') {
      if (it.default != null) annotations.push({ label: 'default:', value: it.default });
    } else if (section === 'methods') {
      const sig = (it.params ?? []).map((p) => `${p.name}: ${p.type ?? 'unknown'}`).join(', ');
      name = `${it.name}(${sig})`;
      if (it.returns) annotations.push({ label: '→', value: it.returns });
    } else if (section === 'slots') {
      if (name === '') name = '(default)';
    } else if (section === 'events') {
      if (it.cancelable) annotations.push({ label: 'cancelable' });
    }
    return { name, label: SECTION_LABEL[section] ?? section, annotations, description };
  });
}

const rows = computed(() => {
  if (props.element && props.section) {
    const el = metadata.elements.find((e) => e.name === props.element);
    const items = el?.[props.section] ?? [];
    return sectionToRows(props.section, items);
  }
  // Legacy inline data: first column is the name, a `Description` column the prose.
  if (Array.isArray(props.data)) {
    return props.data
      .map((row) => {
        const keys = Object.keys(row);
        const nameKey = keys[0];
        const descKey = keys.find((c) => c === 'Description') ?? keys[1];
        return { name: row[nameKey], label: nameKey, annotations: [], description: row[descKey] };
      })
      .filter((r) => r.name != null && r.name !== '');
  }
  return [];
});
</script>

<template>
  <dl class="vp-raw api-list">
    <div
      v-for="(row, i) in rows"
      :key="i"
      class="api-list-item"
    >
      <dt>
        <code>{{ row.name }}</code>
        <span
          v-for="(a, j) in row.annotations"
          :key="j"
          class="api-list-annotation"
        >
          <span
            v-if="a.label"
            class="api-list-annotation-label"
            >{{ a.label }}</span
          >
          <code v-if="a.value">{{ a.value }}</code>
        </span>
        <span class="api-list-label">{{ row.label }}</span>
      </dt>
      <dd
        v-if="row.description"
        v-html="parseInlineMarkdown(row.description)"
      />
    </div>
  </dl>
</template>
