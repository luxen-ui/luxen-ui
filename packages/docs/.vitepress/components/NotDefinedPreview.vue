<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';
import tokensCss from 'luxen-ui/css/tokens?raw';

const props = defineProps({
  css: { type: String, required: true },
  html: { type: String, required: true },
  height: { type: [Number, String], default: 150 },
  direction: { type: String, default: 'row' },
});

const { isDark } = useData();

// Inline the full Luxen token sheet so every --l-* custom property resolves
// inside the isolated iframe (an iframe srcdoc does not inherit the parent's
// CSS variables). Dark mode is driven by `color-scheme` + the tokens' own
// light-dark() values, so no hand-maintained variable list is needed.
const srcdoc = computed(
  () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
${tokensCss}
:root {
  color-scheme: ${isDark.value ? 'dark' : 'light'};
}
${props.css}
html, body {
  margin: 0;
  height: 100%;
}
body {
  padding: 24px 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: transparent;
  color: light-dark(#172b4d, #e6edf3);
  display: flex;
  flex-direction: ${props.direction};
  flex-wrap: ${props.direction === 'column' ? 'nowrap' : 'wrap'};
  align-items: ${props.direction === 'column' ? 'flex-start' : 'center'};
  gap: 16px;
  box-sizing: border-box;
}
</style>
</head>
<body>${props.html}</body>
</html>`,
);
</script>

<template>
  <iframe
    :srcdoc="srcdoc"
    class="vp-raw component-wrapper bg-surface-sunken w-full border-0"
    scrolling="no"
    :height="height"
  />
</template>
