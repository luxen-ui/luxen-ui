<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = [];
  let remaining = text;
  const regex = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(remaining.slice(lastIndex, match.index)));
    }
    if (match[1] !== undefined) {
      parts.push(`<code>${escapeHtml(match[1])}</code>`);
    } else {
      parts.push(`<a href="${match[3]}">${escapeHtml(match[2])}</a>`);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    parts.push(escapeHtml(remaining.slice(lastIndex)));
  }
  return parts.join('');
};

const columns = props.data.length > 0 ? Object.keys(props.data[0]) : [];
const nameKey = columns[0];
const descKey = columns.find((c) => c === 'Description') || columns[1];
</script>

<template>
  <dl class="vp-raw api-list">
    <div
      v-for="(row, i) in data"
      :key="i"
      class="api-list-item"
    >
      <dt>
        <code>{{ row[nameKey] }}</code>
        <span
          v-if="nameKey"
          class="api-list-label"
          >{{ nameKey }}</span
        >
      </dt>
      <dd
        v-if="row[descKey]"
        v-html="parseInlineMarkdown(row[descKey])"
      />
    </div>
  </dl>
</template>
