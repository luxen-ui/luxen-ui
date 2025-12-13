
<script setup>
import manifest from '@luxen-ui/elements/dist/custom-elements.json'
import { computed } from 'vue'
import { useData } from 'vitepress'
import InlineCode from './InlineCode.vue'

const props = defineProps({
  tagName: String,
  data: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Array,
    default: () => []
  },
})

// Use VitePress's markdown renderer
const { site } = useData()

// Simple markdown inline parser for code backticks
const parseInlineMarkdown = (text) => {
  if (!text) return ''
  // Convert backticks to <code> tags
  return text.replace(/`([^`]+)`/g, '<code>$1</code>')
}

const cssProperties = computed(() => {
  if (props.data.length > 0) {
    return props.data
  }

  // Find the source TypeScript module (not the built/minified version)
  const componentName = props.tagName.replace('l-', '').replace('lx-', '')
  const module = manifest.modules.find(module =>
    module.path.startsWith('src/') && module.path.includes(`/${componentName}/`)
  )

  if (!module) {
    console.error(`Module not found for tag-name: ${props.tagName}`)
    return []
  }

  const classDeclaration = module.declarations.find(declaration => declaration.kind === 'class')

  if (!classDeclaration) {
    console.error(`Class declaration not found in module: ${module.path}`)
    return []
  }

  return (classDeclaration.cssProperties || [])
    .filter(member => props.filter.length > 0 ? props.filter.includes(member.name) : true)

})
</script>

<template>
  <table class="vp-raw component-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="{ name, description } in cssProperties" :key="name">
        <td><InlineCode>{{ name }}</InlineCode></td>
        <td class="description" v-html="parseInlineMarkdown(description)" />
      </tr>
    </tbody>
  </table>
</template>
